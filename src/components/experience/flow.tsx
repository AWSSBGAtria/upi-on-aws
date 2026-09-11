import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  type Group,
  type InstancedMesh,
  MathUtils,
  Object3D,
  type PointLight,
  Vector3,
} from "three";
import {
  AZ_META,
  CF_POPS,
  CONNECTIONS,
  NODES,
  PAYMENT_HOPS,
  POS,
} from "@/lib/experience/architecture";
import { getQuality } from "@/lib/experience/quality";
import { pulse, runtime } from "@/lib/experience/runtime";
import { useExperienceStore } from "@/lib/experience/store";
import type { AzId, NodeId, Vec3 } from "@/lib/experience/types";

const dummy = new Object3D();
const _p = new Vector3();
const _t = new Vector3();

function v3(p: Vec3) {
  return new Vector3(p[0], p[1], p[2]);
}

function arc(a: Vec3, b: Vec3, lift = 1.15): Vector3[] {
  const mid: Vec3 = [
    (a[0] + b[0]) / 2,
    Math.max(a[1], b[1]) + lift,
    (a[2] + b[2]) / 2,
  ];
  return [v3(a), v3(mid), v3(b)];
}

function hopPoint(id: NodeId, az: AzId): Vec3 {
  const p = NODES[id].position;
  if (id === "lambda" || id === "sqs" || id === "dynamodb") {
    const x = AZ_META.find((a) => a.id === az)!.x;
    return [x, p[1] + 1.1, p[2]];
  }
  return [p[0], p[1] + 0.4, p[2]];
}

type Particle = {
  active: boolean;
  t: number;
  speed: number;
  path: number;
  hero: boolean;
  blocked: boolean;
  az: AzId;
};

export function Connections() {
  const group = useRef<Group>(null);
  const lines = useMemo(() => {
    return CONNECTIONS.map(([a, b]) => {
      const pa = NODES[a].position;
      const pb = NODES[b].position;
      const pts = arc(pa, pb, a === "cloudfront" || b === "xray" || a === "xray" ? 2.2 : 1.1);
      return pts.map((p) => [p.x, p.y, p.z] as Vec3);
    });
  }, []);

  const cfLines = useMemo(
    () => CF_POPS.map((p) => arc(p, POS.waf, 0.8).map((v) => [v.x, v.y, v.z] as Vec3)),
    [],
  );

  const azLinks = useMemo(() => {
    const pairs: Vec3[][] = [];
    for (let i = 0; i < 2; i++) {
      const a = hopPoint("dynamodb", AZ_META[i].id);
      const b = hopPoint("dynamodb", AZ_META[i + 1].id);
      pairs.push(arc(a, b, 2.4).map((v) => [v.x, v.y, v.z] as Vec3));
    }
    return pairs;
  }, []);

  useFrame(() => {
    if (group.current) group.current.visible = runtime.reveal > 0.22;
  });

  return (
    <group ref={group}>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#3d5a73" lineWidth={1.1} transparent opacity={0.38} />
      ))}
      {cfLines.map((pts, i) => (
        <Line key={`cf${i}`} points={pts} color="#7a5a22" lineWidth={0.8} transparent opacity={0.32} />
      ))}
      {azLinks.map((pts, i) => (
        <Line key={`az${i}`} points={pts} color="#3ee0a0" lineWidth={0.9} transparent opacity={0.28} />
      ))}
    </group>
  );
}

function buildCurves() {
  const azs: AzId[] = ["az-1", "az-2", "az-3"];
  return azs.map((az) => {
    const pts = PAYMENT_HOPS.map((id) => v3(hopPoint(id, az)));
    return new CatmullRomCurve3(pts, false, "catmullrom", 0.12);
  });
}

export function TransactionFlow() {
  const mesh = useRef<InstancedMesh>(null);
  const heroLight = useRef<PointLight>(null);
  const performanceMode = useExperienceStore((s) => s.performanceMode);
  const q = getQuality(performanceMode);
  const max = q.maxParticles;
  const curves = useMemo(() => buildCurves(), []);
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: max }, () => ({
        active: false,
        t: 0,
        speed: 0.12,
        path: 1,
        hero: false,
        blocked: false,
        az: "az-2",
      })),
    [max],
  );
  const colors = useMemo(() => {
    return {
      cyan: new Color("#5cd2ff"),
      green: new Color("#3ee0a0"),
      white: new Color("#eaf6ff"),
      red: new Color("#ff5a57"),
      enc: new Color("#b794f6"),
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const state = useExperienceStore.getState();
    const reduced = state.reducedMotion;
    if (!mesh.current) return;

    const want =
      state.simMode === "high-traffic"
        ? q.maxParticles * 0.9
        : state.simMode === "trace"
          ? 6
          : q.particles;

    runtime.spawnAcc += dt;
    const rate = state.simMode === "high-traffic" ? 0.018 : 0.09;
    if (!reduced && runtime.spawnAcc > rate && runtime.reveal > 0.55) {
      runtime.spawnAcc = 0;
      const slot = particles.find((p) => !p.active && !p.hero);
      if (slot) {
        const live = particles.filter((p) => p.active).length;
        if (live < want) {
          let az: AzId = AZ_META[Math.floor(Math.random() * 3)].id;
          if (runtime.azHealth[az] < 0.4) {
            az = runtime.azHealth["az-1"] > 0.5 ? "az-1" : "az-3";
          }
          slot.active = true;
          slot.t = 0;
          slot.speed = 0.08 + Math.random() * 0.1;
          slot.path = AZ_META.findIndex((a) => a.id === az);
          slot.hero = false;
          slot.az = az;
          slot.blocked = state.simMode === "high-traffic" && Math.random() < 0.04;
        }
      }
    }

    if (runtime.heroActive) {
      let hero = particles.find((p) => p.hero);
      if (!hero) {
        hero = particles.find((p) => !p.active) ?? particles[0];
        hero.hero = true;
        hero.active = true;
        hero.t = 0;
        hero.speed = state.simMode === "trace" ? 0.07 : 0.13;
        hero.az = runtime.heroAz;
        hero.path = Math.max(0, AZ_META.findIndex((a) => a.id === runtime.heroAz));
        hero.blocked = false;
      }
      hero.t = runtime.heroT;
      hero.active = true;
    } else {
      for (const p of particles) {
        if (p.hero) {
          p.hero = false;
          p.active = false;
        }
      }
    }

    const c = colors;
    for (let i = 0; i < max; i++) {
      const p = particles[i];
      if (!p?.active) {
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      if (!p.hero) p.t += dt * p.speed;
      if (p.blocked && p.t > 0.28) {
        p.active = false;
        runtime.blockAcc = 1;
        pulse("waf", 1);
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
        mesh.current.setColorAt(i, c.red);
        continue;
      }
      if (p.t >= 1) {
        p.active = false;
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const curve = curves[p.path] ?? curves[1];
      const tt = MathUtils.clamp(p.t, 0, 1);
      curve.getPointAt(tt, _p);
      curve.getTangentAt(tt, _t);
      dummy.position.copy(_p);
      dummy.lookAt(_p.x + _t.x, _p.y + _t.y, _p.z + _t.z);
      dummy.scale.setScalar(p.hero ? 0.32 : 0.1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      let col = c.cyan;
      if (p.blocked) col = c.red;
      else if (p.hero && runtime.heroEncrypted) col = c.enc;
      else if (p.hero) col = c.white;
      else if (p.t > 0.82) col = c.green;
      mesh.current.setColorAt(i, col);

      if (p.hero && heroLight.current) {
        heroLight.current.position.copy(_p);
        heroLight.current.intensity = 3.2;
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    if (!runtime.heroActive && heroLight.current) heroLight.current.intensity = 0;
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, max]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#3db9ff"
          emissive="#3db9ff"
          emissiveIntensity={1.1}
          toneMapped={false}
          metalness={0.2}
          roughness={0.25}
        />
      </instancedMesh>
      <pointLight ref={heroLight} color="#d8f4ff" intensity={0} distance={9} decay={2} />
    </group>
  );
}
