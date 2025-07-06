import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { lerp } from "three/src/math/MathUtils.js";
import {
  color,
  mix,
  mx_noise_float,
  negate,
  positionWorld,
  remap,
  step,
  texture,
  uniform,
  vec4,
} from "three/tsl";

interface DissolveMaterialProps {
  visible?: boolean;
  size?: number;
  thickness?: number;
  dissolveColor?: string;
  intensity?: number;
  map?: any;
  [key: string]: any;
}

export const DissolveMaterial = ({
  visible = true,
  size = 12,
  thickness = 0.1,
  dissolveColor = "orange",
  intensity = 2,
  ...props
}: DissolveMaterialProps) => {
  const { nodes, uniforms } = useMemo(() => {
    const uniforms = {
      progress: uniform(0),
      size: uniform(size),
      thickness: uniform(thickness),
      borderColor: uniform(color(dissolveColor)),
      intensity: uniform(intensity),
    };

    const noise = mx_noise_float(positionWorld.mul(uniforms.size));
    const dissolve = remap(noise, -1, 1, 0, 1);

    const smoothProgress = uniforms.progress.remap(
      0,
      1,
      negate(uniforms.thickness),
      1
    );
    const alpha = step(dissolve, smoothProgress);
    const border = step(dissolve, smoothProgress.add(uniforms.thickness)).sub(
      alpha
    );
    const borderColor = uniforms.borderColor.mul(uniforms.intensity);
    const baseColor = texture(props.map);
    const finalColor = mix(baseColor, borderColor, border);

    const shadowColor = mix(color("white"), color("black"), alpha);

    return {
      uniforms,
      nodes: {
        colorNode: finalColor,
        opacityNode: alpha.add(border),
        emissiveNode: borderColor.mul(border),
        castShadowNode: vec4(shadowColor, 1.0),
      },
    };
  }, [size, thickness, dissolveColor, intensity, props.map]);

  useFrame((_, delta) => {
    uniforms.progress.value = lerp(
      uniforms.progress.value,
      visible ? 1 : 0,
      delta * 2
    );
    uniforms.size.value = size;
    uniforms.thickness.value = thickness;
    uniforms.intensity.value = intensity;
    uniforms.borderColor.value.set(dissolveColor);
  });

  return (
    <meshStandardNodeMaterial
      {...props}
      {...nodes}
      transparent
      toneMapped={false}
    />
  );
};
