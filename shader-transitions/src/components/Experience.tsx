import { ContactShadows, Float, Gltf } from "@react-three/drei";

import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { MathUtils, degToRad } from "three/src/math/MathUtils.js";
import { Group } from "three";
import { TransitionModel } from "./TransitionModel";
import {
  CAKE_TRANSITION_DURATION,
  cakeAtom,
  cakes,
  isMobileAtom,
  screenAtom,
  transitionAtom,
} from "./UI";
import type { MeshBasicMaterial } from "three";
export const Experience = () => {
  const [cake, setCake] = useAtom(cakeAtom);
  const [screen] = useAtom(screenAtom);
  const { groundColor } = useControls({
    groundColor: "#4e35b5",
  });
  const [transition] = useAtom(transitionAtom);
  const [isMobile] = useAtom(isMobileAtom);

  const materialShadowsHide =
    useRef<InstanceType<typeof MeshBasicMaterial>>(null);
  const [fadeOutShadows, setFadeOutShadows] = useState<boolean>(false);
  const homeGroupRef = useRef<Group>(null);

  useEffect(() => {
    setCake(screen === "menu" ? 0 : -1);
  }, [screen]);

  useEffect(() => {
    setFadeOutShadows(true);
    const timeout = setTimeout(() => {
      setFadeOutShadows(false);
    }, CAKE_TRANSITION_DURATION * 1.42 * 1000);
    return () => clearTimeout(timeout);
  }, [cake]);

  useFrame(() => {
    if (!materialShadowsHide.current) return;
    materialShadowsHide.current.opacity = MathUtils.lerp(
      materialShadowsHide.current.opacity,
      fadeOutShadows ? 1 : 0,
      0.02
    );

    // Handle home group animation
    if (homeGroupRef.current) {
      const isVisible = !transition && screen === "home";
      const targetScale = isMobile
        ? isVisible
          ? 0.75
          : 0.9
        : isVisible
        ? 1
        : 1.15;
      const targetX = isMobile ? 0 : isVisible ? -1.5 : 0;
      const targetRotateY = isVisible ? degToRad(-42) : degToRad(-90);

      homeGroupRef.current.scale.setScalar(
        MathUtils.lerp(homeGroupRef.current.scale.x, targetScale, 0.02)
      );
      homeGroupRef.current.position.x = MathUtils.lerp(
        homeGroupRef.current.position.x,
        targetX,
        0.02
      );
      homeGroupRef.current.rotation.y = MathUtils.lerp(
        homeGroupRef.current.rotation.y,
        targetRotateY,
        0.02
      );
    }
  });

  return (
    <>
      <group position-y={isMobile ? -0.66 : -1}>
        {/* HOME */}
        <group visible={screen === "home"}>
          <group ref={homeGroupRef}>
            <Gltf src="/models/juice_carton_shop.glb" scale={0.72} />
          </group>
        </group>
        {/* MENU */}
        <group position-y={isMobile ? 0.42 : 0.75} visible={screen === "menu"}>
          <Float scale={isMobile ? 0.75 : 1}>
            {cakes.map((cakeItem, index) => (
              <TransitionModel
                key={index}
                model={cakeItem.model}
                scale={cakeItem.scale}
                visible={index === cake}
              />
            ))}
          </Float>
        </group>
        <ContactShadows opacity={0.42} scale={25} />
        <mesh rotation-x={degToRad(-90)} position-y={0.001}>
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial
            ref={materialShadowsHide}
            opacity={0}
            transparent
            color={groundColor}
            toneMapped={false}
          />
        </mesh>

        <mesh rotation-x={degToRad(-90)} position-y={-0.001}>
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial color={groundColor} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
};
