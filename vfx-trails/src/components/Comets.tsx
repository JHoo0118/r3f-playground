import { Trail, useScroll } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Group, Mesh, Vector3 } from "three";

extend({ MeshLineMaterial, MeshLineGeometry });
import {
  lerp,
  randFloat,
  randFloatSpread,
  randInt,
} from "three/src/math/MathUtils.js";

export const Comets = ({ nbTrails = 42 }) => {
  const comets = useMemo(
    () =>
      new Array(nbTrails).fill(0).map(() => {
        const size = randFloat(1, 3);
        return {
          size,
          length: randInt(2, 4),
          color: [
            "#fc7de7",
            "#b485ee",
            "#618fff",
            "#61ffdb",
            "#61ff93",
            "#faff61",
            "#ff6161",
            "#ffffff",
            "#ec824d",
            "#eff0b1",
          ][randInt(0, 9)],
          startPosition: [randFloatSpread(20), 0, 0],
          orbitSpeed: (2 / size) * (randInt(0, 1) || -1),
          coinSpeed: (15 / size) * (randInt(0, 1) || -1),
          planetOrbitSpeed: (4 / size) * (randInt(0, 1) || -1),
          radius: randFloat(4, 6),
          rotation: [randFloatSpread(Math.PI), randFloatSpread(Math.PI), 0],
        };
      }),
    []
  );

  return (
    <>
      {comets.map((props, i) => (
        <Comet key={i} {...props} />
      ))}
    </>
  );
};

const tmpVector = new Vector3();
const LERP_SPEED = 10;

interface CometProps {
  length: number;
  size: number;
  color: string;
  startPosition: number[];
  orbitSpeed: number;
  coinSpeed: number;
  planetOrbitSpeed: number;
  radius: number;
  rotation: number[];
}

const Comet = ({
  length,
  size,
  color,
  startPosition,
  orbitSpeed,
  coinSpeed,
  planetOrbitSpeed,
  radius,
  rotation,
}: CometProps) => {
  const ref = useRef<Mesh>(null!);
  const container = useRef<Group>(null!);

  const emissiveColor = useMemo(() => {
    const newColor = new Color(color);
    newColor.multiplyScalar(5);
    return newColor;
  }, [color]);

  const data = useScroll();
  const viewport = useThree((state) => state.viewport);

  useFrame(({ clock }, delta) => {
    if (!ref.current) {
      return;
    }
    const smoothDelta = Math.min(0.1, delta);
    let containerTarget = 0;
    const coinMode = data.visible(1 / 4, 1 / 4);
    const planetOrbitMode = data.visible(2 / 4, 1 / 4);
    const cardMode = data.visible(3 / 4, 1 / 4);

    if (planetOrbitMode) {
      containerTarget = -viewport.height * 2;
      tmpVector.x = Math.cos(clock.elapsedTime * planetOrbitSpeed) * radius;
      tmpVector.y = Math.sin(clock.elapsedTime * planetOrbitSpeed) * radius;
      tmpVector.z = 0;
    } else if (coinMode) {
      containerTarget = -viewport.height;
      tmpVector.x = Math.cos(clock.elapsedTime * coinSpeed) * radius;
      tmpVector.y = Math.sin(clock.elapsedTime * coinSpeed) * radius;
      tmpVector.z = 0;
    } else if (cardMode) {
      containerTarget = -viewport.height * 3;
      tmpVector.x = Math.sin(clock.elapsedTime * orbitSpeed) * viewport.width;
      tmpVector.y = Math.cos(clock.elapsedTime * orbitSpeed * 8) * 2;
      tmpVector.z = -2 + Math.cos(clock.elapsedTime * orbitSpeed) * 1;
    } else {
      // default orbit
      tmpVector.x = startPosition[0];
      tmpVector.y = Math.sin(clock.elapsedTime * orbitSpeed) * 20;
      tmpVector.z = -5 + Math.cos(clock.elapsedTime * orbitSpeed) * 80;
    }

    const distance = ref.current.position.distanceTo(tmpVector);
    const lerpFactor = Math.min(1, Math.max(0.0005, 10 / distance));

    ref.current.position.lerp(tmpVector, lerpFactor * LERP_SPEED * smoothDelta);

    container.current.position.y = lerp(
      container.current.position.y,
      containerTarget,
      LERP_SPEED * smoothDelta
    );

    container.current.rotation.x = lerp(
      container.current.rotation.x,
      planetOrbitMode ? rotation[0] : 0,
      smoothDelta
    );
    container.current.rotation.y = lerp(
      container.current.rotation.y,
      planetOrbitMode ? rotation[1] : 0,
      smoothDelta
    );
  });

  return (
    <group ref={container}>
      <Trail
        width={size} // Width of the line
        // color={white} // Color of the line
        length={length} // Length of the line
        decay={1} // How fast the line fades away
        local={false} // Wether to use the target's world or local positions
        stride={0} // Min distance between previous and current point
        interval={1} // Number of frames to wait before next calculationtrail.
        attenuation={(p) => {
          return p;
        }} // A function to define the width in each point along it.
      >
        {/* If `target` is not defined, Trail will use the first `Object3D` child as the target. */}
        <mesh
          ref={ref}
          position={startPosition as [number, number, number]}
          rotation-x={Math.PI / 2}
        >
          <sphereGeometry args={[size / 50]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
          />
        </mesh>

        {/* You can optionally define a custom meshLineMaterial to use. */}
        <meshLineMaterial
          color={emissiveColor}
          transparent
          toneMapped={false}
          opacity={0.5}
          blending={AdditiveBlending}
        />
      </Trail>
    </group>
  );
};
