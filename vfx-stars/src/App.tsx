import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";

function App() {
  return (
    <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
      <color attach="background" args={["#121512"]} />
      <Experience />
    </Canvas>
  );
}

export default App;
