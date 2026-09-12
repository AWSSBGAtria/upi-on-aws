import { useState } from "react";
import { Crosshair, Pause, Play, RotateCcw, Sliders } from "lucide-react";
import { NODES, PAYMENT_HOPS } from "@/lib/experience/architecture";
import { runtime } from "@/lib/experience/runtime";
import { useExperienceStore } from "@/lib/experience/store";

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

export function MotionTrackingHud() {
  const [collapsed, setCollapsed] = useState(false);
  const ui = useExperienceStore((s) => s.uiRevealed);
  const sim = useExperienceStore((s) => s.simMode);
  const tx = useExperienceStore((s) => s.tx);
  const simPaused = useExperienceStore((s) => s.simPaused);
  const simSpeed = useExperienceStore((s) => s.simSpeed);
  const motionTracking = useExperienceStore((s) => s.motionTracking);

  const toggleSimPaused = useExperienceStore((s) => s.toggleSimPaused);
  const setSimSpeed = useExperienceStore((s) => s.setSimSpeed);
  const toggleMotionTracking = useExperienceStore((s) => s.toggleMotionTracking);
  const jumpToHop = useExperienceStore((s) => s.jumpToHop);
  const replaySim = useExperienceStore((s) => s.replaySim);

  if (!ui) return null;
  const isSimActive = sim === "payment" || sim === "trace" || tx.status !== "IDLE";
  if (!isSimActive) return null;

  const hopsCount = PAYMENT_HOPS.length;
  const currentHopIndex = Math.min(
    hopsCount - 1,
    Math.floor(runtime.heroT * (hopsCount - 0.001)),
  );
  const currentNodeId = PAYMENT_HOPS[currentHopIndex] ?? "client";
  const currentNode = NODES[currentNodeId];
  const progressPercent = Math.round(runtime.heroT * 100);
  const isFinished = progressPercent >= 100 || tx.status === "CONFIRMED";

  return (
    <section
      aria-label="Payment motion tracking and playback controls"
      className="hit hud-panel absolute top-16 left-1/2 z-30 w-[min(calc(100vw-1.5rem),760px)] -translate-x-1/2 p-3.5 transition-all duration-200"
    >
      {/* Top Header Row: Status & Main Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center size-3">
            <span
              className={`absolute inline-flex size-full rounded-full opacity-75 ${
                isFinished
                  ? "bg-ok"
                  : simPaused
                    ? "bg-amber-400"
                    : "animate-ping bg-aws"
              }`}
            />
            <span
              className={`relative inline-flex size-2 rounded-full ${
                isFinished ? "bg-ok" : simPaused ? "bg-amber-400" : "bg-aws"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker">Motion Tracking</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isFinished
                    ? "bg-ok/15 text-ok"
                    : simPaused
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-aws/15 text-aws"
                }`}
              >
                {isFinished ? "CONFIRMED" : simPaused ? "PAUSED" : "TRACKING"}
              </span>
            </div>
            <p className="text-[13px] font-medium text-fg truncate max-w-[240px] sm:max-w-[340px]">
              {currentNode.aws} · {currentNode.name}
            </p>
          </div>
        </div>

        {/* Playback action controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Play/Pause Button */}
          <button
            type="button"
            className="ctl flex items-center gap-1.5 px-3"
            data-active={!simPaused ? "true" : "false"}
            onClick={toggleSimPaused}
            title={simPaused ? "Play simulation (Space)" : "Pause simulation (Space)"}
          >
            {simPaused ? (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="size-3.5 fill-current" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            className="ctl flex items-center gap-1.5 px-2.5"
            onClick={replaySim}
            title="Replay payment simulation from start"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          {/* Motion Follow Camera Toggle */}
          <button
            type="button"
            className="ctl flex items-center gap-1.5 px-2.5"
            data-active={motionTracking ? "true" : "false"}
            onClick={toggleMotionTracking}
            title="Lock camera to follow the payment packet along services"
          >
            <Crosshair className="size-3.5" />
            <span className="hidden md:inline">
              Follow {motionTracking ? "ON" : "OFF"}
            </span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            className="ctl px-2"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand motion tracking details" : "Collapse to mini bar"}
          >
            <Sliders className="size-3.5" />
          </button>
        </div>
      </div>

      {!collapsed ? (
        <>
          {/* Speed Controls & Telemetry Row */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className="kicker mr-1">Speed:</span>
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  className="ctl py-1 px-2 min-h-[30px] text-[10px]"
                  data-active={simSpeed === speed ? "true" : "false"}
                  onClick={() => setSimSpeed(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-muted">
              <span>
                Lat: <span className="text-fg tabular">{tx.latency} ms</span>
              </span>
              <span>
                Elapsed: <span className="text-fg tabular">{tx.elapsed} ms</span>
              </span>
              <span>
                Path: <span className="text-aws tabular">{progressPercent}%</span>
              </span>
            </div>
          </div>

          {/* Hop Trail & Stepper */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-muted mb-1.5">
              <span className="kicker">Service Hops</span>
              <span className="text-[11px] text-muted">
                Click any service to jump tracking
              </span>
            </div>

            {/* Scrollable Hops Sequence */}
            <div className="overflow-x-auto pb-1.5">
              <div className="flex items-center gap-1 min-w-max">
                {PAYMENT_HOPS.map((hopId, index) => {
                  const node = NODES[hopId];
                  const isCurrent = currentHopIndex === index;
                  const isPast = currentHopIndex > index || isFinished;
                  return (
                    <button
                      key={`${hopId}-${index}`}
                      type="button"
                      className={`group relative flex flex-col items-center justify-center p-1.5 rounded text-center transition-all min-w-[56px] ${
                        isCurrent
                          ? "bg-aws text-[#140c00] font-semibold ring-2 ring-aws/50"
                          : isPast
                            ? "bg-surface-2/80 text-fg hover:bg-surface-2"
                            : "bg-surface/40 text-muted/60 hover:text-fg hover:bg-surface-2/60"
                      }`}
                      onClick={() => jumpToHop(index)}
                      title={`Jump to ${node.aws} (${node.name})`}
                    >
                      <span className="text-[9px] font-mono tracking-wider opacity-80">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-medium truncate max-w-[52px]">
                        {node.aws.split(" ")[0]}
                      </span>
                      {isCurrent ? (
                        <span className="absolute -bottom-1 size-1.5 rounded-full bg-aws shadow-sm" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Continuous Progress Indicator Bar */}
            <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-gradient-to-r from-data via-aws to-ok transition-all duration-100 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>

          {/* Current Node Role Description */}
          <div className="mt-2.5 rounded bg-surface/50 p-2 text-[11px] text-muted flex items-start justify-between gap-2 border border-line">
            <div>
              <span className="font-medium text-fg mr-1.5">{currentNode.name}:</span>
              <span>{currentNode.role}</span>
            </div>
            {runtime.heroEncrypted ? (
              <span className="shrink-0 font-mono text-[10px] text-obs bg-obs/10 px-1.5 py-0.5 rounded">
                KMS Encrypted
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
