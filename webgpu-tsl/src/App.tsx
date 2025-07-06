import { Stats } from "@react-three/drei";
import { Canvas, extend, type Frameloop } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useState } from "react";
import * as THREE from "three/webgpu";
import * as THREE_WEBGL from "three";
import { Experience } from "./components/Experience";
import { PostProcessing } from "./components/PostProcessing";

extend({
  MeshBasicNodeMaterial: THREE.MeshBasicNodeMaterial,
  MeshStandardNodeMaterial: THREE.MeshStandardNodeMaterial,
});

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
        camera={{ position: [0, 2, 8], fov: 30 }}
        frameloop={frameloop as Frameloop}
        gl={(canvas) => {
          // Check if WebGPU is available
          if (navigator.gpu) {
            const renderer = new THREE.WebGPURenderer({
              canvas: canvas as unknown as HTMLCanvasElement,
              powerPreference: "high-performance",
              antialias: true,
              alpha: false,
              stencil: false,
            });

            renderer.init().then(() => {
              console.log(
                "WebGPU?",
                !!(renderer.backend as any).isWebGPUBackend
              );
              setFrameloop("always");
            });

            return renderer;
          } else {
            // Fallback to WebGL renderer
            const renderer = new THREE_WEBGL.WebGLRenderer({
              canvas: canvas as unknown as HTMLCanvasElement,
              powerPreference: "high-performance",
              antialias: true,
              alpha: false,
              stencil: false,
            });

            setFrameloop("always");
            return renderer;
          }
        }}
      >
        <color attach="background" args={["#942132"]} />
        <fog attach="fog" args={["#942132", 20, 30]} />
        <Suspense>
          <group position-y={-1}>
            <Experience />
          </group>
        </Suspense>
        <PostProcessing {...ppSettings} />
      </Canvas>
    </>
  );
}

export default App;
