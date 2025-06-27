import type { ThreeElement } from "@react-three/fiber";
import {
  ArtFront01Material,
  ArtFront02Material,
  ArtFront03Material,
  ArtLeft01Material,
  ArtLeft02Material,
  ArtLeft03Material,
  ArtRight01Material,
  ArtRear01Material,
  ArtRear02Material,
  ArtRear03Material,
  ArtRear04Material,
  SimpleShaderMaterial,
} from "../materials";

declare module "@react-three/fiber" {
  interface ThreeElements {
    // Front wall materials
    artFront01Material: ThreeElement<typeof ArtFront01Material>;
    artFront02Material: ThreeElement<typeof ArtFront02Material>;
    artFront03Material: ThreeElement<typeof ArtFront03Material>;

    // Left wall materials
    artLeft01Material: ThreeElement<typeof ArtLeft01Material>;
    artLeft02Material: ThreeElement<typeof ArtLeft02Material>;
    artLeft03Material: ThreeElement<typeof ArtLeft03Material>;

    // Right wall materials
    artRight01Material: ThreeElement<typeof ArtRight01Material>;

    // Rear wall materials
    artRear01Material: ThreeElement<typeof ArtRear01Material>;
    artRear02Material: ThreeElement<typeof ArtRear02Material>;
    artRear03Material: ThreeElement<typeof ArtRear03Material>;
    artRear04Material: ThreeElement<typeof ArtRear04Material>;

    // Simple shader material
    simpleShaderMaterial: ThreeElement<typeof SimpleShaderMaterial>;
  }
}
