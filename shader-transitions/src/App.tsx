import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useAtom } from "jotai";
import { Leva, useControls } from "leva";
import { Suspense, useEffect } from "react";
import { Experience } from "./components/Experience";
import { ScreenTransition } from "./components/ScreenTransition";
import { UI, transitionAtom } from "./components/UI";

function App() {
  const { backgroundColor } = useControls({
    backgroundColor: "#241b52",
  });
  const [transition, setTransition] = useAtom(transitionAtom);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      setTransition(false);
    }
  }, [progress]);
  return (
    <>
      <Leva hidden />
      <UI />
      <Canvas camera={{ position: [0, 1.8, 5], fov: 42 }}>
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[backgroundColor, 5, 12]} />
        <ScreenTransition transition={transition} color="#a5b4fc" />
        <Suspense>
          <Experience />
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
