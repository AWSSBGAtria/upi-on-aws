import { ContactShadows, Grid } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useLayoutEffect } from "react";
import { Color, FogExp2 } from "three";
import { getQuality } from "@/lib/experience/quality";
import { runtime } from "@/lib/experience/runtime";
import { tickSimulation } from "@/lib/experience/simulate";
import { useExperienceStore } from "@/lib/experience/store";
import { CameraRig } from "./camera-rig";
import { PostFX } from "./effects";
import { Connections, TransactionFlow } from "./flow";
import { ArchitectureNodes, Campus, LayerLabels } from "./nodes";

function Lights() {
  const performanceMode = useExperienceStore((s) => s.performanceMode);
  const theme = useExperienceStore((s) => s.theme);
  const isLight = theme === "light";
  const q = getQuality(performanceMode);
  return (
    <>
      <hemisphereLight
        args={isLight ? ["#ffffff", "#94a3b8", 0.78] : ["#b4c4d6", "#0a0c10", 0.48]}
      />
      <directionalLight
        position={[22, 32, 18]}
        intensity={isLight ? 1.85 : 1.55}
        color={isLight ? "#ffffff" : "#f3f5f8"}
        castShadow={q.shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={90}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-16, 10, -12]} intensity={isLight ? 0.45 : 0.28} color={isLight ? "#64748b" : "#3d6a9e"} />
      <pointLight position={[0, 8.5, 12.4]} intensity={1.35} distance={24} color="#ff9900" />
      <pointLight position={[0, 6.5, -9]} intensity={1.05} distance={20} color="#4f8cff" />
      <pointLight position={[0, 13, 2]} intensity={0.7} distance={18} color="#b794f6" />
      <spotLight
        position={[0, 22, 8]}
        angle={0.55}
        penumbra={0.7}
        intensity={isLight ? 1.9 : 1.6}
        color={isLight ? "#ffffff" : "#c5d4e4"}
        distance={48}
        castShadow={false}
      />
    </>
  );
}

function SimulationDriver() {
  useFrame((_, delta) => {
    tickSimulation(Math.min(delta, 0.1));
  });
  return null;
}

function Beams() {
  const theme = useExperienceStore((s) => s.theme);
  const isLight = theme === "light";
  return (
    <group>
      <mesh position={[0, 9, 12]} rotation={[0.15, 0, 0]}>
        <coneGeometry args={[2.4, 14, 16, 1, true]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={isLight ? 0.055 : 0.035} depthWrite={false} />
      </mesh>
      <mesh position={[0, 8, -9]} rotation={[0.1, 0, 0]}>
        <coneGeometry args={[2.1, 12, 16, 1, true]} />
        <meshBasicMaterial color="#4f8cff" transparent opacity={isLight ? 0.06 : 0.04} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Scene() {
  const { scene } = useThree();
  const performanceMode = useExperienceStore((s) => s.performanceMode);
  const theme = useExperienceStore((s) => s.theme);
  const isLight = theme === "light";
  const q = getQuality(performanceMode);

  useLayoutEffect(() => {
    if (isLight) {
      scene.fog = null;
      scene.background = new Color("#eef2f6");
    } else {
      scene.fog = new FogExp2("#05070c", 0.0085);
      scene.background = new Color("#05070c");
    }
  }, [scene, isLight]);

  return (
    <>
      <SimulationDriver />
      <CameraRig />
      <Lights />
      <Campus />
      <Beams />
      {q.contactShadows ? (
        <ContactShadows
          position={[0, 0, 4]}
          opacity={isLight ? 0.28 : 0.42}
          scale={90}
          blur={2.6}
          far={14}
          resolution={512}
          color={isLight ? "#475569" : "#000000"}
        />
      ) : null}
      <Grid
        args={[80, 80]}
        cellSize={1.2}
        sectionSize={6}
        cellColor={isLight ? "#cbd5e1" : "#141c26"}
        sectionColor={isLight ? "#94a3b8" : "#1c2a38"}
        fadeDistance={72}
        fadeStrength={1.4}
        infiniteGrid
        position={[0, 0.0, 4]}
      />
      <Suspense fallback={null}>
        <LayerLabels />
        <ArchitectureNodes />
      </Suspense>
      <Connections />
      {runtime.reveal > 0.01 ? <TransactionFlow /> : <TransactionFlow />}
      {q.bloom ? <PostFX /> : null}
    </>
  );
}
