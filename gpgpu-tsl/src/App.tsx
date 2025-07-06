import { Stats } from "@react-three/drei";
import { Canvas, type Frameloop } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useState } from "react";
import * as THREE from "three/webgpu";
import { Experience } from "./components/Experience";
import { PostProcessing } from "./components/PostProcessing";

function App() {
  const [frameloop, setFrameloop] = useState("never");
  const ppSettings = useControls("Post Processing", {
    strength: {
      value: 0.8,
      min: 0,
      max: 10,
      step: 0.1,
    },
    radius: {
      value: 0.42,
      min: 0,
      max: 10,
      step: 0.1,
    },
    threshold: {
      value: 0.75,
      min: 0,
      max: 1,
      step: 0.01,
    },
  });
  return (
    <>
      <Stats />
      <Canvas
        shadows
        camera={{ position: [3, 3, 5], fov: 30 }}
        frameloop={frameloop as Frameloop}
        gl={(canvas) => {
          const renderer = new THREE.WebGPURenderer({
            canvas: canvas as unknown as HTMLCanvasElement,
            powerPreference: "high-performance",
            antialias: true,
            alpha: false,
            stencil: false,
          });

          renderer.init().then(() => {
            setFrameloop("always");
          });
          return renderer;
        }}
      >
        <Suspense>
          <Experience />
        </Suspense>
        <PostProcessing {...ppSettings} />
      </Canvas>
    </>
  );
}

export default App;
