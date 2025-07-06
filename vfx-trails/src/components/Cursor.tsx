import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import { SimpleTrail } from "./SimpleTrail";

import type { Mesh } from "three";
import { Vector3 } from "three";

const tmpVec = new Vector3();

export const Cursor = () => {
  const { color, intensity, opacity, size } = useControls("Cursor", {
    size: { value: 0.2, min: 0.1, max: 3, step: 0.01 },
    color: "#dfbcff",
    intensity: { value: 4.6, min: 1, max: 10, step: 0.1 },
    opacity: { value: 0.5, min: 0, max: 1, step: 0.01 },
  });
  const target = useRef<Mesh>(null!);
  const viewport = useThree((state) => state.viewport);
  useFrame(({ pointer }, delta) => {
    if (target.current) {
      tmpVec.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      );
      target.current.position.lerp(tmpVec, delta * 12);
    }
  });
  return (
    <>
      <group ref={target}>
        <mesh visible={false}>
          <sphereGeometry args={[size / 2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={opacity}
            emissive={color}
            emissiveIntensity={intensity}
          />
        </mesh>
      </group>
      <SimpleTrail
        target={target}
        color={color}
        intensity={intensity}
        opacity={opacity}
        height={size}
        numPoints={20}
        minDistance={0.1}
        duration={20}
      />
    </>
  );
};
