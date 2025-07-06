import { OrbitControls } from "@react-three/drei";
import { GPGPUParticles } from "./GPGPUParticles";

export const Experience: React.FC = () => {
  return (
    <>
      {/* <Environment preset="warehouse" /> */}
      <OrbitControls />
      <GPGPUParticles />
      {/* <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh> */}
    </>
  );
};
