import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { camGoal, runtime } from "@/lib/experience/runtime";
import { useExperienceStore } from "@/lib/experience/store";

type ControlsApi = {
  enabled: boolean;
  target: { set: (x: number, y: number, z: number) => void; x: number; y: number; z: number };
  update: () => void;
};

export function CameraRig() {
  const controls = useRef<ControlsApi>(null);
  const exploreEnabled = useExperienceStore((s) => s.exploreEnabled);
  const selected = useExperienceStore((s) => s.selected);
  const phase = useExperienceStore((s) => s.phase);
  const storyIndex = useExperienceStore((s) => s.storyIndex);
  const nav = useExperienceStore((s) => s.nav);
  const motionTracking = useExperienceStore((s) => s.motionTracking);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.1);
    const storyLock = phase !== "ready" || nav === "architecture" || (!exploreEnabled && storyIndex > 0);
    const isHeroTracking = runtime.heroActive && motionTracking && !selected;
    const locked = runtime.cameraLock || !!selected || storyLock || isHeroTracking;

    if (isHeroTracking) {
      const [hx, hy, hz] = runtime.heroPos;
      const k = 1 - Math.exp(-dt * 4.2);
      const targetY = hy + 0.4;
      camGoal.target.x += (hx - camGoal.target.x) * k;
      camGoal.target.y += (targetY - camGoal.target.y) * k;
      camGoal.target.z += (hz - camGoal.target.z) * k;

      const desiredX = hx + 8.2;
      const desiredY = hy + 6.0;
      const desiredZ = hz + 10.2;

      camGoal.position.x += (desiredX - camGoal.position.x) * k;
      camGoal.position.y += (desiredY - camGoal.position.y) * k;
      camGoal.position.z += (desiredZ - camGoal.position.z) * k;

      camera.position.set(camGoal.position.x, camGoal.position.y, camGoal.position.z);
      camera.lookAt(camGoal.target.x, camGoal.target.y, camGoal.target.z);
      if (controls.current) {
        controls.current.target.set(camGoal.target.x, camGoal.target.y, camGoal.target.z);
        controls.current.update();
      }
      return;
    }

    if (controls.current) controls.current.enabled = !locked && exploreEnabled && phase === "ready";
    if (locked) {
      camera.position.set(camGoal.position.x, camGoal.position.y, camGoal.position.z);
      camera.lookAt(camGoal.target.x, camGoal.target.y, camGoal.target.z);
      if (controls.current) {
        controls.current.target.set(camGoal.target.x, camGoal.target.y, camGoal.target.z);
        controls.current.update();
      }
    } else if (controls.current) {
      const t = controls.current.target;
      camGoal.position.x = camera.position.x;
      camGoal.position.y = camera.position.y;
      camGoal.position.z = camera.position.z;
      camGoal.target.x = t.x;
      camGoal.target.y = t.y;
      camGoal.target.z = t.z;
    }
  });

  return (
    <OrbitControls
      ref={controls as never}
      enableDamping
      dampingFactor={0.072}
      minDistance={7}
      maxDistance={95}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI / 2.12}
      enablePan
      zoomSpeed={0.7}
      rotateSpeed={0.55}
      panSpeed={0.45}
    />
  );
}
