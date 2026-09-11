import { HOP_STATUS, NODES, PAYMENT_HOPS } from "./architecture";
import { pulse, runtime } from "./runtime";
import { useExperienceStore } from "./store";
import type { Metrics } from "./types";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function targets(): Metrics {
  const mode = useExperienceStore.getState().simMode;
  if (mode === "high-traffic") {
    return { rps: 12840, active: 860, latency: 54, success: 99.92, queue: 226, compute: 48, errors: 0.08 };
  }
  if (mode === "failure") {
    const t = runtime.failureT;
    if (t < 2.2) return { rps: 4100, active: 220, latency: 88, success: 97.4, queue: 410, compute: 18, errors: 2.4 };
    if (t < 7) return { rps: 7200, active: 340, latency: 61, success: 99.1, queue: 160, compute: 32, errors: 0.7 };
    return { rps: 640, active: 28, latency: 41, success: 99.94, queue: 18, compute: 24, errors: 0.05 };
  }
  if (mode === "payment" || mode === "trace") {
    return { rps: 680, active: 26, latency: 34, success: 99.98, queue: 16, compute: 28, errors: 0.02 };
  }
  return { rps: 420, active: 18, latency: 38, success: 99.97, queue: 12, compute: 24, errors: 0.03 };
}

export function tickSimulation(dt: number) {
  const state = useExperienceStore.getState();
  const reduced = state.reducedMotion;

  runtime.time += dt;
  runtime.fpsTime += dt;
  runtime.fpsFrames += 1;
  if (runtime.fpsTime >= 1) {
    runtime.fps = runtime.fpsFrames / runtime.fpsTime;
    runtime.fpsFrames = 0;
    runtime.fpsTime = 0;
    if (runtime.fps < 28 && !state.performanceMode) {
      runtime.lowFpsStreak += 1;
      if (runtime.lowFpsStreak >= 3) {
        state.togglePerf();
        runtime.lowFpsStreak = 0;
      }
    } else {
      runtime.lowFpsStreak = 0;
    }
  }

  for (const key of Object.keys(runtime.nodePulse)) {
    runtime.nodePulse[key] = Math.max(0, runtime.nodePulse[key] - dt * (reduced ? 3 : 1.6));
  }

  if (state.simMode === "failure") {
    runtime.failureT += dt;
    const t = runtime.failureT;
    if (t < 1.4) {
      runtime.azHealth["az-2"] = Math.max(0, 1 - t / 1.2);
      if (state.azStatus["az-2"] !== "FAILED") state.setAzStatus("az-2", "FAILED");
    } else if (t < 6.5) {
      runtime.azHealth["az-2"] = 0.05;
      if (t > 2 && state.azStatus["az-2"] !== "DEGRADED") {
        state.setAzStatus("az-2", "DEGRADED");
      }
    } else if (t < 9.5) {
      runtime.azHealth["az-2"] = Math.min(1, (t - 6.5) / 2.4);
      if (state.azStatus["az-2"] !== "RECOVERING") state.setAzStatus("az-2", "RECOVERING");
    } else {
      runtime.azHealth["az-2"] = 1;
      runtime.failedAz = null;
      if (state.azStatus["az-2"] !== "OPERATIONAL") state.setAzStatus("az-2", "OPERATIONAL");
      if (t > 11) {
        useExperienceStore.getState().setSim("idle");
      }
    }
  } else if (runtime.azHealth["az-2"] < 1 && !runtime.failedAz) {
    runtime.azHealth["az-2"] = Math.min(1, runtime.azHealth["az-2"] + dt * 0.5);
  }

  const high = state.simMode === "high-traffic";
  const want = high ? 16 : 7;
  runtime.lambdaShow = lerp(runtime.lambdaShow, want, 1 - Math.exp(-dt * 1.8));

  if (runtime.heroActive) {
    const speed = state.simMode === "trace" ? 0.07 : 0.13;
    const prevT = runtime.heroT;
    runtime.heroT = Math.min(1, runtime.heroT + dt * speed);
    const hops = PAYMENT_HOPS.length;
    const hop = Math.min(hops - 1, Math.floor(runtime.heroT * (hops - 0.001)));
    if (hop !== runtime.heroHop) {
      runtime.heroHop = hop;
      const id = PAYMENT_HOPS[hop];
      pulse(id, 1);
      if (id === "kms") runtime.heroEncrypted = true;
      const node = NODES[id];
      const services = [...state.tx.services];
      if (!services.includes(node.aws)) services.push(node.aws);
      state.patchTx({
        status: HOP_STATUS[hop],
        services,
        latency: Math.round(8 + hop * 3 + Math.random() * 4),
        elapsed: Math.round(runtime.heroT * 240),
      });
    }
    if (prevT < 1 && runtime.heroT >= 1) {
      state.patchTx({ status: "CONFIRMED", elapsed: 248, latency: 41 });
      pulse("client", 1);
      pulse("settlement", 1);
      runtime.heroActive = false;
    }
  }

  runtime.metricAcc += dt;
  if (runtime.metricAcc > 0.16) {
    runtime.metricAcc = 0;
    const to = targets();
    const cur = state.metrics;
    const k = 0.18;
    const next: Metrics = {
      rps: lerp(cur.rps, to.rps, k) + (Math.random() - 0.5) * to.rps * 0.02,
      active: lerp(cur.active, to.active, k) + (Math.random() - 0.5) * 2,
      latency: lerp(cur.latency, to.latency, k) + (Math.random() - 0.5) * 1.4,
      success: lerp(cur.success, to.success, k),
      queue: lerp(cur.queue, to.queue, k) + (Math.random() - 0.5) * 2,
      compute: lerp(cur.compute, to.compute, k),
      errors: lerp(cur.errors, to.errors, k),
    };
    state.setMetrics(next);
  }
}
