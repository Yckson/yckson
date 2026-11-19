import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Euler, Object3D, Vector3, MathUtils, Mesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Link, useSearchParams } from "react-router-dom";
import { portfolios, type Language } from "./catalog";

const labels = {
  en: {
    title: "Museum tour",
    reception: "Reception",
    terminal: "Computer terminal",
    wing: "Computer Science wing",
    left: "Look left",
    right: "Look right",
    up: "Look up",
    down: "Look down",
    open: "Enter portfolio",
    index: "View portfolios",
    hint: "Choose a stop. Drag to look around.",
    loading: "Loading the hall…",
  },
  pt: {
    title: "Passeio pelo museu",
    reception: "Recepção",
    terminal: "Terminal de computador",
    wing: "Ala de Ciência da Computação",
    left: "Olhar à esquerda",
    right: "Olhar à direita",
    up: "Olhar para cima",
    down: "Olhar para baixo",
    open: "Entrar no portfólio",
    index: "Ver portfólios",
    hint: "Escolha uma parada. Arraste para olhar ao redor.",
    loading: "Carregando o hall…",
  },
};
const stops = ["reception", "terminal", "wing"] as const;
type Stop = (typeof stops)[number];
type View = { stop: Stop; yaw: number; pitch: number; reduced: boolean };

type Signs = Partial<Record<Stop, HTMLButtonElement | null>>;
function Hall({
  view,
  signs,
  onReady,
  onLoss,
}: {
  signs: RefObject<Signs>;
  view: View;
  onReady: () => void;
  onLoss: () => void;
}) {
  const { scene } = useLoader(
    GLTFLoader,
    import.meta.env.BASE_URL + "museum/hall.glb",
  );
  const { camera, gl, invalidate } = useThree();
  const first = useRef(true);
  const guidePoints = useMemo(
    () =>
      stops.map((id) => {
        const node = scene.getObjectByName(
          (id === "reception" ? "eye_" : "aim_") + id,
        )!;
        const position = node.getWorldPosition(new Vector3());
        position.y += id === "terminal" ? 1.12 : 0.42;
        return { id, position };
      }),
    [scene],
  );
  const projected = useMemo(() => new Vector3(), []);
  const target = useMemo(() => {
    const pose = new Object3D();
    const eye = scene.getObjectByName("eye_" + view.stop);
    const aim = scene.getObjectByName("aim_" + view.stop);
    if (!eye || !aim) throw new Error("Missing museum viewpoint");
    eye.getWorldPosition(pose.position);
    // Cameras look along their negative Z axis.
    const direction = pose.position
      .clone()
      .sub(aim.getWorldPosition(new Vector3()));
    pose.lookAt(pose.position.clone().add(direction));
    const rotation = new Euler().setFromQuaternion(pose.quaternion, "YXZ");
    rotation.y += view.yaw;
    rotation.x += view.pitch;
    pose.rotation.copy(rotation);
    return pose;
  }, [scene, view.stop, view.yaw, view.pitch]);
  useEffect(() => {
    invalidate();
  }, [target, view.reduced, invalidate]);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.receiveShadow = true;
        object.castShadow = !/wall|roof|ceiling|strip.light/i.test(object.name);
      }
    });
    onReady();
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onLoss);
    return () => canvas.removeEventListener("webglcontextlost", onLoss);
  }, [gl, scene, onReady, onLoss]);
  useFrame((_, delta) => {
    const factor =
      view.reduced || first.current
        ? 1
        : 1 - Math.exp(-8 * Math.min(delta, 0.08));
    first.current = false;
    camera.position.lerp(target.position, factor);
    camera.quaternion.slerp(target.quaternion, factor);
    camera.updateMatrixWorld();
    for (const { id, position } of guidePoints) {
      const sign = signs.current[id];
      if (!sign) continue;
      projected.copy(position).project(camera);
      sign.hidden =
        id === view.stop ||
        projected.z < -1 ||
        projected.z > 1 ||
        Math.abs(projected.x) > 0.86 ||
        Math.abs(projected.y) > 0.85;
      sign.style.left = (projected.x + 1) * 50 + "%";
      sign.style.top = (1 - projected.y) * 50 + "%";
    }
    if (
      camera.position.distanceToSquared(target.position) > 0.000001 ||
      camera.quaternion.angleTo(target.quaternion) > 0.0001
    )
      invalidate();
  });
  return (
    <>
      <hemisphereLight intensity={2} color="#fff5db" groundColor="#62675c" />
      <directionalLight
        castShadow
        position={[-3, 5, 4]}
        shadow-bias={-0.0005}
        shadow-mapSize={[1024, 1024]}
        intensity={2.4}
      />
      <directionalLight position={[4, 4, -2]} intensity={1.3} />
      <primitive object={scene} />
    </>
  );
}
export default function Tour({
  language,
  reduced,
  onLoss,
}: {
  language: Language;
  reduced: boolean;
  onLoss: () => void;
}) {
  const [params, setParams] = useSearchParams();
  const stop = stops.find((s) => s === params.get("stop")) ?? "reception";
  const [look, setLook] = useState({ yaw: 0, pitch: 0 });
  const [ready, setReady] = useState(false);
  const onReady = useMemo(() => () => setReady(true), []);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const signs = useRef<Signs>({});
  function visit(next: Stop) {
    setLook({ yaw: 0, pitch: 0 });
    setParams({ stop: next }, { replace: true });
  }
  const t = labels[language];
  const root = "/" + language;
  const area = portfolios.find((item) => item.stop === stop);
  return (
    <section className="tour">
      <div className="tour-heading">
        <h1>{t.title}</h1>
        <Link to={root + "/portfolios"}>{t.index} ↗</Link>
      </div>
      <div
        className="viewport"
        onPointerDown={(e) => {
          if ((e.target as Element).closest("button")) return;
          drag.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x,
            dy = e.clientY - drag.current.y;
          drag.current = { x: e.clientX, y: e.clientY };
          setLook((v) => ({
            yaw: v.yaw + dx * 0.005,
            pitch: MathUtils.clamp(v.pitch + dy * 0.004, -0.6, 0.6),
          }));
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <Canvas
          shadows
          aria-hidden="true"
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ fov: 54, near: 0.08, far: 55 }}
        >
          <color attach="background" args={["#b5bbb0"]} />
          <Suspense fallback={null}>
            <Hall
              signs={signs}
              view={{ stop, ...look, reduced }}
              onReady={onReady}
              onLoss={onLoss}
            />
          </Suspense>
        </Canvas>
        {stops.map((s) => (
          <button
            key={s}
            hidden
            className="scene-sign"
            ref={(element) => {
              signs.current[s] = element;
            }}
            onClick={() => visit(s)}
          >
            {t[s]} ↗
          </button>
        ))}
        {!ready && (
          <span className="loading" role="status">
            {t.loading}
          </span>
        )}
      </div>
      <div className="controls">
        <p>{t.hint}</p>
        <div className="stop-row">
          {stops.map((s) => (
            <button key={s} aria-pressed={s === stop} onClick={() => visit(s)}>
              {t[s]}
            </button>
          ))}
        </div>
        <div className="stop-row">
          <button onClick={() => setLook((v) => ({ ...v, yaw: v.yaw + 0.3 }))}>
            ← {t.left}
          </button>
          <button onClick={() => setLook((v) => ({ ...v, yaw: v.yaw - 0.3 }))}>
            {t.right} →
          </button>
          <button
            onClick={() =>
              setLook((v) => ({ ...v, pitch: Math.min(0.6, v.pitch + 0.2) }))
            }
          >
            ↑ {t.up}
          </button>
          <button
            onClick={() =>
              setLook((v) => ({ ...v, pitch: Math.max(-0.6, v.pitch - 0.2) }))
            }
          >
            ↓ {t.down}
          </button>
          {area && (
            <Link
              className="primary"
              to={root + "/portfolio/" + area.slug + "?from=" + stop}
            >
              {t.open} ↗
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
