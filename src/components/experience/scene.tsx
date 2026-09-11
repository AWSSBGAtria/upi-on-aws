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
  const q = getQuality(performanceMode);
  return (
    <>
      <hemisphereLight args={["#b4c4d6", "#0a0c10", 0.48]} />
      <directionalLight
        position={[22, 32, 18]}
        intensity={1.55}
        color="#f3f5f8"
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
      <directionalLight position={[-16, 10, -12]} intensity={0.28} color="#3d6a9e" />
      <pointLight position={[0, 8.5, 12.4]} intensity={1.35} distance={24} color="#ff9900" />
      <pointLight position={[0, 6.5, -9]} intensity={1.05} distance={20} color="#4f8cff" />
      <pointLight position={[0, 13, 2]} intensity={0.7} distance={18} color="#b794f6" />
      <spotLight
        position={[0, 22, 8]}
        angle={0.55}
        penumbra={0.7}
        intensity={1.6}
        color="#c5d4e4"
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
  return (
    <group>
      <mesh position={[0, 9, 12]} rotation={[0.15, 0, 0]}>
        <coneGeometry args={[2.4, 14, 16, 1, true]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.035} depthWrite={false} />
      </mesh>
      <mesh position={[0, 8, -9]} rotation={[0.1, 0, 0]}>
        <coneGeometry args={[2.1, 12, 16, 1, true]} />
        <meshBasicMaterial color="#4f8cff" transparent opacity={0.04} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Scene() {
  const { scene } = useThree();
  const performanceMode = useExperienceStore((s) => s.performanceMode);
  const q = getQuality(performanceMode);

  useLayoutEffect(() => {
    scene.fog = new FogExp2("#05070c", 0.0085);
    scene.background = new Color("#05070c");
  }, [scene]);

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
          opacity={0.42}
          scale={90}
          blur={2.6}
          far={14}
          resolution={512}
          color="#000000"
        />
      ) : null}
      <Grid
        args={[80, 80]}
        cellSize={1.2}
        sectionSize={6}
        cellColor="#141c26"
        sectionColor="#1c2a38"
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
