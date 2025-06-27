import { shaderMaterial } from "@react-three/drei";
import { Color } from "three";

export const ArtLeft02Material = shaderMaterial(
  {
    uColor: new Color("pink"),
    uTime: 0,
    uResolution: [1, 1],
  },
  /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  uniform vec2 uResolution;

  float sdHexagram( in vec2 p, in float r )
  {
    const vec4 k = vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
    p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
    return length(p)*sign(p.y);
  }
  vec3 yellowFluo = vec3(2.0, 2.0, 0.0);

  void main() {
    vec2 translatedUvs = (vUv - 0.5) * 2.0;
    translatedUvs.x *= uResolution.x / uResolution.y;
    translatedUvs *= cos(uTime);
    float hexagramDistance = sdHexagram(translatedUvs, 0.3);
    vec3 colorUsed = mix(uColor, yellowFluo, hexagramDistance);
    hexagramDistance = sin(hexagramDistance * 12.0 + uTime * 3.0) * 0.5 + 0.5;
    hexagramDistance /= 4.0;
    float pct = 0.022 / hexagramDistance;
    vec3 finalColor = pct * colorUsed;
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);
