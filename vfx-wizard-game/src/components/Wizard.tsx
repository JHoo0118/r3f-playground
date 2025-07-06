import { useAnimations, useGLTF } from "@react-three/drei";
import { createPortal } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { LoopOnce, Mesh, Object3D } from "three";
import { VFXEmitter } from "wawa-vfx";
import { useMagic } from "../hooks/useMagic";

export const Wizard = ({ ...props }) => {
  const [animation, setAnimation] = useState("CharacterArmature|Idle");
  const { scene, nodes, animations } = useGLTF(`/models/Animated Wizard.glb`);
  const ref = useRef<Object3D>(null);
  const { actions } = useAnimations(animations, ref);

  if (actions?.["CharacterArmature|Death"]) {
    actions["CharacterArmature|Death"].setLoop(LoopOnce, 1);
    actions["CharacterArmature|Death"].clampWhenFinished = true;
  }

  useEffect(() => {
    const action = actions[animation];
    if (!action) {
      return;
    }
    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [animation, actions]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  const spell = useMagic((state) => state.spell);
  const isCasting = useMagic((state) => state.isCasting);
  const gameStatus = useMagic((state) => state.gameStatus);
  useEffect(() => {
    if (gameStatus === "gameover") {
      setAnimation("CharacterArmature|Death");
    } else if (isCasting) {
      switch (spell.name) {
        case "void":
          setAnimation("CharacterArmature|Spell2");
          break;
        default:
          setAnimation("CharacterArmature|Staff_Attack");
      }
    } else {
      setAnimation("CharacterArmature|Idle_Attacking");
    }
  }, [isCasting, spell, gameStatus]);

  return (
    <group {...props}>
      <primitive ref={ref} object={scene} />
      {nodes.Wizard_Staff &&
        isCasting &&
        createPortal(
          <VFXEmitter
            position-y={-0.01}
            emitter="sparks"
            position-x={0}
            settings={{
              nbParticles: 500,
              colorStart: spell.colors,
              size: [0.01, 0.05],
              directionMin: [-0.5, 0.5, -0.5],
              directionMax: [0.5, 0.5, 0.5],
              speed: [0, 1],
              startPositionMin: [-0.05, -0.05, -0.05],
              startPositionMax: [0.05, 0.05, 0.05],
              loop: true,
            }}
          />,
          nodes.Wizard_Staff
        )}
    </group>
  );
};
