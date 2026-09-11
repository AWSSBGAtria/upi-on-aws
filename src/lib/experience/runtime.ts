import type { AzId, NodeId } from "./types";

export const camGoal = {
  position: { x: 0, y: 36, z: 62 },
  target: { x: 0, y: 0.2, z: 2 },
  fov: 42,
};

export const runtime = {
  time: 0,
  reveal: 0,
  cameraLock: true,
  focusId: null as NodeId | null,
  nodePulse: {} as Record<string, number>,
  azHealth: { "az-1": 1, "az-2": 1, "az-3": 1 } as Record<AzId, number>,
  failedAz: null as AzId | null,
  failureT: 0,
  lambdaShow: 6,
  heroActive: false,
  heroT: 0,
  heroHop: 0,
  heroAz: "az-2" as AzId,
  heroEncrypted: false,
  spawnAcc: 0,
  metricAcc: 0,
  blockAcc: 0,
  fps: 60,
  fpsFrames: 0,
  fpsTime: 0,
  lowFpsStreak: 0,
};

export function pulse(id: string, amount = 1) {
  runtime.nodePulse[id] = Math.min(1.4, (runtime.nodePulse[id] ?? 0) + amount);
}

export function resetRuntimeVisuals() {
  runtime.failedAz = null;
  runtime.failureT = 0;
  runtime.azHealth["az-1"] = 1;
  runtime.azHealth["az-2"] = 1;
  runtime.azHealth["az-3"] = 1;
  runtime.heroActive = false;
  runtime.heroT = 0;
  runtime.heroHop = 0;
  runtime.heroEncrypted = false;
  runtime.focusId = null;
}
