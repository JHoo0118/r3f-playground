import type { ThreeElement } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    spriteNodeMaterial: ThreeElement<typeof SpriteNodeMaterial> & Omit<{}>;
  }
}
