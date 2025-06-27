import { CameraControls, Environment } from "@react-three/drei";
// import { ACTION } from 'camera-controls/dist/types'

import { Gallery } from "./Gallery";

export const Experience = () => {
  return (
    <>
      <CameraControls
        minZoom={0.6}
        maxZoom={2}
        polarRotateSpeed={-0.3}
        azimuthRotateSpeed={-0.3}
        mouseButtons={{ left: 1, wheel: 16, middle: 0, right: 0 }}
        touches={{ one: 32, two: 512, three: 0 }}
      />
      <Environment preset="sunset" background blur={0.3} />
      <Gallery position-y={-1.5} />
    </>
  );
};
