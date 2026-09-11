import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { getQuality } from "@/lib/experience/quality";
import { useExperienceStore } from "@/lib/experience/store";

export function PostFX() {
  const performanceMode = useExperienceStore((s) => s.performanceMode);
  const q = getQuality(performanceMode);
  if (!q.bloom) return null;
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={0.42}
        luminanceThreshold={0.38}
        luminanceSmoothing={0.22}
        mipmapBlur
      />
      <Vignette darkness={0.62} offset={0.28} />
    </EffectComposer>
  );
}
