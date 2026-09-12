import { line as d3line, scaleLinear } from "d3";
import { useExperienceStore } from "@/lib/experience/store";
import type { Metrics } from "@/lib/experience/types";

const ROWS: { key: keyof Metrics; label: string; fmt: (n: number) => string; color: string }[] = [
  { key: "rps", label: "Requests / sec", fmt: (n) => Math.round(n).toLocaleString(), color: "#3db9ff" },
  { key: "active", label: "Active tx", fmt: (n) => Math.round(n).toString(), color: "#3db9ff" },
  { key: "latency", label: "Avg latency", fmt: (n) => `${n.toFixed(0)} ms`, color: "#ff9900" },
  { key: "success", label: "Success rate", fmt: (n) => `${n.toFixed(2)}%`, color: "#3ee0a0" },
  { key: "queue", label: "Queue depth", fmt: (n) => Math.round(n).toString(), color: "#3db9ff" },
  { key: "compute", label: "Compute inst.", fmt: (n) => Math.round(n).toString(), color: "#ff9900" },
  { key: "errors", label: "Error rate", fmt: (n) => `${n.toFixed(2)}%`, color: "#ff5a57" },
];

function Spark({ data, color }: { data: number[]; color: string }) {
  const w = 72;
  const h = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const x = scaleLinear().domain([0, data.length - 1]).range([0, w]);
  const y = scaleLinear()
    .domain([min === max ? min - 1 : min, max === min ? max + 1 : max])
    .range([h - 2, 2]);
  const d =
    d3line<number>()
      .x((_, i) => x(i))
      .y((v) => y(v))(data) ?? "";
  return (
    <svg width={w} height={h} aria-hidden="true" className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth={1.2} />
    </svg>
  );
}

export function MetricsHud() {
  const metrics = useExperienceStore((s) => s.metrics);
  const history = useExperienceStore((s) => s.history);
  const ui = useExperienceStore((s) => s.uiRevealed);

  if (!ui) return null;

  return (
    <aside
      className="hit hud-panel absolute top-20 left-4 z-20 hidden w-[260px] p-3 md:block"
      aria-label="Simulated observability metrics"
    >
      <p className="kicker mb-3">Observability</p>
      <ul className="space-y-1.5">
        {ROWS.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.12em] text-faint uppercase">{row.label}</p>
              <p className="tabular text-[13px] text-fg">{row.fmt(metrics[row.key])}</p>
            </div>
            <Spark data={history[row.key]} color={row.color} />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] leading-snug text-faint">Simulated telemetry. Not live UPI traffic.</p>
    </aside>
  );
}

export function AzStatus() {
  const az = useExperienceStore((s) => s.azStatus);
  const ui = useExperienceStore((s) => s.uiRevealed);
  if (!ui) return null;
  const items = [
    { id: "az-1" as const, label: "AZ-01" },
    { id: "az-2" as const, label: "AZ-02" },
    { id: "az-3" as const, label: "AZ-03" },
  ];
  return (
    <div className="hit hud-panel absolute bottom-32 sm:bottom-28 left-4 z-20 hidden p-3 md:block">
      <p className="kicker mb-2">Availability</p>
      <ul className="space-y-1">
        {items.map((it) => {
          const st = az[it.id];
          const color =
            st === "OPERATIONAL" ? "text-ok" : st === "RECOVERING" ? "text-aws" : "text-bad";
          return (
            <li key={it.id} className="flex items-baseline justify-between gap-6 text-[11px]">
              <span className="tabular text-muted">{it.label}</span>
              <span className={`tabular tracking-[0.12em] ${color}`}>{st}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
