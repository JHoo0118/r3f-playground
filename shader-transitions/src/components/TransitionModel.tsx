import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { MathUtils, degToRad } from "three/src/math/MathUtils.js";
import { Group } from "three";
import { CAKE_TRANSITION_DURATION } from "./UI";

const varyingFragment = /* glsl */ `
  varying vec3 vPosition;
`;

const applyVaryingFragment = /* glsl */ `
  // use world position to apply the effect
  vPosition = gl_Position.xyz;
`;

const fadeFragment = /* glsl */ `
  float noiseFactor = noise(gl_FragCoord.xy * 0.042);
  float yProgression = smoothstep(-5.0, 5.0, vPosition.y);
  yProgression = smoothstep(0.20, yProgression, uProgression);
  noiseFactor = step(1.0 - yProgression, noiseFactor);
  diffuseColor.a = diffuseColor.a * noiseFactor;
`;

const colorWashFragment = /* glsl */ `
  vec3 color = vec3(1.0, 1.0, 1.0);
  gl_FragColor.rgb = mix(color, gl_FragColor.rgb, yProgression);
`;

const declarationsFragment = /* glsl */ `
  float myRand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    
    float res = mix(
      mix(myRand(ip),myRand(ip+vec2(1.0,0.0)),u.x),
      mix(myRand(ip+vec2(0.0,1.0)),myRand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }
  uniform float uProgression;
`;

interface TransitionModelProps {
  model: string;
  visible: boolean;
  scale: number;
}

export function TransitionModel({
  model,
  visible,
  ...props
}: TransitionModelProps) {
  const { scene, materials } = useGLTF(`/models/${model}.glb`);
  const transitionData = useRef({
    from: 0,
    to: 1,
    started: 0,
  });

  const [animatedVisible, setAnimatedVisible] = useState(visible);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (visible === animatedVisible) {
      return;
    }
    if (!visible) {
      transitionData.current.from = 1;
      transitionData.current.to = 0;
      transitionData.current.started = Date.now();
    }
    const timeout = setTimeout(() => {
      if (visible) {
        transitionData.current.from = 0;
        transitionData.current.to = 1;
        transitionData.current.started = Date.now();
      }
      setAnimatedVisible(visible);
    }, CAKE_TRANSITION_DURATION * 1000);
    return () => clearTimeout(timeout);
  }, [visible]);

  useFrame(() => {
    Object.values(materials).forEach((material) => {
      if (material.userData.shader) {
        material.userData.shader.uniforms.uProgression.value = MathUtils.lerp(
          transitionData.current.from,
          transitionData.current.to,
          (Date.now() - transitionData.current.started) /
            (CAKE_TRANSITION_DURATION * 1000)
        );
      }
    });

    // Handle group animation
    if (groupRef.current) {
      const progress = MathUtils.lerp(
        transitionData.current.from,
        transitionData.current.to,
        (Date.now() - transitionData.current.started) /
          (CAKE_TRANSITION_DURATION * 1000)
      );

      if (visible) {
        // Fade in animation
        groupRef.current.scale.setScalar(MathUtils.lerp(0.8, 1, progress));
        groupRef.current.rotation.x = MathUtils.lerp(degToRad(20), 0, progress);
        groupRef.current.rotation.y = MathUtils.lerp(degToRad(20), 0, progress);
        groupRef.current.position.y = MathUtils.lerp(0.1, 0, progress);
      } else {
        // Fade out animation
        groupRef.current.scale.setScalar(MathUtils.lerp(1, 0.8, progress));
        groupRef.current.rotation.x = MathUtils.lerp(0, degToRad(20), progress);
        groupRef.current.rotation.y = MathUtils.lerp(0, degToRad(20), progress);
        groupRef.current.position.y = MathUtils.lerp(0, 0.1, progress);
      }
    }
  });

  useEffect(() => {
    Object.values(materials).forEach((material) => {
      material.transparent = true;
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uProgression = { value: 0 };
        material.userData.shader = shader;

        shader.vertexShader = shader.vertexShader.replace(
          `void main() {`,
          `${varyingFragment}
                  void main() {`
        );
        shader.vertexShader = shader.vertexShader.replace(
          `#include <fog_vertex>`,
          `#include <fog_vertex>
                  ${applyVaryingFragment}`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          `void main() {`,
          `${varyingFragment}
          void main() {`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          `void main() {`,
          `${declarationsFragment}
          void main() {`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <alphamap_fragment>`,
          `#include <alphamap_fragment>
        ${fadeFragment}`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <tonemapping_fragment>`,
          `${colorWashFragment}
                #include <tonemapping_fragment>`
        );
      };
    });
  }, [materials]);
  return (
    <group {...props} dispose={null} visible={animatedVisible}>
      <group ref={groupRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
