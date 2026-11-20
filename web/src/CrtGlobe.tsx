import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Frustum,
  Matrix4,
  Mesh,
  NearestFilter,
  Object3D,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
} from "three";

import { portfolioScreen } from "./portfolioScreen";
import englishPage from "./assets/portfolio-en.png";
import portuguesePage from "./assets/portfolio-pt.png";
import type { Language } from "./catalog";

// A tiny phosphor map gives the rotating wireframe a recognizable east and west.
function landMask() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  const continents = [
    [
      [-168, 66],
      [-145, 71],
      [-125, 69],
      [-98, 74],
      [-60, 60],
      [-77, 48],
      [-83, 27],
      [-98, 18],
      [-81, 9],
      [-92, 14],
      [-111, 24],
      [-125, 46],
      [-154, 57],
    ],
    [
      [-81, 11],
      [-64, 12],
      [-47, 1],
      [-35, -6],
      [-47, -24],
      [-57, -39],
      [-68, -55],
      [-76, -40],
      [-71, -21],
      [-80, -5],
    ],
    [
      [-59, 60],
      [-46, 61],
      [-22, 76],
      [-30, 83],
      [-58, 80],
    ],
    [
      [-17, 15],
      [-9, 35],
      [11, 37],
      [32, 30],
      [44, 13],
      [51, 12],
      [41, -5],
      [34, -23],
      [19, -35],
      [11, -16],
      [6, 4],
      [-10, 5],
    ],
    [
      [-10, 36],
      [-8, 44],
      [6, 51],
      [4, 60],
      [17, 71],
      [30, 61],
      [62, 69],
      [103, 77],
      [145, 69],
      [178, 65],
      [159, 52],
      [137, 47],
      [121, 28],
      [108, 19],
      [104, 5],
      [96, 16],
      [87, 22],
      [78, 8],
      [67, 24],
      [52, 26],
      [45, 14],
      [34, 32],
      [23, 40],
      [12, 43],
    ],
    [
      [112, -22],
      [116, -35],
      [137, -36],
      [153, -27],
      [146, -12],
      [133, -12],
      [127, -17],
    ],
  ];
  for (const polygon of continents) {
    ctx.beginPath();
    polygon.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.minFilter = texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

export function CrtGlobe({
  model,
  reduced,
  atTerminal, language, entering,
}: {
  model: Object3D;
  reduced: boolean; atTerminal: boolean; language: Language; entering: boolean;
}) {
  const { camera, invalidate } = useThree();
  const screen = model.getObjectByName("CRT_globe_display");
  const preview = useMemo(() => portfolioScreen(language), [language]);
  const page = useLoader(TextureLoader, language === "pt" ? portuguesePage : englishPage);
  const blink = useRef({ step: 0, since: -1 });
  const globe = useMemo(() => {
    const map = landMask();
    const material = new ShaderMaterial({
      uniforms: { angle: { value: 0.6 }, land: { value: map }, previewMap: {value: null}, pageMap: {value: null}, mode: {value: 0} },
      vertexShader: `varying vec2 coords;
        void main(){coords=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform sampler2D land;
        uniform float angle, mode; uniform sampler2D previewMap, pageMap;
        varying vec2 coords;
        void main(){
          if(mode > 2.5){gl_FragColor=texture2D(pageMap,coords);return;}
          if(mode > 1.5){gl_FragColor=texture2D(previewMap,coords);return;}
          vec2 p=(coords-.5)*2.18;
          float r=length(p);
          if(r>1.)discard;
          p=mat2(.978,-.208,.208,.978)*p;
          float z=sqrt(max(0.,1.-dot(p,p)));
          vec2 ll=vec2(atan(p.x,z)+angle,asin(clamp(p.y,-1.,1.)));
          vec2 atlas=vec2(fract(.5+ll.x/6.2831853),.5+ll.y/3.1415927);
          float terrain=texture2D(land,atlas).a;
          vec2 lines=ll*vec2(8.,6.)/3.1415927;
          vec2 distanceToLine=abs(fract(lines+.5)-.5)/max(fwidth(lines),vec2(.009));
          float wire=1.-smoothstep(.27,1.05,min(distanceToLine.x,distanceToLine.y));
          float rim=smoothstep(1.-max(fwidth(r)*1.3,.012),1.,r);
          vec3 green=mix(vec3(.005,.034,.018),vec3(.022,.20,.068),terrain);
          vec3 phosphor=mix(green,vec3(.37,1.48,.58),max(wire*.88,rim));
          gl_FragColor=vec4(phosphor*(mode>.5?.12:1.),1.);
        }`,
    });
    return { map, material };
  }, []);
  useLayoutEffect(() => {
    if (!(screen instanceof Mesh)) return;
    const original = screen.material;
    const lines =
      screen.parent?.children.filter((n) => n.name.startsWith("Phosphor")) ??
      [];
    for (const line of lines) line.visible = false;
    screen.material = globe.material;
    screen.castShadow = screen.receiveShadow = false;
    invalidate();
    return () => {
      screen.material = original;
      screen.scale.x = 1;
      for (const line of lines) line.visible = true;
      globe.map.dispose();
      globe.material.dispose();
    };
  }, [screen, globe, invalidate]);
  useLayoutEffect(() => {
    page.flipY = false;
    page.colorSpace = SRGBColorSpace;
    page.magFilter = page.minFilter = NearestFilter;
    page.generateMipmaps = false;
    page.needsUpdate = true;
    globe.material.uniforms.pageMap.value = page;
    globe.material.uniforms.previewMap.value = preview;
    invalidate();
    return () => preview.dispose();
  }, [globe, page, preview, invalidate]);
  useLayoutEffect(() => {
    if (!(screen instanceof Mesh)) return;
    const mode = globe.material.uniforms.mode;
    if (!atTerminal) mode.value = 0;
    else if (entering || mode.value === 3) mode.value = 3;
    else mode.value = reduced || mode.value === 2 ? 2 : 1;
    blink.current = { step: mode.value === 2 ? 3 : 0, since: -1 };
    screen.scale.x = mode.value >= 2 ? 1.7 : 1;
    invalidate();
  }, [atTerminal, entering, reduced, globe, screen, invalidate]);
  // Advance at most one phase per rendered frame, even on a slow GPU.
  useFrame(({ clock }) => {
    if (!atTerminal || !screen || globe.material.uniforms.mode.value === 3) return;
    const state = blink.current;
    const now = clock.elapsedTime;
    if (state.since < 0) state.since = now;
    const hold = state.step === 3 ? 1.35 : state.step === 1 ? .24 : .17;
    if (now - state.since >= hold) {
      state.step++;
      state.since = now;
      const mode = [1, 0, 1, 2, 3][state.step];
      globe.material.uniforms.mode.value = mode;
      if (mode === 2) screen.scale.x = 1.7;
    }
    invalidate();
  });
  useLayoutEffect(() => {
    if (atTerminal || reduced || !(screen instanceof Mesh)) return;
    const frustum = new Frustum();
    const matrix = new Matrix4();
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const seconds = Math.min((now - previous) / 1000, 0.2);
      previous = now;
      if (document.hidden) return;
      frustum.setFromProjectionMatrix(
        matrix.multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse,
        ),
      );
      if (!frustum.intersectsObject(screen)) return;
      globe.material.uniforms.angle.value =
        (globe.material.uniforms.angle.value + seconds * 0.42) % (2 * Math.PI);
      invalidate();
    }, 1000 / 12);
    return () => window.clearInterval(timer);
  }, [camera, screen, globe, invalidate, reduced, atTerminal]);
  return null;
}
