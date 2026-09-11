import { create } from "zustand";
import { NODES, STORY, VIEWS } from "./architecture";
import { flyTo } from "./camera";
import { resetRuntimeVisuals, runtime } from "./runtime";
import type {
  AzId,
  AzState,
  Metrics,
  NavId,
  NodeId,
  Phase,
  SimMode,
  TxConsole,
  ViewId,
} from "./types";

const IDLE_METRICS: Metrics = {
  rps: 420,
  active: 18,
  latency: 38,
  success: 99.97,
  queue: 12,
  compute: 24,
  errors: 0.03,
};

function newTxId() {
  return `UPI-${20000 + Math.floor(Math.random() * 70000)}`;
}

function newReqId() {
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `${hex()}${hex()}-${hex()}-${hex()}`;
}

function emptyHistory(): Record<keyof Metrics, number[]> {
  const seed = (v: number) => Array.from({ length: 32 }, () => v);
  return {
    rps: seed(420),
    active: seed(18),
    latency: seed(38),
    success: seed(99.97),
    queue: seed(12),
    compute: seed(24),
    errors: seed(0.03),
  };
}

function idleTx(): TxConsole {
  return {
    id: newTxId(),
    status: "IDLE",
    latency: 0,
    requestId: newReqId(),
    elapsed: 0,
    services: [],
    region: "ap-south-1",
    az: "ap-south-1b",
  };
}

export type ExperienceState = {
  phase: Phase;
  nav: NavId;
  simMode: SimMode;
  view: ViewId;
  storyIndex: number;
  exploreEnabled: boolean;
  selected: NodeId | null;
  hovered: NodeId | null;
  costView: boolean;
  performanceMode: boolean;
  reducedMotion: boolean;
  audioOn: boolean;
  uiRevealed: boolean;
  helpOpen: boolean;
  listOpen: boolean;
  mobileMenu: boolean;
  canvasReady: boolean;
  metrics: Metrics;
  history: Record<keyof Metrics, number[]>;
  azStatus: Record<AzId, AzState>;
  tx: TxConsole;
  setPhase: (phase: Phase) => void;
  setNav: (nav: NavId) => void;
  setSim: (mode: SimMode) => void;
  setView: (view: ViewId, cinematic?: boolean) => void;
  setStory: (index: number) => void;
  advanceStory: (dir: 1 | -1) => void;
  select: (id: NodeId | null) => void;
  setHovered: (id: NodeId | null) => void;
  toggleCost: () => void;
  togglePerf: () => void;
  toggleAudio: () => void;
  setReducedMotion: (v: boolean) => void;
  setPerformanceMode: (v: boolean) => void;
  setUiRevealed: (v: boolean) => void;
  setHelpOpen: (v: boolean) => void;
  setListOpen: (v: boolean) => void;
  setMobileMenu: (v: boolean) => void;
  setCanvasReady: (v: boolean) => void;
  setExplore: (v: boolean) => void;
  setMetrics: (m: Metrics) => void;
  setAzStatus: (az: AzId, status: AzState) => void;
  patchTx: (partial: Partial<TxConsole>) => void;
  resetTx: () => void;
  resetView: () => void;
};

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  phase: "loading",
  nav: "explore",
  simMode: "idle",
  view: "overview",
  storyIndex: 0,
  exploreEnabled: false,
  selected: null,
  hovered: null,
  costView: false,
  performanceMode: false,
  reducedMotion: false,
  audioOn: false,
  uiRevealed: false,
  helpOpen: false,
  listOpen: false,
  mobileMenu: false,
  canvasReady: false,
  metrics: { ...IDLE_METRICS },
  history: emptyHistory(),
  azStatus: { "az-1": "OPERATIONAL", "az-2": "OPERATIONAL", "az-3": "OPERATIONAL" },
  tx: idleTx(),
  setPhase: (phase) => set({ phase }),
  setNav: (nav) => {
    set({ nav, mobileMenu: false, helpOpen: false });
    if (nav === "explore") {
      get().setExplore(true);
      get().select(null);
    }
    if (nav === "about") get().select(null);
  },
  setSim: (mode) => {
    const prev = get().simMode;
    if (mode !== "idle" && mode === prev) {
      resetRuntimeVisuals();
      set({
        simMode: "idle",
        azStatus: { "az-1": "OPERATIONAL", "az-2": "OPERATIONAL", "az-3": "OPERATIONAL" },
      });
      get().resetTx();
      return;
    }
    if (mode === "idle") {
      resetRuntimeVisuals();
      set({
        simMode: "idle",
        azStatus: { "az-1": "OPERATIONAL", "az-2": "OPERATIONAL", "az-3": "OPERATIONAL" },
      });
      get().resetTx();
      return;
    }
    set({ simMode: mode, nav: "simulate" });
    if (mode === "payment" || mode === "trace") {
      set({
        tx: {
          id: newTxId(),
          status: "INITIATING",
          latency: 0,
          requestId: newReqId(),
          elapsed: 0,
          services: ["Client"],
          region: "ap-south-1",
          az: "ap-south-1b",
        },
      });
      runtime.heroActive = true;
      runtime.heroT = 0;
      runtime.heroHop = 0;
      runtime.heroEncrypted = false;
      runtime.heroAz = runtime.failedAz === "az-2" ? "az-1" : "az-2";
    }
    if (mode === "failure") {
      runtime.failedAz = "az-2";
      runtime.failureT = 0;
      set({
        azStatus: { "az-1": "OPERATIONAL", "az-2": "FAILED", "az-3": "OPERATIONAL" },
      });
    }
  },
  setView: (view, cinematic = true) => {
    set({ view, selected: null });
    runtime.focusId = null;
    const shot = VIEWS[view];
    if (cinematic) flyTo(shot.position, shot.target, get().reducedMotion ? 0.15 : 1.7);
  },
  setStory: (index) => {
    const i = Math.max(0, Math.min(STORY.length, index));
    set({ storyIndex: i, selected: null, nav: "architecture" });
    runtime.focusId = null;
    if (i === 0) return;
    const beat = STORY[i - 1];
    get().setView(beat.view, true);
    if (beat.sim) get().setSim(beat.sim);
    if (i >= 7) set({ exploreEnabled: true });
  },
  advanceStory: (dir) => {
    const cur = get().storyIndex;
    const next = Math.max(1, Math.min(7, (cur === 0 ? 1 : cur) + dir));
    get().setStory(next);
  },
  select: (id) => {
    runtime.focusId = id;
    set({ selected: id });
    if (id) {
      const { inspect } = NODES[id];
      flyTo(inspect.position, inspect.target, get().reducedMotion ? 0.2 : 1.35);
    }
  },
  setHovered: (id) => set({ hovered: id }),
  toggleCost: () => set({ costView: !get().costView }),
  togglePerf: () => set({ performanceMode: !get().performanceMode }),
  toggleAudio: () => set({ audioOn: !get().audioOn }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setPerformanceMode: (v) => set({ performanceMode: v }),
  setUiRevealed: (v) => set({ uiRevealed: v }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  setListOpen: (v) => set({ listOpen: v }),
  setMobileMenu: (v) => set({ mobileMenu: v }),
  setCanvasReady: (v) => set({ canvasReady: v }),
  setExplore: (v) => {
    set({ exploreEnabled: v });
    if (v) runtime.cameraLock = false;
  },
  setMetrics: (m) => {
    const history = { ...get().history };
    (Object.keys(m) as (keyof Metrics)[]).forEach((k) => {
      const arr = history[k].slice(-31);
      arr.push(m[k]);
      history[k] = arr;
    });
    set({ metrics: m, history });
  },
  setAzStatus: (az, status) =>
    set({ azStatus: { ...get().azStatus, [az]: status } }),
  patchTx: (partial) => set({ tx: { ...get().tx, ...partial } }),
  resetTx: () => set({ tx: idleTx() }),
  resetView: () => {
    get().select(null);
    get().setView("overview", true);
    set({ exploreEnabled: true, nav: "explore" });
  },
}));
