import {
  ContactShadows,
  Instance,
  Instances,
  OrbitControls,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

import { Color, DoubleSide, InstancedMesh, MathUtils, Vector3 } from "three";
import { NinjaMale } from "./NinjaMale";

interface BoxProps {
  scale: number;
  position: Vector3;
  color: Color;
  speed: number;
}

const Box = ({ scale, position, color, speed }: BoxProps) => {
  const ref = useRef<InstancedMesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.z -= speed;
    if (ref.current.position.z < -50) ref.current.position.z = 10;
  });

  return <Instance ref={ref} scale={scale} position={position} color={color} />;
};

interface ExperienceProps {
  nbBoxes: number;
}

export const Experience = ({ nbBoxes }: ExperienceProps) => {
  const boxes = useMemo(
    () =>
      Array.from({ length: nbBoxes }, () => ({
        position: new Vector3(
          MathUtils.randFloat(2, 20) * (MathUtils.randInt(0, 1) ? -1 : 1),
          MathUtils.randFloat(0.2, 10),
          MathUtils.randFloat(10, 50)
        ),
        scale: MathUtils.randFloat(0.2, 1.2),
        color: new Color().setHSL(Math.random(), 1, 0.5),
        speed: MathUtils.randFloat(0.08, 0.42),
      })),
    [nbBoxes]
  );

  return (
    <>
      <OrbitControls
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
        maxDistance={12}
        minDistance={8}
      />
      <NinjaMale scale={1.4} />
      <ContactShadows opacity={0.5} />
      <Instances>
        <boxGeometry />
        <meshStandardMaterial side={DoubleSide} />
        {boxes.map(({ scale, position, color, speed }, i) => (
          <Box
            key={i}
            scale={scale}
            position={position}
            color={color}
            speed={speed}
          />
        ))}
      </Instances>
    </>
  );
};
