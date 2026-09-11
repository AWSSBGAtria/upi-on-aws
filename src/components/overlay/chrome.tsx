import {
  Activity,
  Expand,
  HelpCircle,
  Menu,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
} from "lucide-react";
import { NODES, STORY } from "@/lib/experience/architecture";
import { blip, setAmbient } from "@/lib/experience/audio";
import { useExperienceStore } from "@/lib/experience/store";
import type { NavId, SimMode, ViewId } from "@/lib/experience/types";

const NAV: { id: NavId; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "simulate", label: "Simulate" },
  { id: "architecture", label: "Architecture" },
  { id: "about", label: "About" },
];

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "payment", label: "Payment flow" },
  { id: "security", label: "Security" },
  { id: "data", label: "Data layer" },
  { id: "observability", label: "Observability" },
  { id: "ha", label: "High availability" },
];

const SIMS: { id: SimMode; label: string }[] = [
  { id: "payment", label: "Simulate payment" },
  { id: "high-traffic", label: "High traffic" },
  { id: "failure", label: "Failure test" },
  { id: "trace", label: "Trace transaction" },
];

export function TopBar() {
  const ui = useExperienceStore((s) => s.uiRevealed);
  const nav = useExperienceStore((s) => s.nav);
  const menu = useExperienceStore((s) => s.mobileMenu);
  if (!ui) return null;
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-4 pt-4">
      <div className="hit">
        <p className="text-[13px] font-medium tracking-[0.22em] text-fg uppercase">UPI on AWS</p>
        <span className="mt-1 block h-[2px] w-8 bg-aws" />
      </div>
      <nav className="hit hidden items-center gap-1 md:flex" aria-label="Primary">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            className="ctl"
            data-active={nav === n.id ? "true" : "false"}
            onClick={() => useExperienceStore.getState().setNav(n.id)}
          >
            {n.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        className="hit ctl md:hidden"
        aria-label={menu ? "Close menu" : "Open menu"}
        onClick={() => useExperienceStore.getState().setMobileMenu(!menu)}
      >
        {menu ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
    </header>
  );
}

export function MobileMenu() {
  const menu = useExperienceStore((s) => s.mobileMenu);
  const nav = useExperienceStore((s) => s.nav);
  if (!menu) return null;
  return (
    <div className="hit hud-panel absolute top-16 right-4 left-4 z-40 p-3 md:hidden">
      <div className="grid grid-cols-2 gap-1">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            className="ctl"
            data-active={nav === n.id ? "true" : "false"}
            onClick={() => useExperienceStore.getState().setNav(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>
      <p className="kicker mt-3 mb-1">Simulate</p>
      <div className="grid grid-cols-2 gap-1">
        {SIMS.map((s) => (
          <SimButton key={s.id} id={s.id} label={s.label} />
        ))}
      </div>
    </div>
  );
}

function SimButton({ id, label }: { id: SimMode; label: string }) {
  const mode = useExperienceStore((s) => s.simMode);
  return (
    <button
      type="button"
      className="ctl ctl-aws"
      data-testid={`sim-${id}`}
      data-active={mode === id ? "true" : "false"}
      onClick={() => {
        blip("click");
        useExperienceStore.getState().setSim(id);
      }}
    >
      {label}
    </button>
  );
}

export function BottomBar() {
  const ui = useExperienceStore((s) => s.uiRevealed);
  const view = useExperienceStore((s) => s.view);
  const nav = useExperienceStore((s) => s.nav);
  const audio = useExperienceStore((s) => s.audioOn);
  const perf = useExperienceStore((s) => s.performanceMode);
  const cost = useExperienceStore((s) => s.costView);
  if (!ui) return null;

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="hit hidden flex-wrap gap-1 md:flex">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className="ctl"
              data-testid={`view-${v.id}`}
              data-active={view === v.id ? "true" : "false"}
              onClick={() => useExperienceStore.getState().setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
        {nav === "simulate" ? (
          <div className="hit flex flex-wrap gap-1">
            {SIMS.map((s) => (
              <SimButton key={s.id} id={s.id} label={s.label} />
            ))}
          </div>
        ) : (
          <div className="hit flex flex-wrap gap-1">
            <SimButton id="payment" label="Simulate payment" />
            <button
              type="button"
              className="ctl"
              onClick={() => useExperienceStore.getState().setNav("simulate")}
            >
              More sims
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="hit flex gap-1">
          <span className="ctl pointer-events-none flex items-center gap-1.5">
            <Activity className="size-3.5" /> Orbit
          </span>
          <span className="ctl pointer-events-none hidden items-center gap-1.5 sm:flex">
            <ZoomIn className="size-3.5" /> Zoom
          </span>
          <button
            type="button"
            className="ctl flex items-center gap-1.5"
            onClick={() => useExperienceStore.getState().resetView()}
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
          <button
            type="button"
            className="ctl hidden items-center gap-1.5 sm:flex"
            onClick={() => {
              const el = document.documentElement;
              if (!document.fullscreenElement) void el.requestFullscreen?.();
              else void document.exitFullscreen?.();
            }}
          >
            <Expand className="size-3.5" /> Fullscreen
          </button>
        </div>
        <div className="hit flex gap-1">
          <button
            type="button"
            className="ctl"
            data-active={cost ? "true" : "false"}
            onClick={() => useExperienceStore.getState().toggleCost()}
          >
            Cost
          </button>
          <button
            type="button"
            className="ctl"
            data-active={perf ? "true" : "false"}
            onClick={() => useExperienceStore.getState().togglePerf()}
          >
            Performance
          </button>
          <button
            type="button"
            className="ctl"
            aria-label={audio ? "Mute ambient audio" : "Enable ambient audio"}
            onClick={() => {
              const next = !useExperienceStore.getState().audioOn;
              useExperienceStore.getState().toggleAudio();
              void setAmbient(next);
              blip("click");
            }}
          >
            {audio ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>
          <button
            type="button"
            className="ctl"
            aria-label="Keyboard help"
            onClick={() => useExperienceStore.getState().setHelpOpen(!useExperienceStore.getState().helpOpen)}
          >
            <HelpCircle className="size-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export function StoryRail() {
  const ui = useExperienceStore((s) => s.uiRevealed);
  const i = useExperienceStore((s) => s.storyIndex);
  if (!ui) return null;
  return (
    <nav
      className="hit absolute top-1/2 left-3 z-20 hidden -translate-y-1/2 flex-col gap-1 lg:flex"
      aria-label="Narrative sections"
    >
      {STORY.map((b) => (
        <button
          key={b.index}
          type="button"
          className="ctl px-2 py-2"
          data-active={i === b.index ? "true" : "false"}
          aria-label={b.title}
          onClick={() => useExperienceStore.getState().setStory(b.index)}
        >
          {String(b.index).padStart(2, "0")}
        </button>
      ))}
    </nav>
  );
}

export function HoverTip() {
  const hovered = useExperienceStore((s) => s.hovered);
  const selected = useExperienceStore((s) => s.selected);
  const cost = useExperienceStore((s) => s.costView);
  if (!hovered || hovered === selected) return null;
  const n = NODES[hovered];
  return (
    <div className="pointer-events-none absolute top-20 left-1/2 z-20 -translate-x-1/2 text-center">
      <p className="kicker">{n.aws}</p>
      <p className="text-[13px] text-fg">{n.name}</p>
      {cost ? <p className="text-[11px] text-muted">{n.costLabel} · illustrative</p> : null}
    </div>
  );
}
