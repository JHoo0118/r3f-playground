import type { ThreeElement } from "@react-three/fiber";
import { MyShaderMaterial } from "../ShaderPlane";

declare module "@react-three/fiber" {
  interface ThreeElements {
    myShaderMaterial: ThreeElement<typeof MyShaderMaterial>;
  }
}
