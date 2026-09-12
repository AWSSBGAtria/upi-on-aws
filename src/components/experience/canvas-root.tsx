import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, Color, PCFShadowMap, SRGBColorSpace } from "three";
import { getQuality } from "@/lib/experience/quality";
import { useExperienceStore } from "@/lib/experience/store";
import { Scene } from "./scene";

export default function CanvasRoot() {
  const performanceMode = useExperienceStore((s) => s.performanceMode);
  const q = getQuality(performanceMode);

  return (
    <Canvas
      className="experience-canvas"
      shadows={q.shadows}
      dpr={q.dpr}
      gl={{
        antialias: q.antialias,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 42, near: 0.12, far: 280, position: [0, 36, 62] }}
      onCreated={({ gl, scene }) => {
        const isLight = useExperienceStore.getState().theme === "light";
        const bg = isLight ? "#eef2f6" : "#05070c";
        gl.setClearColor(bg);
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.outputColorSpace = SRGBColorSpace;
        gl.shadowMap.type = PCFShadowMap;
        scene.background = new Color(bg);
        useExperienceStore.getState().setCanvasReady(true);
      }}
      onPointerMissed={() => {
        const s = useExperienceStore.getState();
        if (s.selected) s.select(null);
      }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
    >
      <Scene />
    </Canvas>
  );
}
