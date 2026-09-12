import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import {
  Color,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshStandardMaterial,
  Object3D,
} from "three";
import { AZ_META, CF_POPS, LAYERS, POS } from "@/lib/experience/architecture";
import { getQuality } from "@/lib/experience/quality";
import { runtime } from "@/lib/experience/runtime";
import { useExperienceStore } from "@/lib/experience/store";
import type { NodeId } from "@/lib/experience/types";

function getNodePulse(id: string) {
  return runtime.nodePulse[id] ?? 0;
}

function Hit({
  id,
  size,
  position,
}: {
  id: NodeId;
  size: [number, number, number];
  position?: [number, number, number];
}) {
  return (
    <mesh
      position={position}
      visible={false}
      onClick={(e) => {
        e.stopPropagation();
        useExperienceStore.getState().select(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        useExperienceStore.getState().setHovered(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        useExperienceStore.getState().setHovered(null);
        document.body.style.cursor = "auto";
      }}
    >
      <boxGeometry args={size} />
    </mesh>
  );
}

function Pedestal({
  w,
  d,
  color,
  emissive,
}: {
  w: number;
  d: number;
  color?: string;
  emissive?: string;
}) {
  const theme = useExperienceStore((s) => s.theme);
  const isLight = theme === "light";
  const defColor = isLight ? "#e2e8f0" : "#141920";
  const defEmissive = isLight ? "#cbd5e1" : "#1c2734";
  const baseColor = color ?? defColor;
  const baseEmissive = emissive ?? defEmissive;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[w, 0.2, d]} />
        <meshStandardMaterial color={baseColor} metalness={0.72} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[w - 0.18, 0.02, d - 0.18]} />
        <meshStandardMaterial
          color={isLight ? "#f1f5f9" : "#0b0e13"}
          emissive={baseEmissive}
          emissiveIntensity={isLight ? 0.15 : 0.25}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

export function Campus() {
  const labels = getQuality(useExperienceStore((s) => s.performanceMode)).labels;
  const theme = useExperienceStore((s) => s.theme);
  const isLight = theme === "light";
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 2]} receiveShadow>
        <circleGeometry args={[54, 64]} />
        <meshStandardMaterial color={isLight ? "#e2e8f0" : "#07090d"} metalness={0.35} roughness={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 4]}>
        <ringGeometry args={[31.4, 31.7, 80]} />
        <meshStandardMaterial
          color={isLight ? "#cbd5e1" : "#1a2430"}
          emissive={isLight ? "#94a3b8" : "#2a3c52"}
          emissiveIntensity={0.35}
          transparent
          opacity={0.7}
        />
      </mesh>
      {AZ_META.map((az) => (
        <AzPad key={az.id} azId={az.id} x={az.x} code={az.code} zone={az.zone} labels={labels} />
      ))}
      {[-18, 18].map((x) =>
        [-6, 8].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 1.7, 1.1, z]} castShadow>
            <boxGeometry args={[3.2, 2.2, 6]} />
            <meshStandardMaterial color={isLight ? "#e2e8f0" : "#0c1016"} metalness={0.6} roughness={0.55} />
          </mesh>
        )),
      )}
      {labels ? (
        <Text
          position={[0, 0.18, 33.4]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.42}
          letterSpacing={0.18}
          color="#5d6774"
          anchorX="center"
          anchorY="middle"
        >
          {`ap-south-1   MUMBAI`}
        </Text>
      ) : null}
    </group>
  );
}

function AzPad({
  azId,
  x,
  code,
  zone,
  labels,
}: {
  azId: "az-1" | "az-2" | "az-3";
  x: number;
  code: string;
  zone: string;
  labels: boolean;
}) {
  const mat = useRef<MeshStandardMaterial>(null);
  const edge = useRef<MeshStandardMaterial>(null);
  const theme = useExperienceStore((s) => s.theme);
  const isLight = theme === "light";

  useFrame(() => {
    const h = runtime.azHealth[azId];
    const fail = 1 - h;
    if (mat.current) {
      mat.current.emissiveIntensity = 0.12 + fail * 0.8;
      mat.current.emissive.setRGB(0.08 + fail * 0.7, 0.12 * h, 0.16 * h);
    }
    if (edge.current) {
      edge.current.emissiveIntensity = 0.35 + fail * 1.2 + Math.sin(runtime.time * 6) * fail * 0.4;
      edge.current.color.set(h > 0.5 ? (isLight ? "#cbd5e1" : "#1a2734") : "#4a1214");
      edge.current.emissive.set(h > 0.5 ? (isLight ? "#94a3b8" : "#2a4a62") : "#ff3b3b");
    }
  });
  return (
    <group position={[x, 0, 4]}>
      <mesh receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[9.6, 0.16, 38]} />
        <meshStandardMaterial
          ref={mat}
          color={isLight ? "#e2e8f0" : "#10151c"}
          metalness={0.7}
          roughness={0.42}
          emissive={isLight ? "#cbd5e1" : "#15202c"}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[9.6, 0.02, 38]} />
        <meshStandardMaterial
          ref={edge}
          color={isLight ? "#cbd5e1" : "#1a2734"}
          emissive={isLight ? "#94a3b8" : "#2a4a62"}
          emissiveIntensity={0.3}
          transparent
          opacity={0.55}
        />
      </mesh>
      {labels ? (
        <Text
          position={[0, 0.28, 18.4]}
          fontSize={0.28}
          letterSpacing={0.14}
          color={isLight ? "#475569" : "#8b96a4"}
          anchorX="center"
        >
          {`${code}  ${zone}`}
        </Text>
      ) : null}
    </group>
  );
}

export function LayerLabels() {
  const show = getQuality(useExperienceStore((s) => s.performanceMode)).labels;
  if (!show) return null;
  return (
    <group>
      {LAYERS.map((l) => (
        <Text
          key={l.id}
          position={[-21, 0.4, l.z]}
          fontSize={0.32}
          letterSpacing={0.22}
          color="#66717e"
          anchorX="left"
          anchorY="middle"
        >
          {l.label.toUpperCase()}
        </Text>
      ))}
    </group>
  );
}

export function ClientLayer() {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const p = getNodePulse("client");
    group.current.scale.setScalar(1 + p * 0.04);
  });
  const xs = [-2.4, 0, 2.4];
  return (
    <group ref={group} position={POS.client}>
      <Hit id="client" size={[8, 3.5, 3.2]} />
      {xs.map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow position={[0, 0.7, 0]}>
            <boxGeometry args={[0.72, 1.4, 0.1]} />
            <meshStandardMaterial
              color="#161c24"
              metalness={0.85}
              roughness={0.25}
              emissive="#3db9ff"
              emissiveIntensity={0.2 + i * 0.05}
            />
          </mesh>
          <mesh position={[0, 0.7, 0.06]}>
            <planeGeometry args={[0.52, 1.12]} />
            <meshStandardMaterial
              color="#071018"
              emissive="#3db9ff"
              emissiveIntensity={0.35}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function CloudFrontRing() {
  return (
    <group>
      <Hit id="cloudfront" size={[22, 6, 6]} position={POS.cloudfront} />
      {CF_POPS.map((p, i) => (
        <group key={i} position={p}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.36, 1.6, 6]} />
            <meshStandardMaterial color="#171d26" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.08, 12]} />
            <meshStandardMaterial
              color="#10151c"
              emissive="#ff9900"
              emissiveIntensity={0.28}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial
              color="#ff9900"
              emissive="#ff9900"
              emissiveIntensity={0.8 + (runtime.nodePulse.cloudfront ?? 0)}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Route53Node() {
  const inner = useRef<Group>(null);
  useFrame((_, dt) => {
    if (inner.current) inner.current.rotation.y += dt * 0.55;
  });
  return (
    <group position={POS.route53}>
      <Hit id="route53" size={[3.4, 3.4, 3.4]} />
      <mesh castShadow>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color="#1a212c" metalness={0.9} roughness={0.22} />
      </mesh>
      <group ref={inner}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 1.6, 0, Math.sin((i * Math.PI * 2) / 3) * 1.6]}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial
              color="#ff9900"
              emissive="#ff9900"
              emissiveIntensity={0.7}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function WafWall() {
  const cells = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = -4; x <= 4; x++) for (let y = 0; y < 3; y++) out.push([x * 0.85, y * 0.7]);
    return out;
  }, []);
  const mats = useRef<(MeshStandardMaterial | null)[]>([]);
  useFrame(() => {
    const p = runtime.nodePulse.waf ?? 0;
    mats.current.forEach((m, i) => {
      if (!m) return;
      const flash = (Math.sin(runtime.time * 7 + i) * 0.5 + 0.5) * (runtime.blockAcc > 0 ? 1 : 0);
      m.emissiveIntensity = 0.15 + p * 0.8 + flash * 0.9;
    });
    if (runtime.blockAcc > 0) runtime.blockAcc = Math.max(0, runtime.blockAcc - 0.016);
  });
  return (
    <group position={POS.waf}>
      <Hit id="waf" size={[9.5, 4.2, 1.4]} />
      {cells.map(([x, y], i) => (
        <mesh key={i} position={[x, y + 0.4, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.08, 6]} />
          <meshStandardMaterial
            ref={(el) => {
              mats.current[i] = el;
            }}
            color="#1a1416"
            metalness={0.55}
            roughness={0.4}
            emissive="#ff5a57"
            emissiveIntensity={0.15}
            transparent
            opacity={0.72}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ApiGateway() {
  const portal = useRef<MeshStandardMaterial>(null);
  const ring = useRef<Mesh>(null);
  useFrame((_, dt) => {
    const p = runtime.nodePulse.apigateway ?? 0;
    if (portal.current) portal.current.emissiveIntensity = 0.55 + p * 1.4;
    if (ring.current) ring.current.rotation.z += dt * 0.4;
  });
  return (
    <group position={POS.apigateway}>
      <Hit id="apigateway" size={[7.5, 5.5, 4.2]} />
      <Pedestal w={6.4} d={3.6} emissive="#3a2208" />
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 2.1, 0]} castShadow>
          <boxGeometry args={[0.55, 3.6, 0.55]} />
          <meshStandardMaterial color="#161b23" metalness={0.85} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0, 3.95, 0]} castShadow>
        <boxGeometry args={[5.2, 0.38, 0.7]} />
        <meshStandardMaterial color="#1a212b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.1, 0.1]} ref={ring}>
        <torusGeometry args={[1.15, 0.05, 8, 32]} />
        <meshStandardMaterial
          ref={portal}
          color="#3db9ff"
          emissive="#3db9ff"
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <circleGeometry args={[1.0, 24]} />
        <meshStandardMaterial
          color="#071018"
          emissive="#1a4c6e"
          emissiveIntensity={0.6}
          transparent
          opacity={0.55}
        />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.55, 1.7]}>
          <boxGeometry args={[0.7, 0.22, 0.4]} />
          <meshStandardMaterial
            color="#10151c"
            emissive="#3db9ff"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

export function CognitoChamber() {
  const scan = useRef<Mesh>(null);
  const orbit = useRef<Group>(null);
  useFrame((_, dt) => {
    if (scan.current) scan.current.rotation.y += dt * 1.4;
    if (orbit.current) orbit.current.rotation.y += dt * 0.7;
    const p = runtime.nodePulse.cognito ?? 0;
    if (scan.current) {
      const m = scan.current.material as MeshStandardMaterial;
      m.emissiveIntensity = 0.4 + p;
    }
  });
  return (
    <group position={POS.cognito}>
      <Hit id="cognito" size={[4.2, 5, 4.2]} />
      <Pedestal w={3.4} d={3.4} />
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.25, 2.6, 12]} />
        <meshPhysicalMaterial
          color="#121820"
          metalness={0.55}
          roughness={0.22}
          transparent
          opacity={0.72}
          transmission={0.15}
          thickness={0.4}
        />
      </mesh>
      <mesh ref={scan} position={[0, 1.7, 0]}>
        <torusGeometry args={[1.22, 0.045, 8, 24]} />
        <meshStandardMaterial color="#ff9900" emissive="#ff9900" emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
      <group ref={orbit} position={[0, 1.7, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * 2 * Math.PI) / 3) * 1.55,
              Math.sin(i) * 0.3,
              Math.sin((i * 2 * Math.PI) / 3) * 1.55,
            ]}
          >
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshStandardMaterial color="#d9e4f0" emissive="#d9e4f0" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function KmsCore() {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const c = useRef<Mesh>(null);
  const core = useRef<MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.x += dt * 0.7;
    if (b.current) b.current.rotation.y += dt * 0.9;
    if (c.current) c.current.rotation.z += dt * 0.5;
    if (core.current) core.current.emissiveIntensity = 0.55 + (runtime.nodePulse.kms ?? 0) * 1.2;
  });
  return (
    <group position={POS.kms}>
      <Hit id="kms" size={[4, 5, 4]} />
      <Pedestal w={3.2} d={3.2} />
      <mesh ref={a} position={[0, 1.7, 0]}>
        <torusGeometry args={[1.15, 0.035, 8, 28]} />
        <meshStandardMaterial color="#c9d2dc" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh ref={b} position={[0, 1.7, 0]}>
        <torusGeometry args={[0.88, 0.03, 8, 28]} />
        <meshStandardMaterial color="#ff9900" emissive="#ff9900" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={c} position={[0, 1.7, 0]}>
        <torusGeometry args={[0.62, 0.028, 8, 24]} />
        <meshStandardMaterial color="#c9d2dc" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial
          ref={core}
          color="#ff9900"
          emissive="#ff9900"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function LambdaFarm() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const healthy = useMemo(() => new Color("#3db9ff"), []);
  const down = useMemo(() => new Color("#ff5a57"), []);
  const count = 48;

  useFrame(() => {
    if (!mesh.current) return;
    let i = 0;
    const show = runtime.lambdaShow;
    for (let az = 0; az < 3; az++) {
      const health = runtime.azHealth[AZ_META[az].id];
      for (let n = 0; n < 16; n++) {
        const col = n % 4;
        const row = Math.floor(n / 4);
        const visible = n < show - 0.05;
        dummy.position.set(
          AZ_META[az].x + (col - 1.5) * 0.72,
          1.05,
          POS.lambda[2] + (row - 1.5) * 0.72,
        );
        const s = visible ? 0.26 : 0.0008;
        dummy.scale.set(s, visible ? 0.55 + 0.55 * health : 0.0008, s);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
        color.copy(healthy).lerp(down, 1 - health);
        mesh.current.setColorAt(i, color);
        i += 1;
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <Hit id="lambda" size={[28, 5, 6]} position={POS.lambda} />
      {AZ_META.map((az) => (
        <group key={az.id} position={[az.x, 0, POS.lambda[2]]}>
          <Pedestal w={3.6} d={3.6} emissive="#0c2a36" />
        </group>
      ))}
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[1, 1, 2.2, 6]} />
        <meshStandardMaterial
          color="#1a222c"
          metalness={0.72}
          roughness={0.32}
          emissive="#3db9ff"
          emissiveIntensity={0.45}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

export function SqsQueues() {
  const fills = useRef<(Mesh | null)[]>([]);
  useFrame(() => {
    const q = useExperienceStore.getState().metrics.queue;
    const t = Math.min(1, q / 260);
    fills.current.forEach((m, i) => {
      if (!m) return;
      const health = runtime.azHealth[AZ_META[i].id];
      m.scale.set(1, 1, Math.max(0.08, t * health));
      m.position.z = ((1 - m.scale.z) * 1.6) / -1;
    });
  });
  return (
    <group>
      <Hit id="sqs" size={[28, 4, 5]} position={POS.sqs} />
      {AZ_META.map((az, i) => (
        <group key={az.id} position={[az.x, 1.15, POS.sqs[2]]}>
          <mesh>
            <boxGeometry args={[1.6, 0.7, 3.6]} />
            <meshPhysicalMaterial
              color="#121a22"
              metalness={0.4}
              roughness={0.18}
              transparent
              opacity={0.42}
              transmission={0.35}
              thickness={0.3}
            />
          </mesh>
          <mesh
            ref={(el) => {
              fills.current[i] = el;
            }}
            position={[0, 0, 0]}
          >
            <boxGeometry args={[1.15, 0.38, 3.1]} />
            <meshStandardMaterial
              color="#3db9ff"
              emissive="#3db9ff"
              emissiveIntensity={0.55}
              toneMapped={false}
              transparent
              opacity={0.7}
            />
          </mesh>
          {[-1.85, 1.85].map((z) => (
            <mesh key={z} position={[0, 0, z]}>
              <boxGeometry args={[1.7, 0.78, 0.12]} />
              <meshStandardMaterial color="#1a222c" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function DynamoTowers() {
  const rings = useRef<(Mesh | null)[][]>([[], [], []]);
  useFrame((_, dt) => {
    rings.current.forEach((arr, az) => {
      const health = runtime.azHealth[AZ_META[az].id];
      arr.forEach((m, i) => {
        if (!m) return;
        m.rotation.y += dt * (0.4 + i * 0.08) * (0.3 + health);
        const mat = m.material as MeshStandardMaterial;
        const pulse = (runtime.nodePulse.dynamodb ?? 0) * health;
        mat.emissiveIntensity = (0.25 + pulse) * health + (1 - health) * 0.5;
      });
    });
  });
  return (
    <group>
      <Hit id="dynamodb" size={[28, 7, 6]} position={POS.dynamodb} />
      {AZ_META.map((az, ai) => (
        <group key={az.id} position={[az.x, 0, POS.dynamodb[2]]}>
          <Pedestal w={3.4} d={3.4} emissive="#0a1c36" />
          {[0, 1, 2, 3, 4].map((lvl) => (
            <mesh key={lvl} position={[0, 0.7 + lvl * 0.62, 0]} castShadow>
              <cylinderGeometry args={[1.15 - lvl * 0.1, 1.22 - lvl * 0.1, 0.48, 10]} />
              <meshStandardMaterial color="#151c26" metalness={0.82} roughness={0.28} />
            </mesh>
          ))}
          {[0, 1, 2, 3].map((lvl) => (
            <mesh
              key={`r${lvl}`}
              position={[0, 0.95 + lvl * 0.62, 0]}
              ref={(el) => {
                rings.current[ai][lvl] = el;
              }}
            >
              <torusGeometry args={[1.05 - lvl * 0.1, 0.03, 8, 20]} />
              <meshStandardMaterial
                color="#4f8cff"
                emissive="#4f8cff"
                emissiveIntensity={0.3}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function SettlementCore() {
  const core = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (core.current) core.current.rotation.y += dt * 0.35;
    if (ring.current) ring.current.rotation.z += dt * 0.25;
    const p = runtime.nodePulse.settlement ?? 0;
    if (core.current) {
      (core.current.material as MeshStandardMaterial).emissiveIntensity = 0.45 + p;
    }
  });
  return (
    <group position={POS.settlement}>
      <Hit id="settlement" size={[7, 5, 6]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 0.16, 32]} />
        <meshStandardMaterial color="#12181f" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh ref={ring} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.04, 8, 40]} />
        <meshStandardMaterial color="#3ee0a0" emissive="#3ee0a0" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <mesh ref={core} position={[0, 1.5, 0]} castShadow>
        <octahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial
          color="#3ee0a0"
          emissive="#3ee0a0"
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function Observability() {
  const cw = useRef<Group>(null);
  const xr = useRef<Group>(null);
  const bars = useRef<(Mesh | null)[]>([]);
  useFrame((_, dt) => {
    if (cw.current) cw.current.rotation.y += dt * 0.35;
    if (xr.current) xr.current.rotation.y -= dt * 0.22;
    const metrics = useExperienceStore.getState().metrics;
    const vals = [
      metrics.rps / 14000,
      metrics.active / 900,
      metrics.latency / 100,
      metrics.queue / 260,
      1 - metrics.errors / 3,
    ];
    bars.current.forEach((m, i) => {
      if (!m) return;
      const h = 0.3 + Math.max(0.08, Math.min(1.4, vals[i] ?? 0.4));
      m.scale.y = h;
      m.position.y = h * 0.5;
    });
  });
  return (
    <group>
      <group position={POS.cloudwatch}>
        <Hit id="cloudwatch" size={[4.5, 4.5, 4.5]} />
        <group ref={cw}>
          <mesh>
            <torusGeometry args={[1.4, 0.045, 8, 32]} />
            <meshStandardMaterial color="#b794f6" emissive="#b794f6" emissiveIntensity={0.45} toneMapped={false} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              position={[Math.cos((i * Math.PI) / 3) * 1.4, Math.sin(i) * 0.15, Math.sin((i * Math.PI) / 3) * 1.4]}
            >
              <boxGeometry args={[0.18, 0.18, 0.18]} />
              <meshStandardMaterial color="#1a1624" emissive="#b794f6" emissiveIntensity={0.5} />
            </mesh>
          ))}
        </group>
      </group>
      <group position={POS.xray}>
        <Hit id="xray" size={[3.6, 4.5, 3.6]} />
        <group ref={xr}>
          <mesh>
            <octahedronGeometry args={[0.95, 0]} />
            <meshPhysicalMaterial
              color="#1a1424"
              metalness={0.4}
              roughness={0.2}
              transparent
              opacity={0.55}
              emissive="#b794f6"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      </group>
      <group position={POS.quicksight}>
        <Hit id="quicksight" size={[4.8, 4.2, 3]} />
        <mesh>
          <boxGeometry args={[3.2, 1.8, 0.08]} />
          <meshStandardMaterial color="#141018" metalness={0.5} roughness={0.4} />
        </mesh>
        {[-1.1, -0.55, 0, 0.55, 1.1].map((x, i) => (
          <mesh
            key={x}
            position={[x, 0.2, 0.08]}
            ref={(el) => {
              bars.current[i] = el;
            }}
          >
            <boxGeometry args={[0.28, 1, 0.12]} />
            <meshStandardMaterial
              color="#b794f6"
              emissive="#b794f6"
              emissiveIntensity={0.55}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Reveal({ index, children }: { index: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = runtime.reveal > index * 0.055;
  });
  return <group ref={ref}>{children}</group>;
}

export function ArchitectureNodes() {
  return (
    <group>
      <Reveal index={1}>
        <ClientLayer />
      </Reveal>
      <Reveal index={2}>
        <CloudFrontRing />
        <Route53Node />
      </Reveal>
      <Reveal index={3}>
        <WafWall />
        <ApiGateway />
      </Reveal>
      <Reveal index={4}>
        <CognitoChamber />
        <KmsCore />
      </Reveal>
      <Reveal index={5}>
        <LambdaFarm />
      </Reveal>
      <Reveal index={6}>
        <SqsQueues />
      </Reveal>
      <Reveal index={7}>
        <DynamoTowers />
      </Reveal>
      <Reveal index={8}>
        <SettlementCore />
      </Reveal>
      <Reveal index={9}>
        <Observability />
      </Reveal>
    </group>
  );
}
