let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let drone: OscillatorNode | null = null;
let droneGain: GainNode | null = null;

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
  }
  return ctx;
}

export async function setAmbient(on: boolean) {
  const ac = ensure();
  if (!ac || !master) return;
  if (ac.state === "suspended") await ac.resume();
  if (on) {
    if (!drone) {
      drone = ac.createOscillator();
      drone.type = "sine";
      drone.frequency.value = 72;
      droneGain = ac.createGain();
      droneGain.gain.value = 0.03;
      drone.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      const h = ac.createOscillator();
      h.type = "sine";
      h.frequency.value = 144;
      const hg = ac.createGain();
      hg.gain.value = 0.012;
      h.connect(hg);
      hg.connect(master);
      h.start();
    }
    master.gain.linearRampToValueAtTime(1, ac.currentTime + 0.4);
  } else {
    master.gain.linearRampToValueAtTime(0, ac.currentTime + 0.3);
  }
}

export function blip(kind: "click" | "confirm" | "warn" | "hop") {
  const ac = ensure();
  if (!ac || !master) return;
  if (ac.state === "suspended") void ac.resume();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = kind === "warn" ? "square" : "sine";
  const freq = kind === "confirm" ? 660 : kind === "warn" ? 180 : kind === "hop" ? 420 : 240;
  o.frequency.value = freq;
  g.gain.value = kind === "hop" ? 0.03 : 0.05;
  o.connect(g);
  g.connect(master);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
  o.stop(ac.currentTime + 0.14);
}
