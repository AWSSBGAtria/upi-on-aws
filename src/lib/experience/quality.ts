export type Quality = {
  dpr: [number, number];
  shadows: boolean;
  antialias: boolean;
  bloom: boolean;
  particles: number;
  maxParticles: number;
  lambdaBase: number;
  lambdaMax: number;
  contactShadows: boolean;
  labels: boolean;
};

export function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
}

export function getQuality(performanceMode: boolean): Quality {
  const mobile = isMobileViewport();
  const low = performanceMode || mobile;
  return {
    dpr: low ? [1, 1] : [1, 1.5],
    shadows: !low,
    antialias: !mobile,
    bloom: !low,
    particles: low ? 18 : 48,
    maxParticles: low ? 72 : 200,
    lambdaBase: low ? 4 : 8,
    lambdaMax: low ? 8 : 16,
    contactShadows: !low,
    labels: !mobile,
  };
}
