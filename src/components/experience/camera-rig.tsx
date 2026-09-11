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

  useFrame(({ camera }) => {
    const storyLock = phase !== "ready" || nav === "architecture" || (!exploreEnabled && storyIndex > 0);
    const locked = runtime.cameraLock || !!selected || storyLock;
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
