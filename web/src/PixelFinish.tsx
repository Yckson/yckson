import { useEffect, useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  DepthTexture,
  HalfFloatType,
  NearestFilter,
  Object3D,
  Vector2,
  WebGLRenderTarget,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { boards, isBoard } from "./catalog";

const printShader = {
  uniforms: {
    surface: { value: null },
    depthMap: { value: null },
    texel: { value: new Vector2() },
    clip: { value: new Vector2() },
  },
  vertexShader: `varying vec2 uv0;
    void main(){ uv0=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D surface, depthMap;
    uniform vec2 texel, clip;
    varying vec2 uv0;
    float distanceAt(vec2 offset) {
      float d=texture2D(depthMap,uv0+offset*texel).r;
      return clip.x*clip.y/(clip.y-d*(clip.y-clip.x));
    }
    float threshold(vec2 grid) {
      vec2 p=mod(grid,2.);
      return mod(2.*p.x+3.*p.y,4.);
    }
    void main() {
      vec3 light=texture2D(surface,uv0).rgb;
      float z=distanceAt(vec2(0.)), edge=0., occlusion=0.;
      vec3 spill=vec3(0.);
      for(int i=0;i<4;i++){
        vec2 dir=i==0?vec2(1,0):i==1?vec2(-1,0):i==2?vec2(0,1):vec2(0,-1);
        float stepZ=distanceAt(dir)-z;
        edge=max(edge,smoothstep(.018,.075,stepZ/max(z,.1)));
        // Opposing taps cancel flat slopes. Only nearby surfaces contribute contact shade.
        float valley=z-.5*(distanceAt(4.*dir)+distanceAt(-4.*dir));
        occlusion+=smoothstep(.012,.14,valley)*(1.-smoothstep(.24,.75,valley));
        vec3 glow=texture2D(surface,uv0+dir*2.*texel).rgb;
        spill+=max(glow-.68,vec3(0.))*.045;
      }
      light=mix(light,vec3(.008,.013,.016),min(.48,.34*edge+.052*occlusion));
      // Quantize perceptual brightness while preserving the local hue of each fixture.
      light=max(light+spill,vec3(0.));
      float value=sqrt(max(max(light.r,light.g),light.b));
      vec2 grid=floor(gl_FragCoord.xy);
      float bayer=(4.*threshold(grid)+threshold(floor(grid*.5))+.5)/16.;
      float band=floor(36.*value+.5+(bayer-.5)*.44)/36.;
      vec3 printed=light*(band*band/max(.0001,value*value));
      gl_FragColor=vec4(max(printed,vec3(.007,.012,.014)),1.);
    }`,
};

export function PixelFinish({
  model,
  active,
}: {
  model: Object3D;
  active: string | null;
}) {
  const { gl, scene, camera, size, invalidate } = useThree();
  const pipeline = useMemo(() => {
    const surface = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthTexture: new DepthTexture(1, 1),
    });
    const composer = new EffectComposer(gl);
    const finish = new ShaderPass(printShader);
    finish.uniforms.surface.value = surface.texture;
    finish.uniforms.depthMap.value = surface.depthTexture;
    finish.uniforms.clip.value.set(camera.near, camera.far);
    const outline = new OutlinePass(new Vector2(1, 1), scene, camera);
    outline.visibleEdgeColor = new Color("#ffd74a");
    outline.hiddenEdgeColor.setRGB(0, 0, 0);
    outline.edgeStrength = 4;
    outline.edgeGlow = 0.65;
    const output = new OutputPass();
    for (const pass of [finish, outline, output]) composer.addPass(pass);
    return { surface, composer, finish, outline, output };
  }, [gl, camera, scene]);
  useLayoutEffect(() => {
    const pixels = gl.getDrawingBufferSize(new Vector2());
    pipeline.surface.setSize(pixels.x, pixels.y);
    pipeline.finish.uniforms.texel.value.set(1 / pixels.x, 1 / pixels.y);
    pipeline.composer.setSize(size.width, size.height);
    const selected = [];
    if (active) {
      const ids = isBoard(active)
        ? Object.keys(boards).filter(id => isBoard(id) && boards[id] === boards[active])
        : [active];
      for (const id of ids) {
        const object = model.getObjectByName("target_" + id);
        if (object) selected.push(object);
      }
    }
    pipeline.outline.selectedObjects = selected;
    pipeline.outline.enabled = selected.length > 0;
    invalidate();
  }, [active, model, size, gl, pipeline, invalidate]);
  useEffect(
    () => () => {
      pipeline.surface.dispose();
      pipeline.finish.dispose();
      pipeline.outline.dispose();
      pipeline.output.dispose();
      pipeline.composer.dispose();
    },
    [pipeline],
  );
  useFrame(() => {
    gl.setRenderTarget(pipeline.surface);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    pipeline.composer.render();
  }, 1);
  return null;
}
