import type { ThreeElement } from "@react-three/fiber";
import { TrailMaterial } from "../components/TrailMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    trailMaterial: ThreeElement<typeof TrailMaterial>;
  }
}
