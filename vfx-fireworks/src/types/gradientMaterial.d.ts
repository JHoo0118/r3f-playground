import type { ThreeElement } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    gradientMaterial: ThreeElement<typeof GradientMaterial> & Omit<{}>;
  }
}
