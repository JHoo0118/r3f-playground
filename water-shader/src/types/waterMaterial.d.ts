import type { ThreeElement } from "@react-three/fiber";
import { WaterMaterial } from "../components/WaterMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    waterMaterial: ThreeElement<typeof WaterMaterial>;
  }
}
