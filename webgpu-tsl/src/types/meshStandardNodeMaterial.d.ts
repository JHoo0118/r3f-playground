import type { ThreeElement } from "@react-three/fiber";
import { MeshStandardNodeMaterial } from "../components/materials/MeshStandardNodeMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshStandardNodeMaterial: ThreeElement<typeof MeshStandardNodeMaterial>;
  }
}
