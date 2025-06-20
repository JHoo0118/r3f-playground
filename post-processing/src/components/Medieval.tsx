/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 public/models/Medieval.gltf -o src/components/Medieval.jsx -r public
*/

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { Group, Mesh, SkinnedMesh } from "three";

interface MedievalProps {
  "rotation-y": number;
  position: [number, number, number];
}

export function Medieval(props: MedievalProps) {
  const group = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF("/models/Medieval.gltf");
  const { actions } = useAnimations(animations, group);

  const animation = "Idle";

  useEffect(() => {
    if (!actions[animation]) return;
    actions[animation].fadeIn(0.5).play();
    return () => {
      if (!actions[animation]) return;
      actions[animation].fadeOut(0.5);
    };
  }, [animation]);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="CharacterArmature">
          <primitive object={nodes.Root} />
          <group name="Medieval_Body">
            <skinnedMesh
              name="Cube043"
              geometry={(nodes.Cube043 as Mesh).geometry}
              material={materials.Skin}
              skeleton={(nodes.Cube043 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube043_1"
              geometry={(nodes.Cube043_1 as Mesh).geometry}
              material={materials.DarkBrown}
              skeleton={(nodes.Cube043_1 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube043_2"
              geometry={(nodes.Cube043_2 as Mesh).geometry}
              material={materials.Gold}
              skeleton={(nodes.Cube043_2 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube043_3"
              geometry={(nodes.Cube043_3 as Mesh).geometry}
              material={materials.LightBrown}
              skeleton={(nodes.Cube043_3 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube043_4"
              geometry={(nodes.Cube043_4 as Mesh).geometry}
              material={materials.Black}
              skeleton={(nodes.Cube043_4 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube043_5"
              geometry={(nodes.Cube043_5 as Mesh).geometry}
              material={materials.Metal}
              skeleton={(nodes.Cube043_5 as SkinnedMesh).skeleton}
            />
          </group>
          <group name="Medieval_Feet">
            <skinnedMesh
              name="Cube007"
              geometry={(nodes.Cube007 as Mesh).geometry}
              material={materials.DarkBrown}
              skeleton={(nodes.Cube007 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube007_1"
              geometry={(nodes.Cube007_1 as Mesh).geometry}
              material={materials.LightBrown}
              skeleton={(nodes.Cube007_1 as SkinnedMesh).skeleton}
            />
          </group>
          <group name="Medieval_Head">
            <skinnedMesh
              name="Cube024"
              geometry={(nodes.Cube024 as Mesh).geometry}
              material={materials.Skin}
              skeleton={(nodes.Cube024 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube024_1"
              geometry={(nodes.Cube024_1 as Mesh).geometry}
              material={materials.White}
              skeleton={(nodes.Cube024_1 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube024_2"
              geometry={(nodes.Cube024_2 as Mesh).geometry}
              material={materials.Brown}
              skeleton={(nodes.Cube024_2 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube024_3"
              geometry={(nodes.Cube024_3 as Mesh).geometry}
              material={materials.DarkBrown}
              skeleton={(nodes.Cube024_3 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube024_4"
              geometry={(nodes.Cube024_4 as Mesh).geometry}
              material={materials.Black}
              skeleton={(nodes.Cube024_4 as SkinnedMesh).skeleton}
            />
          </group>
          <skinnedMesh
            name="Medieval_Legs"
            geometry={(nodes.Medieval_Legs as Mesh).geometry}
            material={materials.Black}
            skeleton={(nodes.Medieval_Legs as SkinnedMesh).skeleton}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/Medieval.gltf");
