import type { ThreeElement } from "@react-three/fiber";
import { MeshLineMaterial } from "meshline";

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial> & Omit<{}>;
  }
}
