import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  MeshStandardMaterial,
  Euler,
  Mesh,
  Object3D,
  PerspectiveCamera,
  NearestFilter,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { CrtGlobe } from "./CrtGlobe";
import { PixelFinish } from "./PixelFinish";

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
  const fixtures = useMemo(() => {
    const lights: {
      name: string;
      position: Vector3;
      color: string;
      power: number;
      aperture?: { width: number; height: number; aim: Vector3 };
    }[] = [];
    model.traverse((node) => {
      if (typeof node.userData.fixturePower === "number")
        lights.push({
          name: node.name,
          position: node.getWorldPosition(new Vector3()),
          color: node.userData.fixtureColor,
          power: node.userData.fixturePower,
          aperture:
            node.userData.fixtureKind === "window"
              ? {
                  width: node.userData.fixtureWidth,
                  height: node.userData.fixtureHeight,
                  aim: model
                    .getObjectByName("Window_daylight_aim")!
                    .getWorldPosition(new Vector3()),
                }
              : undefined,
        });
    });
    if (lights.some((light) => light.aperture)) RectAreaLightUniformsLib.init();
    return lights;
  }, [model]);
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
      target.position.z += 0.38;
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
      camera.fov = size.width < size.height ? 82 : 55;
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, size, pose, reduced, invalidate]);
  useEffect(() => {
    model.traverse((o) => {
      if (o instanceof Mesh) {
        for (const material of Array.isArray(o.material)
          ? o.material
          : [o.material]) {
          if (material instanceof MeshStandardMaterial && material.map) {
            material.map.magFilter = NearestFilter;
            material.map.minFilter = NearestFilter;
            material.map.needsUpdate = true;
          }
        }
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
        Math.abs(projected.y) > 0.92;
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
      <hemisphereLight color="#e2d8d0" groundColor="#745268" intensity={0.88} />
      {fixtures.map((light) =>
        light.aperture ? (
          <rectAreaLight
            key={light.name}
            position={light.position}
            color={light.color}
            intensity={light.power}
            width={light.aperture.width}
            height={light.aperture.height}
            onUpdate={(source) => source.lookAt(light.aperture!.aim)}
          />
        ) : (
          <pointLight
            key={light.name}
            position={light.position}
            color={light.color}
            intensity={light.power}
            distance={8}
            castShadow={light.name.startsWith("Front fluorescent")}
            shadow-bias={-0.001}
          />
        ),
      )}{" "}
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
      <CrtGlobe model={model} reduced={reduced} />
      <PixelFinish model={model} active={active} />
    </>
  );
}
