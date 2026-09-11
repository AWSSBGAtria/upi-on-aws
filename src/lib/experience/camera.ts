import gsap from "gsap";
import { VIEWS } from "./architecture";
import { camGoal, runtime } from "./runtime";
import type { Vec3 } from "./types";

export function snapTo(position: Vec3, target: Vec3) {
  gsap.killTweensOf(camGoal.position);
  gsap.killTweensOf(camGoal.target);
  camGoal.position.x = position[0];
  camGoal.position.y = position[1];
  camGoal.position.z = position[2];
  camGoal.target.x = target[0];
  camGoal.target.y = target[1];
  camGoal.target.z = target[2];
}

export function flyTo(
  position: Vec3,
  target: Vec3,
  duration = 1.7,
) {
  gsap.killTweensOf(camGoal.position);
  gsap.killTweensOf(camGoal.target);
  if (duration <= 0.05) {
    snapTo(position, target);
    return;
  }
  runtime.cameraLock = true;
  gsap.to(camGoal.position, {
    x: position[0],
    y: position[1],
    z: position[2],
    duration,
    ease: "power3.inOut",
  });
  gsap.to(camGoal.target, {
    x: target[0],
    y: target[1],
    z: target[2],
    duration,
    ease: "power3.inOut",
    onComplete: () => {
      runtime.cameraLock = false;
    },
  });
}

export function playIntro(reduced: boolean, onTitle: () => void) {
  snapTo([0, 36, 62], [0, 1.2, 4]);
  runtime.cameraLock = true;
  runtime.reveal = reduced ? 1 : 0.04;

  if (reduced) {
    snapTo(VIEWS.overview.position, VIEWS.overview.target);
    gsap.to(runtime, { reveal: 1, duration: 0.35, ease: "none" });
    onTitle();
    return;
  }

  const tl = gsap.timeline();
  tl.to(runtime, { reveal: 1, duration: 4.6, ease: "none" }, 0);
  tl.to(
    camGoal.position,
    { x: 22, y: 16, z: 36, duration: 3.2, ease: "power1.inOut" },
    0.1,
  );
  tl.to(
    camGoal.target,
    { x: 0, y: 2.2, z: 4, duration: 3.2, ease: "power1.inOut" },
    0.1,
  );
  tl.to(
    camGoal.position,
    { x: 15, y: 10.5, z: 26, duration: 2.4, ease: "power2.inOut" },
    3.0,
  );
  tl.to(
    camGoal.target,
    { x: 0, y: 2.4, z: 6, duration: 2.4, ease: "power2.inOut" },
    3.0,
  );
  tl.call(onTitle, undefined, 5.1);
}

export function syncGoalFromCamera(
  px: number,
  py: number,
  pz: number,
  tx: number,
  ty: number,
  tz: number,
) {
  camGoal.position.x = px;
  camGoal.position.y = py;
  camGoal.position.z = pz;
  camGoal.target.x = tx;
  camGoal.target.y = ty;
  camGoal.target.z = tz;
}
