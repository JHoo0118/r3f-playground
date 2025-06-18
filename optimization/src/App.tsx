import { Environment, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Effects } from "./components/Effects";
import { Experience } from "./components/Experience";

function App() {
  const [effect, setEffect] = useState(true);
  // const [nbBoxes, setNbBoxes] = useState(20000);
  const [nbBoxes, setNbBoxes] = useState(1000);
  return (
    <>
      <Canvas camera={{ position: [0, 2, 10], fov: 42 }}>
        <PerformanceMonitor
          onChange={(api) => {
            console.log("Performance Monitor (FPS)", api.fps);
            console.log("Performance Monitor (Factor)", api.factor);
          }}
          onIncline={() => {
            setEffect(true);
            console.log("Performance Monitor (Inclined)");
          }}
          onDecline={() => {
            setEffect(false);
            setNbBoxes(nbBoxes / 2);
            console.log("Performance Monitor (Declined)");
          }}
        />
        <color attach="background" args={["#ffffff"]} />
        <fog attach="fog" args={["#ffffff", 10, 50]} />
        <group position-y={-2}>
          <Experience nbBoxes={nbBoxes} />
        </group>
        <Environment preset="sunset" />
        {effect && <Effects />}
      </Canvas>
    </>
  );
}

export default App;
