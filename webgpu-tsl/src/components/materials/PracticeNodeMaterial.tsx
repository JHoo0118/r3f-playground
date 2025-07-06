import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  color,
  Fn,
  length,
  max,
  mix,
  mx_worley_noise_vec3,
  positionLocal,
  smoothstep,
  time,
  uniform,
  uv,
  vec3,
  vec4,
} from "three/tsl";

interface PracticeNodeMaterialProps {
  colorA?: string;
  colorB?: string;
  blinkSpeed?: number;
  scalingFactor?: number;
  movementSpeed?: number;
  emissiveColor?: string;
}

export const PracticeNodeMaterial = ({
  colorA = "white",
  colorB = "orange",
  blinkSpeed = 1,
  scalingFactor = 5,
  movementSpeed = 0.5,
  emissiveColor = "orange",
}: PracticeNodeMaterialProps) => {
  const { nodes, uniforms } = useMemo(() => {
    const uniforms = {
      colorA: uniform(color(colorA)),
      colorB: uniform(color(colorB)),
      blinkSpeed: uniform(blinkSpeed),
      scalingFactor: uniform(scalingFactor),
      movementSpeed: uniform(movementSpeed),
      emissiveColor: uniform(color(emissiveColor)),
    };

    const randHeight = mx_worley_noise_vec3(
      uv().mul(uniforms.scalingFactor).add(time.mul(uniforms.movementSpeed))
    ).x;
    const offset = randHeight.mul(0.3);

    const finalPosition = positionLocal.add(vec3(0, 0, offset));

    const blink = Fn((t: any, speed: any) => {
      return t.mul(speed).sin().mul(0.5).add(0.5).toVar();
    });

    const finalColor = mix(uniforms.colorA, uniforms.colorB, randHeight).mul(
      max(0.15, blink(time, uniforms.blinkSpeed))
    );

    let uvCentered = uv().sub(0.5).mul(2.0); // Center UV at (0,0)
    let radialDist = length(uvCentered); // Distance from center
    let edgeGlow = smoothstep(0.8, 1, radialDist); // Adjust thresholds for glow width

    return {
      nodes: {
        colorNode: finalColor,
        positionNode: finalPosition,
        emissiveNode: vec4(
          mix(finalColor, uniforms.emissiveColor.mul(2), edgeGlow),
          edgeGlow
        ),
      },
      uniforms,
    };
  }, [colorA, colorB, blinkSpeed, scalingFactor, movementSpeed, emissiveColor]);

  useFrame(() => {
    uniforms.colorA.value.set(colorA);
    uniforms.colorB.value.set(colorB);
    uniforms.blinkSpeed.value = blinkSpeed;
    uniforms.scalingFactor.value = scalingFactor;
    uniforms.movementSpeed.value = movementSpeed;
    uniforms.emissiveColor.value.set(emissiveColor);
  });

  return <meshStandardNodeMaterial {...nodes} />;
};
