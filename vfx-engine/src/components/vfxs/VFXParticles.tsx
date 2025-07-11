import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Quaternion,
  Texture,
  Vector3,
} from "three";
import { useVFX } from "./VFXStore";

const tmpPosition = new Vector3();
const tmpRotationEuler = new Euler();
const tmpRotation = new Quaternion();
const tmpScale = new Vector3(1, 1, 1);
const tmpMatrix = new Matrix4();
const tmpColor = new Color();

export interface VFXParticlesSettings {
  nbParticles?: number;
  intensity?: number;
  renderMode?: "billboard" | "mesh";
  fadeSize?: [number, number];
  fadeAlpha?: [number, number];
  gravity?: [number, number, number];
}

interface VFXParticlesProps {
  name: string;
  geometry?: React.ReactElement;
  alphaMap?: Texture;
  settings: VFXParticlesSettings;
}

export const VFXParticles = ({
  name,
  settings = {},
  alphaMap,
  geometry,
}: VFXParticlesProps) => {
  const {
    nbParticles = 1000,
    intensity = 1,
    renderMode = "mesh",
    fadeSize = [0.1, 0.9],
    fadeAlpha = [0, 1.0],
    gravity = [0, 0, 0],
  } = settings;
  const mesh = useRef<InstancedMesh>(null);
  const defaultGeometry = useMemo(() => new PlaneGeometry(0.5, 0.5), []);

  const onBeforeRender = () => {
    if (!needsUpdate.current || !mesh.current) {
      return;
    }
    const attributes = [
      mesh.current.instanceMatrix,
      mesh.current.geometry.getAttribute("instanceColor") as BufferAttribute,
      mesh.current.geometry.getAttribute("instanceColorEnd") as BufferAttribute,
      mesh.current.geometry.getAttribute(
        "instanceDirection"
      ) as BufferAttribute,
      mesh.current.geometry.getAttribute("instanceLifetime") as BufferAttribute,
      mesh.current.geometry.getAttribute("instanceSpeed") as BufferAttribute,
      mesh.current.geometry.getAttribute(
        "instanceRotationSpeed"
      ) as BufferAttribute,
    ];
    attributes.forEach((attribute) => {
      if (attribute instanceof BufferAttribute) {
        attribute.clearUpdateRanges();
        if (lastCursor.current > cursor.current) {
          attribute.addUpdateRange(0, cursor.current * attribute.itemSize);
          attribute.addUpdateRange(
            lastCursor.current * attribute.itemSize,
            nbParticles * attribute.itemSize -
              lastCursor.current * attribute.itemSize
          );
        } else {
          attribute.addUpdateRange(
            lastCursor.current * attribute.itemSize,
            cursor.current * attribute.itemSize -
              lastCursor.current * attribute.itemSize
          );
        }
        attribute.needsUpdate = true;
      }
    });
    lastCursor.current = cursor.current;
    needsUpdate.current = false;
  };

  const cursor = useRef(0);
  const lastCursor = useRef(0);
  const needsUpdate = useRef(false);

  const emit = (count: number, setup: () => any) => {
    if (!mesh.current) return;

    const instanceColor = mesh.current.geometry.getAttribute(
      "instanceColor"
    ) as BufferAttribute;
    const instanceColorEnd = mesh.current.geometry.getAttribute(
      "instanceColorEnd"
    ) as BufferAttribute;
    const instanceDirection = mesh.current.geometry.getAttribute(
      "instanceDirection"
    ) as BufferAttribute;
    const instanceLifetime = mesh.current.geometry.getAttribute(
      "instanceLifetime"
    ) as BufferAttribute;
    const instanceSpeed = mesh.current.geometry.getAttribute(
      "instanceSpeed"
    ) as BufferAttribute;
    const instanceRotationSpeed = mesh.current.geometry.getAttribute(
      "instanceRotationSpeed"
    ) as BufferAttribute;

    for (let i = 0; i < count; i++) {
      if (cursor.current >= nbParticles) {
        cursor.current = 0;
      }
      const {
        scale,
        rotation,
        rotationSpeed,
        position,
        direction,
        lifetime,
        colorStart,
        colorEnd,
        speed,
      } = setup();

      tmpPosition.set(position[0], position[1], position[2]);
      tmpRotationEuler.set(rotation[0], rotation[1], rotation[2]);
      tmpRotation.setFromEuler(tmpRotationEuler);
      tmpScale.set(scale[0], scale[1], scale[2]);
      tmpMatrix.compose(tmpPosition, tmpRotation, tmpScale);
      mesh.current.setMatrixAt(cursor.current, tmpMatrix);

      tmpColor.set(colorStart);
      instanceColor.setXYZ(cursor.current, tmpColor.r, tmpColor.g, tmpColor.b);
      tmpColor.set(colorEnd);
      instanceColorEnd.setXYZ(
        cursor.current,
        tmpColor.r,
        tmpColor.g,
        tmpColor.b
      );
      instanceDirection.setXYZ(
        cursor.current,
        direction[0],
        direction[1],
        direction[2]
      );
      instanceLifetime.setXY(cursor.current, lifetime[0], lifetime[1]);
      instanceSpeed.setX(cursor.current, speed[0]);
      instanceRotationSpeed.setXYZ(
        cursor.current,
        rotationSpeed[0],
        rotationSpeed[1],
        rotationSpeed[2]
      );
      cursor.current++;
      cursor.current = cursor.current % nbParticles;
    }

    mesh.current.instanceMatrix.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceColorEnd.needsUpdate = true;
    instanceDirection.needsUpdate = true;
    instanceLifetime.needsUpdate = true;
    instanceSpeed.needsUpdate = true;
    instanceRotationSpeed.needsUpdate = true;
    needsUpdate.current = true;
  };

  const [attributeArrays] = useState({
    instanceColor: new Float32Array(nbParticles * 3),
    instanceColorEnd: new Float32Array(nbParticles * 3),
    instanceDirection: new Float32Array(nbParticles * 3),
    instanceLifetime: new Float32Array(nbParticles * 2),
    instanceSpeed: new Float32Array(nbParticles * 1),
    instanceRotationSpeed: new Float32Array(nbParticles * 3),
  });

  useFrame(({ clock }) => {
    if (!mesh.current) {
      return;
    }
    (mesh.current.material as any).uniforms.uTime.value = clock.elapsedTime;
    (mesh.current.material as any).uniforms.uIntensity.value = intensity;
    (mesh.current.material as any).uniforms.uFadeSize.value = fadeSize;
    (mesh.current.material as any).uniforms.uFadeAlpha.value = fadeAlpha;
    (mesh.current.material as any).uniforms.uGravity.value = gravity;
  });

  const registerEmitter = useVFX((state) => state.registerEmitter);
  const unregisterEmitter = useVFX((state) => state.unregisterEmitter);

  useEffect(() => {
    registerEmitter(name, emit);
    return () => {
      unregisterEmitter(name);
    };
  }, [name, registerEmitter, unregisterEmitter]);

  return (
    <>
      <instancedMesh
        args={[defaultGeometry, undefined, nbParticles]}
        ref={mesh}
        onBeforeRender={onBeforeRender}
      >
        {geometry}
        <particlesMaterial
          blending={AdditiveBlending}
          defines={{
            BILLBOARD_MODE: renderMode === "billboard",
            MESH_MODE: renderMode === "mesh",
          }}
          transparent
          alphaMap={alphaMap}
          depthWrite={false}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColor"}
          args={[attributeArrays.instanceColor, 3]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColorEnd"}
          args={[attributeArrays.instanceColorEnd, 3]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceDirection"}
          args={[attributeArrays.instanceDirection, 3]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceLifetime"}
          args={[attributeArrays.instanceLifetime, 2]}
          itemSize={2}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceSpeed"}
          args={[attributeArrays.instanceSpeed, 1]}
          itemSize={1}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceRotationSpeed"}
          args={[attributeArrays.instanceRotationSpeed, 3]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
      </instancedMesh>
    </>
  );
};

const ParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 1,
    uFadeSize: [0.1, 0.9],
    uFadeAlpha: [0, 1.0],
    uGravity: [0, 0, 0],
    alphaMap: null,
  },
  /* glsl */ `
mat4 rotationX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
      1,  0,  0,  0,
      0,  c, -s,  0,
      0,  s,  c,  0,
      0,  0,  0,  1
  );
}

mat4 rotationY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
        c,  0,  s,  0,
        0,  1,  0,  0,
      -s,  0,  c,  0,
        0,  0,  0,  1
  );
}

mat4 rotationZ(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
      c, -s,  0,  0,
      s,  c,  0,  0,
      0,  0,  1,  0,
      0,  0,  0,  1
  );
}


vec3 billboard(vec2 v, mat4 view) {
  vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
  vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
  vec3 p = right * v.x + up * v.y;
  return p;
}

uniform float uTime;
uniform vec2 uFadeSize;
uniform vec3 uGravity;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vColorEnd;
varying float vProgress;

attribute float instanceSpeed;
attribute vec3 instanceRotationSpeed;
attribute vec3 instanceDirection;
attribute vec3 instanceColor;
attribute vec3 instanceColorEnd;
attribute vec2 instanceLifetime; // x: startTime, y: duration

void main() {
  float startTime = instanceLifetime.x;
  float duration = instanceLifetime.y;
  float age = uTime - startTime;
  vProgress = age / duration;
  if (vProgress < 0.0 || vProgress > 1.0) {
    gl_Position = vec4(vec3(9999.0), 1.0);
    return;
  }

  float scale = smoothstep(0.0, uFadeSize.x, vProgress) * smoothstep(1.01, uFadeSize.y, vProgress);

  vec3 normalizedDirection = length(instanceDirection) > 0.0 ? normalize(instanceDirection) : vec3(0.0);
  vec3 gravityForce = 0.5 * uGravity * (age * age);

  vec3 offset = normalizedDirection * age * instanceSpeed;
  offset += gravityForce;

  vec3 rotationSpeed = instanceRotationSpeed * age;
  mat4 rotX = rotationX(rotationSpeed.x);
  mat4 rotY = rotationY(rotationSpeed.y);
  mat4 rotZ = rotationZ(rotationSpeed.z);
  mat4 rotationMatrix = rotZ * rotY * rotX;

  vec4 mvPosition;
  #ifdef MESH_MODE
  /* Mesh Mode */
    vec4 startPosition = modelMatrix * instanceMatrix * rotationMatrix * vec4(position * scale, 1.0);
    
    vec3 instancePosition = startPosition.xyz;

    vec3 finalPosition = instancePosition + offset;
    mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
  #endif
  #ifdef BILLBOARD_MODE
  /* Billboard Mode */
    vec4 localPos = vec4(position, 1.0);
    localPos.xyz = billboard(position.xy, viewMatrix) * scale;
    
    vec4 worldPos = modelMatrix * instanceMatrix * rotationMatrix * localPos;
    worldPos.xyz += offset; // Apply offset in world space
    mvPosition = modelViewMatrix * worldPos;
  #endif

  gl_Position = projectionMatrix * mvPosition;

  vUv = uv;
  vColor = instanceColor;
  vColorEnd = instanceColorEnd;
}
`,
  /* glsl */ `
uniform float uIntensity;
uniform vec2 uFadeAlpha;
uniform sampler2D alphaMap;

varying vec3 vColor;
varying vec3 vColorEnd;
varying float vProgress;
varying vec2 vUv;


void main() {
  if (vProgress < 0.0 || vProgress > 1.0) {
    discard;
  }
  vec3 finalColor = mix(vColor, vColorEnd, vProgress);
  finalColor *= uIntensity;

  float alpha = smoothstep(0.0, uFadeAlpha.x, vProgress) * smoothstep(1.01, uFadeAlpha.y, vProgress);

  #ifdef USE_ALPHAMAP
    vec2 uv = vUv;
    vec4 tex = texture2D(alphaMap, uv);
    gl_FragColor = vec4(finalColor, tex.a * alpha);
  #else
    gl_FragColor = vec4(finalColor, alpha);
  #endif
}`
);

extend({ ParticlesMaterial });
