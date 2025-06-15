import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { RapierRigidBody, RigidBody, vec3 } from "@react-three/rapier";
import { useRef } from "react";
import { Vector3 } from "three";
import { Controls } from "../App";
import * as THREE from "three";

const MOVEMENT_SPEED = 5;
const JUMP_FORCE = 8;
const ROTATION_SPEED = 5;

export const Player = () => {
  const rb = useRef<RapierRigidBody | null>(null);
  const camera = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraTarget = useRef(new Vector3(0, 0, 0));
  const [, get] = useKeyboardControls();
  const inTheAir = useRef(false);
  const punched = useRef(false);
  const vel = new Vector3();
  const rotationRef = useRef(0);

  useFrame(() => {
    // 1. 카메라 위치 보정
    cameraTarget.current.lerp(vec3(rb.current?.translation()), 0.5);
    camera.current?.lookAt(cameraTarget.current);

    // 2. 키보드 입력 가져오기
    const controls = get();

    // 3. 좌우 키로 Y축 회전 누적
    if (controls[Controls.left]) {
      rotationRef.current += ROTATION_SPEED * 0.005; // 프레임당 회전량 (조정 가능)
    }
    if (controls[Controls.right]) {
      rotationRef.current -= ROTATION_SPEED * 0.005;
    }

    // 4. 누적된 회전값으로 쿼터니언 만들고 강제로 적용
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, rotationRef.current, 0));
    rb.current?.setRotation(quaternion, true);

    // 5. 이동 벡터 초기화 및 앞/뒤 이동 입력 반영
    vel.set(0, 0, 0);
    if (controls[Controls.forward]) {
      vel.z -= MOVEMENT_SPEED;
    }
    if (controls[Controls.back]) {
      vel.z += MOVEMENT_SPEED;
    }

    // 6. 회전값을 이동 벡터에 적용해서 방향 맞춤
    vel.applyEuler(new THREE.Euler(0, rotationRef.current, 0));

    // 7. 점프 처리
    const curVel = rb.current?.linvel();
    if (controls[Controls.jump] && !inTheAir.current) {
      inTheAir.current = true;
      vel.y = JUMP_FORCE;
    } else {
      vel.y = curVel?.y ?? 0;
    }

    // 8. 펀치 중이 아니면 최종 속도 적용
    if (!punched.current) {
      rb.current?.setLinvel(vel, true);
    }
  });

  const respawn = () => {
    rb.current?.setTranslation({ x: 0, y: 5, z: 0 }, true);
  };

  const scene = useThree((state) => state.scene);
  const teleport = () => {
    const gateOut = scene.getObjectByName("gateLargeWide_teamYellow");
    if (gateOut?.position) {
      rb.current?.setTranslation(gateOut.position, true);
    }
  };

  return (
    <RigidBody
      ref={rb}
      gravityScale={2.5}
      onIntersectionEnter={({ other }) => {
        if (other?.rigidBodyObject?.name === "space") {
          respawn();
        }
        if (other?.rigidBodyObject?.name === "gateIn") {
          teleport();
        }
      }}
      lockRotations
      onCollisionEnter={({ other }) => {
        if (other?.rigidBodyObject?.name === "ground") {
          inTheAir.current = false;
        }
        if (other?.rigidBodyObject?.name === "swiper") {
          punched.current = true;
          setTimeout(() => {
            punched.current = false;
          }, 200);
        }
      }}
    >
      <PerspectiveCamera ref={camera} makeDefault position={[0, 5, 8]} />
      <mesh position-y={0.5} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </RigidBody>
  );
};
