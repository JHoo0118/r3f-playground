import { useGLTF } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import { lerp, randInt } from "three/src/math/MathUtils.js";

import { Fn } from "three/src/nodes/TSL.js";
import {
  ceil,
  color,
  deltaTime,
  hash,
  If,
  instancedArray,
  instanceIndex,
  length,
  min,
  mix,
  mx_fractal_noise_vec3,
  range,
  saturate,
  smoothstep,
  sqrt,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import {
  AdditiveBlending,
  Color,
  DataTexture,
  FloatType,
  RGBAFormat,
  SpriteNodeMaterial,
} from "three/webgpu";
import * as THREE from "three";

interface GPGPUParticlesProps {
  nbParticles?: number;
}

const randValue = /*#__PURE__*/ Fn(
  ({ min, max, seed = 42 }: { min: number; max: number; seed?: number }) => {
    return hash(instanceIndex.add(seed))
      .mul(max - min)
      .add(min);
  }
);

const MODEL_COLORS = {
  Fox: {
    start: "#00ff49",
    end: "#0040ff",
    emissiveIntensity: 0.1,
  },
  Book: {
    start: "#e8b03b",
    end: "white",
    emissiveIntensity: 0.08,
  },
  Wawa: {
    start: "#5945ce",
    end: "#bbafff",
    emissiveIntensity: 0.6,
  },
} as const;

const tmpColor = new Color();

export const GPGPUParticles: React.FC<GPGPUParticlesProps> = ({
  nbParticles = 500000,
}) => {
  const { scene: foxScene } = useGLTF("/models/Fox-Remesh.glb");
  const { scene: bookScene } = useGLTF("/models/Open Book-Remesh.glb");
  const { scene: wawaScene } = useGLTF("/models/WawaSensei.glb");

  const { curGeometry, startColor, endColor, debugColor, emissiveIntensity } =
    useControls({
      curGeometry: {
        options: ["Fox", "Book", "Wawa"],
        value: "Fox",
      },
      startColor: "#f55454",
      endColor: "white",
      emissiveIntensity: 0.1,
      debugColor: false,
    });

  const geometries = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const sceneToTraverse = {
      Book: bookScene,
      Fox: foxScene,
      Wawa: wawaScene,
    }[curGeometry as keyof typeof MODEL_COLORS];

    sceneToTraverse.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        geometries.push(child.geometry);
      }
    });
    return geometries;
  }, [curGeometry, bookScene, foxScene, wawaScene]);

  const targetPositionsTexture = useMemo(() => {
    const size = Math.ceil(Math.sqrt(nbParticles)); // Make a square texture
    const data = new Float32Array(size * size * 4);

    for (let i = 0; i < nbParticles; i++) {
      data[i * 4 + 0] = 0; // X
      data[i * 4 + 1] = 0; // Y
      data[i * 4 + 2] = 0; // Z
      data[i * 4 + 3] = 1; // Alpha (not needed, but required for 4-component format)
    }

    const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
    return texture;
  }, [nbParticles]);

  useEffect(() => {
    if (geometries.length === 0) return;
    for (let i = 0; i < nbParticles; i++) {
      const geometryIndex = randInt(0, geometries.length - 1);
      const randomGeometryIndex = randInt(
        0,
        geometries[geometryIndex].attributes.position.count - 1
      );
      (targetPositionsTexture.image.data as any)[i * 4 + 0] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 0
        ];
      (targetPositionsTexture.image.data as any)[i * 4 + 1] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 1
        ];
      (targetPositionsTexture.image.data as any)[i * 4 + 2] =
        geometries[geometryIndex].attributes.position.array[
          randomGeometryIndex * 3 + 2
        ];
      (targetPositionsTexture.image.data as any)[i * 4 + 3] = 1;
    }
    targetPositionsTexture.needsUpdate = true;
  }, [geometries, nbParticles, targetPositionsTexture]);

  const gl = useThree((state) => state.gl);

  const { nodes, uniforms, computeUpdate } = useMemo(() => {
    // uniforms
    const uniforms = {
      color: uniform(color(startColor)),
      endColor: uniform(color(endColor)),
      emissiveIntensity: uniform(emissiveIntensity),
    };

    // buffers
    const spawnPositionsBuffer = instancedArray(nbParticles, "vec3");
    const offsetPositionsBuffer = instancedArray(nbParticles, "vec3");
    const agesBuffer = instancedArray(nbParticles, "float");

    const spawnPosition = spawnPositionsBuffer.element(instanceIndex);
    const offsetPosition = offsetPositionsBuffer.element(instanceIndex);
    const age = agesBuffer.element(instanceIndex);

    // init Fn
    const lifetime = randValue({ min: 0.1, max: 6, seed: 13 }).toFloat();

    const computeInit = Fn(() => {
      spawnPosition.assign(
        vec3(
          randValue({ min: -3, max: 3, seed: 0 }),
          randValue({ min: -3, max: 3, seed: 1 }),
          randValue({ min: -3, max: 3, seed: 2 })
        )
      );
      offsetPosition.assign(0);
      age.assign(randValue({ min: 0, max: lifetime as any, seed: 11 }));
    })().compute(nbParticles);

    (gl as any).computeAsync(computeInit);

    const instanceSpeed = randValue({ min: 0.01, max: 0.05, seed: 12 });
    const offsetSpeed = randValue({ min: 0.1, max: 0.5, seed: 14 });

    // Texture data
    const size = ceil(sqrt(nbParticles));
    const col = instanceIndex.modInt(size).toFloat();
    const row = instanceIndex.div(size).toFloat();
    const x = col.div(size.toFloat());
    const y = row.div(size.toFloat());
    const targetPos = texture(targetPositionsTexture, vec2(x, y)).xyz;

    // update Fn
    const computeUpdate = Fn(() => {
      const distanceToTarget = targetPos.sub(spawnPosition);
      If(distanceToTarget.length().greaterThan(0.01), () => {
        spawnPosition.addAssign(
          distanceToTarget
            .normalize()
            .mul(min(instanceSpeed, distanceToTarget.length()))
        );
      });
      offsetPosition.addAssign(
        mx_fractal_noise_vec3(spawnPosition.mul(age))
          .mul(offsetSpeed)
          .mul(deltaTime)
      );

      age.addAssign(deltaTime);

      If(age.greaterThan(lifetime), () => {
        age.assign(0);
        offsetPosition.assign(0);
      });
    })().compute(nbParticles);

    const scale = vec3(range(0.001, 0.01));
    const particleLifetimeProgress = saturate(age.div(lifetime));

    const colorNode = vec4(
      mix(uniforms.color, uniforms.endColor, particleLifetimeProgress),
      randValue({ min: 0, max: 1, seed: 6 }) // Alpha
    );

    // Transform the particles to a circle
    const dist = length(uv().sub(0.5));
    const circle = smoothstep(0.5, 0.49, dist);
    const finalColor = colorNode.mul(circle);

    // Add a random offset to the particles
    const randOffset = vec3(
      range(-0.001, 0.001),
      range(-0.001, 0.001),
      range(-0.001, 0.001)
    );

    return {
      uniforms,
      computeUpdate,
      nodes: {
        positionNode: spawnPosition.add(offsetPosition).add(randOffset),
        colorNode: finalColor,
        emissiveNode: finalColor.mul(uniforms.emissiveIntensity),
        scaleNode: scale.mul(smoothstep(1, 0, particleLifetimeProgress)),
      },
    };
  }, [
    nbParticles,
    startColor,
    endColor,
    emissiveIntensity,
    targetPositionsTexture,
    gl,
  ]);

  const lerpedStartColor = useRef(
    new Color(MODEL_COLORS[curGeometry as keyof typeof MODEL_COLORS].start)
  );
  const lerpedEndColor = useRef(
    new Color(MODEL_COLORS[curGeometry as keyof typeof MODEL_COLORS].end)
  );

  useFrame((_, delta) => {
    (gl as any).compute(computeUpdate);

    tmpColor.set(
      debugColor
        ? startColor
        : MODEL_COLORS[curGeometry as keyof typeof MODEL_COLORS].start
    );
    lerpedStartColor.current.lerp(tmpColor, delta);
    tmpColor.set(
      debugColor
        ? endColor
        : MODEL_COLORS[curGeometry as keyof typeof MODEL_COLORS].end
    );
    lerpedEndColor.current.lerp(tmpColor, delta);
    uniforms.color.value.set(lerpedStartColor.current);
    uniforms.endColor.value.set(lerpedEndColor.current);

    uniforms.emissiveIntensity.value = lerp(
      uniforms.emissiveIntensity.value,
      debugColor
        ? emissiveIntensity
        : MODEL_COLORS[curGeometry as keyof typeof MODEL_COLORS]
            .emissiveIntensity,
      delta
    );
  });

  return (
    <>
      <sprite count={nbParticles}>
        <spriteNodeMaterial
          {...nodes}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </>
  );
};

extend({ SpriteNodeMaterial });
