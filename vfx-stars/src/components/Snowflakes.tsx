import { Instance, Instances, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Vector3 } from "three";
import { lerp, randFloat, randFloatSpread } from "three/src/math/MathUtils.js";

export const Snowflakes = ({ nbParticles = 1000 }) => {
  const texture = useTexture("textures/magic_04.png");
  const particles = useMemo(
    () =>
      Array.from({ length: nbParticles }, (_, __) => ({
        position: [randFloatSpread(5), randFloat(0, 10), randFloatSpread(5)],
        rotation: [0, randFloat(0, Math.PI * 2), 0],
        size: randFloat(0.01, 0.1),
        lifetime: randFloat(1, 6),
        speed: randFloat(0.1, 1),
      })),
    []
  );

  return (
    <Instances range={nbParticles} limit={nbParticles}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        alphaMap={texture}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
      {particles.map((props, i) => (
        <Particle key={i} {...props} />
      ))}
    </Instances>
  );
};

const colorStart = new Color("skyblue").multiplyScalar(30);
const colorEnd = new Color("white").multiplyScalar(30);

interface ParticleProps {
  position: number[];
  size: number;
  lifetime: number;
  speed: number;
}

const Particle = ({ position, size, lifetime, speed }: ParticleProps) => {
  const ref = useRef<any>(null);
  const age = useRef(0);

  useFrame(({ camera }, delta) => {
    age.current += delta;
    if (!ref.current) {
      return;
    }
    const lifetimeProgression = age.current / lifetime;
    if (!ref.current) return;

    const mesh = ref.current.matrixAutoUpdate
      ? ref.current
      : ref.current.children?.[0];
    if (!mesh) return;

    mesh.scale.x =
      mesh.scale.y =
      mesh.scale.z =
        lifetimeProgression < 0.5
          ? lerp(0, size, lifetimeProgression) // scale in
          : lerp(size, 0, lifetimeProgression); // scale out

    if (mesh.material) {
      mesh.material.color.r = lerp(
        colorStart.r,
        colorEnd.r,
        lifetimeProgression
      );
      mesh.material.color.g = lerp(
        colorStart.g,
        colorEnd.g,
        lifetimeProgression
      );
      mesh.material.color.b = lerp(
        colorStart.b,
        colorEnd.b,
        lifetimeProgression
      );
    }
    mesh.position.y -= speed * delta;
    mesh.position.x += Math.sin(age.current * speed) * delta;
    mesh.position.z += Math.cos(age.current * speed) * delta;

    if (age.current > lifetime) {
      mesh.position.set(position[0], position[1], position[2]);
      age.current = 0;
    }
    mesh.lookAt(camera.position);
  });

  return (
    <Instance
      ref={ref}
      position={position as [number, number, number]}
      scale={size}
    />
  );
};

useTexture.preload("textures/magic_04.png");
