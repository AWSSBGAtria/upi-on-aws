import { X } from "lucide-react";
import { NODE_LIST, NODES, STORY } from "@/lib/experience/architecture";
import { useExperienceStore } from "@/lib/experience/store";
import { ACCENT } from "@/lib/experience/architecture";

export function ComponentPanel() {
  const selected = useExperienceStore((s) => s.selected);
  const costView = useExperienceStore((s) => s.costView);
  const tx = useExperienceStore((s) => s.tx);
  if (!selected) return null;
  const n = NODES[selected];
  const accent = ACCENT[n.color];
  return (
    <aside
      className="hit hud-panel absolute top-20 right-4 z-30 max-h-[min(72vh,640px)] w-[min(calc(100vw-2rem),340px)] overflow-y-auto p-4"
      role="dialog"
      aria-label={`${n.name} details`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="kicker" style={{ color: accent }}>
            {n.layer}
          </p>
          <h2 className="mt-1 text-[22px] leading-tight font-medium tracking-[-0.03em] text-balance">{n.name}</h2>
        </div>
        <button
          type="button"
          className="ctl px-2"
          onClick={() => useExperienceStore.getState().select(null)}
          aria-label="Close component panel"
        >
          <X className="size-4" />
        </button>
      </div>
      <Spec label="Role" value={n.role} />
      <Spec label="Behavior" value={n.behavior} />
      <Spec label="Scaling" value={n.scaling} />
      <Spec label="Connected" value={n.connected.join(" · ")} />
      <Spec label="Latency" value={n.latency} mono />
      <Spec label="Simulation" value={tx.status === "IDLE" ? "Idle" : "Active"} mono />
      {costView ? (
        <Spec label="Cost view" value={`${n.costLabel} — ${n.costNote}`} />
      ) : null}
    </aside>
  );
}

function Spec({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-t border-line py-2.5">
      <p className="kicker mb-1">{label}</p>
      <p className={`text-[13px] leading-relaxed text-pretty text-fg ${mono ? "tabular" : ""}`}>{value}</p>
    </div>
  );
}

export function AboutPanel() {
  const nav = useExperienceStore((s) => s.nav);
  if (nav !== "about") return null;
  return (
    <aside className="hit hud-panel absolute top-20 right-4 z-30 w-[min(calc(100vw-2rem),380px)] p-5">
      <p className="kicker mb-2">Why this exists</p>
      <h2 className="text-[26px] leading-tight font-medium tracking-[-0.03em] text-balance">
        Make the invisible spatial.
      </h2>
      <div className="mt-4 space-y-3 text-[13px] leading-relaxed text-pretty text-muted">
        <p>
          UPI is one of the largest real-time payment systems ever built. Its shape — edge, identity, queue,
          ledger, observe — is the shape of every serious distributed system.
        </p>
        <p>
          This is not a product, and it is not the real UPI. It is an architectural visualization of what that
          rail could look like if every layer were expressed as AWS primitives.
        </p>
      </div>
      <ul className="mt-5 space-y-2 text-[12px] text-fg">
        <li className="flex justify-between gap-4 border-t border-line pt-2">
          <span className="kicker">Model</span>
          <span>Interactive 3D architecture</span>
        </li>
        <li className="flex justify-between gap-4 border-t border-line pt-2">
          <span className="kicker">Flows</span>
          <span>Animated transaction paths</span>
        </li>
        <li className="flex justify-between gap-4 border-t border-line pt-2">
          <span className="kicker">Mapping</span>
          <span>AWS service equivalents</span>
        </li>
        <li className="flex justify-between gap-4 border-t border-line pt-2">
          <span className="kicker">Scope</span>
          <span>High-level topology, simulated</span>
        </li>
      </ul>
      <button
        type="button"
        className="ctl mt-5 w-full"
        onClick={() => useExperienceStore.getState().setNav("explore")}
      >
        Return to model
      </button>
    </aside>
  );
}

export function ArchitectureDrawer() {
  const nav = useExperienceStore((s) => s.nav);
  const selected = useExperienceStore((s) => s.selected);
  const costView = useExperienceStore((s) => s.costView);
  const storyIndex = useExperienceStore((s) => s.storyIndex);
  if (nav !== "architecture") return null;
  return (
    <aside className="hit hud-panel absolute top-20 right-4 z-30 max-h-[min(74vh,720px)] w-[min(calc(100vw-2rem),360px)] overflow-y-auto p-4">
      <p className="kicker mb-2">Architecture</p>
      <h2 className="text-[20px] font-medium tracking-[-0.03em]">Components & narrative</h2>
      <div className="mt-4 flex flex-col gap-1">
        {STORY.map((b) => (
          <button
            key={b.index}
            type="button"
            className="ctl w-full text-left"
            data-active={storyIndex === b.index ? "true" : "false"}
            onClick={() => useExperienceStore.getState().setStory(b.index)}
          >
            {b.kicker} — {b.title}
          </button>
        ))}
      </div>
      <p className="kicker mt-5 mb-2">Nodes</p>
      <ul className="space-y-0.5">
        {NODE_LIST.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className="ctl w-full text-left normal-case tracking-normal"
              data-active={selected === n.id ? "true" : "false"}
              onClick={() => useExperienceStore.getState().select(n.id)}
            >
              <span className="block text-[11px] tracking-[0.14em] uppercase">{n.aws}</span>
              <span className="block text-[12px] text-muted normal-case">{n.role.slice(0, 72)}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ctl mt-4 w-full"
        data-active={costView ? "true" : "false"}
        onClick={() => useExperienceStore.getState().toggleCost()}
      >
        Cost view {costView ? "on" : "off"}
      </button>
      <p className="mt-2 text-[10px] text-faint">Cost figures are illustrative / simulated.</p>
    </aside>
  );
}

export function HelpPanel() {
  const open = useExperienceStore((s) => s.helpOpen);
  if (!open) return null;
  return (
    <aside className="hit hud-panel absolute bottom-24 right-4 z-30 w-[min(calc(100vw-2rem),300px)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="kicker">Keys</p>
        <button type="button" className="ctl px-2" onClick={() => useExperienceStore.getState().setHelpOpen(false)}>
          <X className="size-3.5" />
        </button>
      </div>
      <ul className="tabular space-y-1 text-[12px] text-muted">
        <li>Drag — orbit</li>
        <li>Scroll — zoom / story</li>
        <li>Click — inspect</li>
        <li>1–6 — camera views</li>
        <li>Space — simulate payment</li>
        <li>H — high traffic</li>
        <li>F — failure test</li>
        <li>T — trace</li>
        <li>C — cost view</li>
        <li>P — performance</li>
        <li>Esc — deselect / close</li>
      </ul>
    </aside>
  );
}

export function TransactionConsole() {
  const tx = useExperienceStore((s) => s.tx);
  const sim = useExperienceStore((s) => s.simMode);
  const ui = useExperienceStore((s) => s.uiRevealed);
  if (!ui) return null;
  if (sim === "idle" && tx.status === "IDLE") return null;
  return (
    <aside className="hit hud-panel absolute right-4 bottom-24 z-20 w-[min(calc(100vw-2rem),320px)] p-3">
      <p className="kicker mb-2">Live transaction</p>
      <p className="tabular text-[15px] text-fg">{tx.id}</p>
      <p className="tabular mt-1 text-[11px] tracking-[0.16em] text-data uppercase">{tx.status}</p>
      <dl className="mt-3 space-y-1 text-[11px]">
        <Row k="Request" v={tx.requestId} />
        <Row k="Region" v={tx.region} />
        <Row k="AZ" v={tx.az} />
        <Row k="Latency" v={`${tx.latency} ms`} />
        <Row k="Elapsed" v={`${tx.elapsed} ms`} />
      </dl>
      {tx.services.length ? (
        <p className="mt-3 text-[11px] leading-relaxed text-muted">{tx.services.join(" → ")}</p>
      ) : null}
      <p className="mt-2 text-[10px] text-faint">Visualization only. Not a real UPI transaction.</p>
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="kicker">{k}</dt>
      <dd className="tabular text-fg">{v}</dd>
    </div>
  );
}

export function StoryCaption() {
  const i = useExperienceStore((s) => s.storyIndex);
  const ui = useExperienceStore((s) => s.uiRevealed);
  const explore = useExperienceStore((s) => s.exploreEnabled);
  if (!ui || i < 1) return null;
  const beat = STORY[i - 1];
  if (!beat) return null;
  if (explore && i === 0) return null;
  return (
    <div className="hit pointer-events-none absolute bottom-24 left-1/2 z-20 hidden w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 text-center md:block">
      <p className="kicker">{beat.kicker}</p>
      <h2 className="mt-1 text-[28px] font-medium tracking-[-0.03em]">{beat.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-pretty text-muted">{beat.body}</p>
    </div>
  );
}

export function TitleOverlay() {
  const phase = useExperienceStore((s) => s.phase);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  if (phase !== "title") return null;
  return (
    <div
      className="hit absolute inset-0 z-40 flex flex-col items-center justify-end px-6 pb-24"
      onClick={() => {
        const s = useExperienceStore.getState();
        s.setPhase("ready");
        s.setUiRevealed(true);
        s.setExplore(true);
      }}
      role="presentation"
    >
      <div className="text-center" style={{ animation: reduced ? "none" : "none" }}>
        <h1 className="font-sans text-[clamp(3.4rem,12vw,9rem)] leading-[0.82] font-medium tracking-[-0.045em] text-balance">
          UPI
          <span className="block">on AWS</span>
        </h1>
        <p className="mt-5 text-[14px] tracking-[0.08em] text-muted">If UPI Were Built Entirely on AWS</p>
        <p className="kicker mt-10">Drag to explore · Scroll to navigate · Click any component</p>
      </div>
    </div>
  );
}
