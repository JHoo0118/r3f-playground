import { Loader, PositionalAudio, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

function App() {
  return (
    <>
      <Stats />
      <UI />
      <Loader />
      <Canvas shadows camera={{ position: [1, 6, 12], fov: 50 }}>
        <fog attach="fog" args={["#574f5e", 8, 22]} />
        <color attach="background" args={["#574f5e"]} />
        <Experience />
        <Preloader />
      </Canvas>
    </>
  );
}

const sfxs = [
  "/sfxs/fire.mp3",
  "/sfxs/freeze.mp3",
  "/sfxs/buildup.mp3",
  "/sfxs/gravity.mp3",
  "/sfxs/blast.mp3",
];

const Preloader = () => {
  return (
    <>
      {sfxs.map((url) => (
        <PositionalAudio url={url} autoplay={false} key={url} />
      ))}
    </>
  );
};

export default App;
