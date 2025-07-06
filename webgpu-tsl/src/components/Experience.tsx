import { Environment, Gltf, OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import { PracticeNodeMaterial } from "./materials/PracticeNodeMaterial";
import { Racer } from "./Racer";

export const Experience = () => {
  const materialProps = useControls("Background Circle", {
    colorA: { value: "#000000" },
    colorB: { value: "#942132" },
    emissiveColor: { value: "orange" },
    blinkSpeed: { value: 1, min: 0, max: 10 },
    scalingFactor: { value: 5, min: 1, max: 10 },
    movementSpeed: { value: 0.5, min: -5, max: 5, step: 0.01 },
  });

  return (
    <>
      <directionalLight position={[5, 5, -5]} intensity={0.5} castShadow />
      <Environment preset="sunset" environmentIntensity={0.5} />
      <OrbitControls maxPolarAngle={Math.PI / 2 - 0.1} />

      <mesh position={[0, 1, -6]}>
        <circleGeometry args={[2, 200]} />
        <PracticeNodeMaterial {...materialProps} />
      </mesh>

      {/* "F1 2004 Racing Car" (https://skfb.ly/pr78R) by CarlosCG31 is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/). */}
      <Gltf
        src="/models/f1_2004_racing_car.glb"
        position={[0, 0.44, -4]}
        scale={0.5}
        rotation-y={Math.PI / 4}
        castShadow
      />
      <Racer />
      {/* Floor */}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardNodeMaterial color="red" roughness={0.9} />
      </mesh>
    </>
  );
};
