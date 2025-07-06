import type { ThreeElement } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    particlesMaterial: ThreeElement<typeof ParticlesMaterial> & Omit<{}>;
  }
}
