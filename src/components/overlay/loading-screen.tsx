import { useEffect, useState } from "react";
import { LOADING_STAGES } from "@/lib/experience/architecture";
import { useExperienceStore } from "@/lib/experience/store";

export function LoadingScreen() {
  const phase = useExperienceStore((s) => s.phase);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const [stage, setStage] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (phase !== "loading") return;
    const step = reducedMotion ? 140 : 480;
    const id = window.setInterval(() => {
      setStage((s) => {
        const next = s + 1;
        if (next >= LOADING_STAGES.length) window.clearInterval(id);
        return Math.min(LOADING_STAGES.length, next);
      });
    }, step);
    return () => window.clearInterval(id);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "loading") return;
    if (stage < LOADING_STAGES.length) return;
    const t = window.setTimeout(() => setLeaving(true), reducedMotion ? 60 : 380);
    const t2 = window.setTimeout(
      () => {
        if (useExperienceStore.getState().phase === "loading") {
          useExperienceStore.getState().setPhase("intro");
        }
      },
      reducedMotion ? 100 : 820,
    );
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [stage, phase, reducedMotion]);

  if (phase !== "loading" && !leaving) return null;

  const visible = phase === "loading" && !leaving;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg px-6"
      style={{
        opacity: visible ? 1 : 0,
        transition: reducedMotion ? "none" : "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: phase === "loading" ? "auto" : "none",
      }}
      aria-live="polite"
      aria-busy={phase === "loading"}
    >
      <p className="kicker mb-8">System boot</p>
      <h1 className="text-center font-sans text-[clamp(2.4rem,8vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.04em] text-fg text-balance">
        UPI
        <span className="block text-muted">on AWS</span>
      </h1>
      <div className="mt-10 flex w-full max-w-sm gap-1.5">
        {LOADING_STAGES.map((_, i) => (
          <div key={i} className="loader-seg" data-on={stage > i ? "true" : "false"} />
        ))}
      </div>
      <p className="tabular mt-5 text-[11px] tracking-[0.18em] text-muted uppercase">
        {stage >= LOADING_STAGES.length
          ? "System ready"
          : LOADING_STAGES[Math.min(stage, LOADING_STAGES.length - 1)]}
      </p>
      <button
        type="button"
        className="ctl mt-10"
        onClick={() => useExperienceStore.getState().setPhase("intro")}
      >
        Enter
      </button>
    </div>
  );
}
