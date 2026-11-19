import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Color,
  Euler,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Vector2,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export const destinations = ["terminal", "wing"] as const;
export type Destination = (typeof destinations)[number];
export type Stop = Destination | "reception";
type Props = {
  stop: Stop;
  yaw: number;
  pitch: number;
  reduced: boolean;
  active: Destination | null;
  signs: RefObject<Partial<Record<Destination, HTMLButtonElement | null>>>;
  onHover: (d: Destination | null) => void;
  onPick: (d: Destination) => void;
  onReady: () => void;
  onLoss: () => void;
};
function destination(object: Object3D | null): Destination | null {
  while (object) {
    if (object.name === "target_terminal") return "terminal";
    if (object.name === "target_wing") return "wing";
    object = object.parent;
  }
  return null;
}
function Highlight({
  model,
  active,
}: {
  model: Object3D;
  active: Destination | null;
}) {
  const { gl, scene, camera, size, invalidate } = useThree();
  const passes = useMemo(() => {
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    const outline = new OutlinePass(new Vector2(1, 1), scene, camera);
    outline.visibleEdgeColor = new Color("#ffd74a");
    outline.hiddenEdgeColor.setRGB(0, 0, 0);
    outline.edgeStrength = 5;
    outline.edgeGlow = 0.85;
    outline.edgeThickness = 2;
    const output = new OutputPass();
    for (const pass of [render, outline, output]) composer.addPass(pass);
    return { composer, outline, output };
  }, [gl, scene, camera]);
  useEffect(
    () => () => {
      passes.outline.dispose();
      passes.output.dispose();
      passes.composer.dispose();
    },
    [passes],
  );
  useLayoutEffect(() => {
    passes.composer.setSize(size.width, size.height);
    const target = active && model.getObjectByName("target_" + active);
    passes.outline.selectedObjects = target ? [target] : [];
    invalidate();
  }, [size, active, model, passes, invalidate]);
  useFrame(() => {
    if (active) passes.composer.render();
    else gl.render(scene, camera);
  }, 1);
  return null;
}
export default function LabScene({
  stop,
  yaw,
  pitch,
  reduced,
  active,
  signs,
  onHover,
  onPick,
  onReady,
  onLoss,
}: Props) {
  const { scene: model } = useLoader(
    GLTFLoader,
    import.meta.env.BASE_URL + "museum/hall.glb",
  );
  const { camera, gl, invalidate, size } = useThree();
  const first = useRef(true);
  const guidePoints = useMemo(
    () =>
      destinations.map((id) => {
        const position = model
          .getObjectByName("aim_" + id)!
          .getWorldPosition(new Vector3());
        position.y += id === "terminal" ? 0.88 : 0.91;
        return { id, position };
      }),
    [model],
  );
  const projected = useMemo(() => new Vector3(), []);
  const pose = useMemo(() => {
    const target = new Object3D();
    model.getObjectByName("eye_" + stop)!.getWorldPosition(target.position);
    if (stop === "reception" && size.width < size.height)
      target.position.z += 1.05;
    const aim = model
      .getObjectByName("aim_" + stop)!
      .getWorldPosition(new Vector3());
    target.lookAt(target.position.clone().multiplyScalar(2).sub(aim));
    const rotation = new Euler().setFromQuaternion(target.quaternion, "YXZ");
    rotation.y += yaw;
    rotation.x += pitch;
    target.rotation.copy(rotation);
    return target;
  }, [model, stop, yaw, pitch, size.width, size.height]);
  useLayoutEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = size.width < size.height ? 78 : 49;
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, size, pose, reduced, invalidate]);
  useEffect(() => {
    model.traverse((o) => {
      if (o instanceof Mesh) {
        o.receiveShadow = true;
        o.castShadow = !/plaster|ceiling|diffuser|shade/i.test(o.name);
      }
    });
    onReady();
    gl.domElement.addEventListener("webglcontextlost", onLoss);
    return () => gl.domElement.removeEventListener("webglcontextlost", onLoss);
  }, [model, gl, onReady, onLoss]);
  useFrame((_, dt) => {
    const a =
      first.current || reduced ? 1 : 1 - Math.exp(-8 * Math.min(dt, 0.08));
    first.current = false;
    camera.position.lerp(pose.position, a);
    camera.quaternion.slerp(pose.quaternion, a);
    camera.updateMatrixWorld();
    for (const { id, position } of guidePoints) {
      const el = signs.current[id];
      if (!el) continue;
      projected.copy(position).project(camera);
      el.hidden =
        projected.z < -1 ||
        projected.z > 1 ||
        Math.abs(projected.x) > 1.35 ||
        Math.abs(projected.y) > 0.92 ||
        (id === "terminal" && stop === "terminal");
      const margin = el.offsetWidth / 2 + 8;
      el.style.left =
        Math.max(
          margin,
          Math.min(size.width - margin, ((projected.x + 1) * size.width) / 2),
        ) + "px";
      el.style.top =
        Math.max(
          Math.min(130, size.height * 0.3),
          ((1 - projected.y) * size.height) / 2,
        ) + "px";
    }
    if (
      camera.position.distanceToSquared(pose.position) > 0.000001 ||
      camera.quaternion.angleTo(pose.quaternion) > 0.0001
    )
      invalidate();
  });
  return (
    <>
      <hemisphereLight color="#c5f7da" groundColor="#345343" intensity={0.48} />
      <pointLight
        color="#99ff99"
        position={[0.3, 1.57, 0.25]}
        intensity={12}
        distance={6}
        castShadow
        shadow-bias={-0.001}
      />
      <pointLight
        color="#98e9c9"
        position={[-1.8, 2.7, 2]}
        intensity={8}
        distance={7}
      />
      <pointLight
        color="#64e6ae"
        position={[2.1, 2.8, -2]}
        intensity={8}
        distance={6}
      />
      <pointLight
        color="#abf7a8"
        position={[-2.1, 2.95, -2.6]}
        intensity={7}
        distance={5}
      />
      <primitive
        object={model}
        onPointerMove={(
          e: import("@react-three/fiber").ThreeEvent<PointerEvent>,
        ) => {
          e.stopPropagation();
          onHover(destination(e.object));
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e: import("@react-three/fiber").ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          const d = destination(e.object);
          if (d && e.delta < 5) onPick(d);
        }}
      />
      <Highlight model={model} active={active} />
    </>
  );
}
