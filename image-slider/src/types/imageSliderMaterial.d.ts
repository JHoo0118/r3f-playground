import type { ThreeElement } from "@react-three/fiber";
import { ImageSliderMaterial } from "../ImageSlider";

declare module "@react-three/fiber" {
  interface ThreeElements {
    imageSliderMaterial: ThreeElement<typeof ImageSliderMaterial>;
  }
}
