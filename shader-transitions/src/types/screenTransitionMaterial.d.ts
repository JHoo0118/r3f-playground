import type { ThreeElement } from "@react-three/fiber";
import { ScreenTransitionMaterial } from "../components/ScreenTransitionMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    screenTransitionMaterial: ThreeElement<typeof ScreenTransitionMaterial>;
  }
}
