import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { emissive, mrt, output, pass } from "three/tsl";
import * as THREE from "three/webgpu";

interface PostProcessingProps {
  strength?: number;
  radius?: number;
  threshold?: number;
}

export const PostProcessing: React.FC<PostProcessingProps> = ({
  strength = 2.5,
  radius = 0.5,
  threshold = 0.25,
}) => {
  const { gl: renderer, scene, camera } = useThree();
  const postProcessingRef = useRef<THREE.PostProcessing | null>(null);
  const bloomPassRef = useRef<any>(null);

  useEffect(() => {
    if (!renderer || !scene || !camera) {
      return;
    }

    const scenePass = pass(scene, camera);

    // Create MRT (Multiple Render Targets)
    scenePass.setMRT(
      mrt({
        output,
        emissive,
      })
    );

    // Get texture nodes
    const outputPass = scenePass.getTextureNode("output");
    const emissivePass = scenePass.getTextureNode("emissive");

    // Create bloom pass
    const bloomPass = bloom(emissivePass, strength, radius, threshold);
    bloomPassRef.current = bloomPass;

    // Setup post-processing
    const postProcessing = new THREE.PostProcessing(renderer as any);

    const outputNode = outputPass.add(bloomPass);
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [renderer, scene, camera, strength, radius, threshold]);

  useFrame(() => {
    if (bloomPassRef.current) {
      bloomPassRef.current.strength.value = strength;
      bloomPassRef.current.radius.value = radius;
      bloomPassRef.current.threshold.value = threshold;
    }
    if (postProcessingRef.current) {
      postProcessingRef.current.render();
    }
  }, 1);

  return null;
};
