/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 public/models/646d9dcdc8a5f5bddbfac913.glb -o src/components/Avatar.jsx -r public
*/

import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { Group, Mesh, SkinnedMesh } from "three";
import type { ThreeElements } from "@react-three/fiber";

// 이 타입은 R3F에서 'group' JSX 요소에 전달할 수 있는 모든 props 포함
type R3FTransformProps = ThreeElements["group"];

interface AvatarProps
  extends Pick<R3FTransformProps, "rotation" | "position" | "scale"> {
  "rotation-y": number;
  "position-z": number;
}

export function Avatar({
  "rotation-y": rotationY,
  "position-z": positionZ,
  scale,
}: AvatarProps) {
  const { nodes, materials } = useGLTF("/models/646d9dcdc8a5f5bddbfac913.glb");

  const group = useRef<Group>(null);
  const { animations } = useFBX("/animations/Sitting.fbx");
  animations[0].name = "Sitting";

  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions.Sitting?.play();
  });

  return (
    <group
      position-z={positionZ}
      rotation-y={rotationY}
      scale={scale}
      dispose={null}
      ref={group}
    >
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Body as Mesh).geometry}
        material={materials.Wolf3D_Body}
        skeleton={(nodes.Wolf3D_Body as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Outfit_Bottom as Mesh).geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={(nodes.Wolf3D_Outfit_Bottom as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Outfit_Footwear as Mesh).geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={(nodes.Wolf3D_Outfit_Footwear as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Outfit_Top as Mesh).geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={(nodes.Wolf3D_Outfit_Top as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Hair as Mesh).geometry}
        material={materials.Wolf3D_Hair}
        skeleton={(nodes.Wolf3D_Hair as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={(nodes.EyeLeft as Mesh).geometry}
        material={materials.Wolf3D_Eye}
        skeleton={(nodes.EyeLeft as SkinnedMesh).skeleton}
        morphTargetDictionary={(nodes.EyeLeft as Mesh).morphTargetDictionary}
        morphTargetInfluences={(nodes.EyeLeft as Mesh).morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={(nodes.EyeRight as Mesh).geometry}
        material={materials.Wolf3D_Eye}
        skeleton={(nodes.EyeRight as SkinnedMesh).skeleton}
        morphTargetDictionary={(nodes.EyeRight as Mesh).morphTargetDictionary}
        morphTargetInfluences={(nodes.EyeRight as Mesh).morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={(nodes.Wolf3D_Head as Mesh).geometry}
        material={materials.Wolf3D_Skin}
        skeleton={(nodes.Wolf3D_Head as SkinnedMesh).skeleton}
        morphTargetDictionary={
          (nodes.Wolf3D_Head as Mesh).morphTargetDictionary
        }
        morphTargetInfluences={
          (nodes.Wolf3D_Head as Mesh).morphTargetInfluences
        }
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={(nodes.Wolf3D_Teeth as Mesh).geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={(nodes.Wolf3D_Teeth as SkinnedMesh).skeleton}
        morphTargetDictionary={
          (nodes.Wolf3D_Teeth as Mesh).morphTargetDictionary
        }
        morphTargetInfluences={
          (nodes.Wolf3D_Teeth as Mesh).morphTargetInfluences
        }
      />
    </group>
  );
}

useGLTF.preload("/models/646d9dcdc8a5f5bddbfac913.glb");
useFBX.preload("/animations/Sitting.fbx");
