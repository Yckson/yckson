import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate, useSearchParams } from "react-router-dom";
import LabScene, {
  destinations,
  type Destination,
  type Stop,
} from "./LabScene";
import { portfolios, type Language } from "./catalog";

const copy = {
  en: {
    name: "Repository Hub",
    terminal: "Computer terminal",
    wing: "Computer Science",
    move: "Approach",
    enter: "Enter portfolio",
    back: "Step back",
    loading: "Opening the lab…",
    hint: "Drag or use the arrow keys to look around. Press 1 for the terminal, 2 for Computer Science, or Escape to step back.",
  },
  pt: {
    name: "Hub de repositórios",
    terminal: "Terminal de computador",
    wing: "Ciência da Computação",
    move: "Aproximar",
    enter: "Entrar no portfólio",
    back: "Voltar à entrada",
    loading: "Abrindo o laboratório…",
    hint: "Arraste ou use as setas para olhar ao redor. Pressione 1 para o terminal, 2 para Ciência da Computação ou Escape para voltar à entrada.",
  },
};
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
  const stop: Stop =
    destinations.find((s) => s === params.get("stop")) ?? "reception";
  const navigate = useNavigate();
  const [look, setLook] = useState({ yaw: 0, pitch: 0 });
  const [hover, setHover] = useState<Destination | null>(null);
  const [focus, setFocus] = useState<Destination | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const signs = useRef<Partial<Record<Destination, HTMLButtonElement | null>>>(
    {},
  );
  const t = copy[language];
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => () => clearTimeout(timer.current), []);
  function interacting() {
    setBusy(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBusy(false), 850);
  }
  function visit(next: Stop) {
    setHover(null);
    setFocus(null);
    setLook({ yaw: 0, pitch: 0 });
    setParams({ stop: next }, { replace: true });
    viewport.current?.focus({ preventScroll: true });
    interacting();
  }
  function pick(d: Destination) {
    if (d === "wing" && stop === d) {
      const portfolio = portfolios.find((p) => p.stop === d)!;
      navigate("/" + language + "/portfolio/" + portfolio.slug + "?from=" + d);
    } else visit(d);
  }
  function rotate(dx: number, dy: number) {
    interacting();
    setLook((v) => ({
      yaw: v.yaw + dx,
      pitch: Math.max(-0.85, Math.min(0.85, v.pitch + dy)),
    }));
  }
  return (
    <section className="lab" data-interacting={busy} aria-label={t.name}>
      <h1 className="sr-only">{t.name}</h1>
      <p id="lab-help" className="sr-only">
        {t.hint}
      </p>
      <div
        ref={viewport}
        className="viewport"
        tabIndex={0}
        role="group"
        aria-label={t.name}
        aria-describedby="lab-help"
        data-target={hover ?? ""}
        onKeyDown={(e) => {
          if (e.altKey || e.ctrlKey || e.metaKey) return;
          switch (e.key) {
            case "ArrowLeft":
              rotate(0.16, 0);
              break;
            case "ArrowRight":
              rotate(-0.16, 0);
              break;
            case "ArrowUp":
              rotate(0, 0.12);
              break;
            case "ArrowDown":
              rotate(0, -0.12);
              break;
            case "1":
              pick("terminal");
              break;
            case "2":
              pick("wing");
              break;
            case "Escape":
              visit("reception");
              break;
            default:
              return;
          }
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          if (e.button === 0 && !(e.target as Element).closest("button"))
            drag.current = { x: e.clientX, y: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          const last = drag.current;
          if (!last || !e.buttons) return;
          const dx = e.clientX - last.x,
            dy = e.clientY - last.y;
          if (!last.moved && Math.hypot(dx, dy) < 4) return;
          if (!last.moved) e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, moved: true };
          setHover(null);
          rotate(dx * 0.005, dy * 0.004);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <Canvas
          gl={{ antialias: false }}
          shadows
          aria-hidden="true"
          dpr={0.75}
          frameloop="demand"
          camera={{ near: 0.08, far: 38 }}
        >
          <color attach="background" args={["#10251b"]} />
          <Suspense fallback={null}>
            <LabScene
              stop={stop}
              {...look}
              reduced={reduced}
              signs={signs}
              active={focus ?? hover}
              onHover={setHover}
              onPick={pick}
              onReady={onReady}
              onLoss={onLoss}
            />
          </Suspense>
        </Canvas>
        {ready && stop !== "reception" && (
          <button className="return-command" onClick={() => visit("reception")}>
            ← {t.back}
          </button>
        )}
        {destinations.map((d) => (
          <button
            hidden
            key={d}
            className="waypoint"
            ref={(el) => {
              signs.current[d] = el;
            }}
            onPointerEnter={() => setHover(d)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setFocus(d)}
            onBlur={() => setFocus(null)}
            onClick={() => pick(d)}
          >
            <span className="waypoint-glyph" aria-hidden="true">
              {d === "terminal" ? "›_" : "↗"}
            </span>
            <span>
              <small>
                {d === "wing" && stop === "wing" ? t.enter : t.move}
              </small>
              <strong>{t[d]}</strong>
            </span>
          </button>
        ))}
        {!ready && (
          <span className="loading" role="status">
            {t.loading}
          </span>
        )}
      </div>
    </section>
  );
}
