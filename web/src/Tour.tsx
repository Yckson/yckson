import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate, useSearchParams } from "react-router-dom";
import LabScene, {
  destinations,
  type Destination,
  type Stop,
} from "./LabScene";
import { computerScience, type Language } from "./catalog";
import { LabLoading } from "./LabLoading";

const copy = {
  en: {
    name: "Repository Hub",
    terminal: computerScience.title.en,
    wing: "Exit",
    books: "Articles",
    browse: "Open articles",
    directory: "View portfolios",
    move: "Approach",
    enter: "Enter portfolio",
    back: "Step back",
    loading: "Opening the lab…",
    hint: "Drag or use the arrow keys to look around. Choose 1 for Computer Science, 2 for the exit, or 3 for the bookshelf. Once there, press the same key to open it. Escape returns to the entrance.",
  },
  pt: {
    name: "Hub de repositórios",
    terminal: computerScience.title.pt,
    wing: "Saída",
    books: "Artigos",
    browse: "Abrir artigos",
    directory: "Ver portfólios",
    move: "Aproximar",
    enter: "Entrar no portfólio",
    back: "Voltar à entrada",
    loading: "Abrindo o laboratório…",
    hint: "Arraste ou use as setas para olhar ao redor. Escolha 1 para Ciência da Computação, 2 para a saída ou 3 para a estante. Ao chegar, pressione a mesma tecla para abrir. Escape volta à entrada.",
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
  const [arrived, setArrived] = useState<Stop | null>(null);
  const stop: Stop =
    destinations.find((d) => d === params.get("stop")) ?? "reception";
  const navigate = useNavigate();
  const [look, setLook] = useState({ yaw: 0, pitch: 0 });
  const [hover, setHover] = useState<Destination | null>(null);
  const [focus, setFocus] = useState<Destination | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [entering, setEntering] = useState(false);
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
    setEntering(false);
    setHover(null);
    setFocus(null);
    setLook({ yaw: 0, pitch: 0 });
    setParams({ stop: next }, { replace: true });
    viewport.current?.focus({ preventScroll: true });
    interacting();
  }
  function pick(d: Destination) {
    if (entering) return;
    if (stop !== d) {
      setArrived(null);
      visit(d);
      return;
    }
    if (arrived !== d) return;
    if (d === "books") {
      navigate("/" + language + "/articles?from=books");
    } else if (d === "wing") {
      navigate("/" + language + "/portfolios");
    } else {
      setEntering(true);
      setHover(null);
      setFocus(null);
    }
  }
  function rotate(dx: number, dy: number) {
    if (entering) return;
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
          if (e.repeat && ["1", "2", "3"].includes(e.key)) return;
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
            case "3":
              pick("books");
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
              entering={entering && stop === "terminal"}
              onScreenFramed={() => navigate("/" + language + "/portfolio/" + computerScience.slug + "?from=terminal")}
              atTerminal={stop === "terminal" && arrived === "terminal"} language={language}
              stop={stop}
              {...look}
              reduced={reduced}
              signs={signs}
              active={entering ? null : focus ?? hover}
              onHover={setHover}
              onPick={pick}
              onArrive={setArrived}
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
                {arrived !== d || stop !== d
                  ? t.move
                  : d === "books"
                    ? t.browse
                    : d === "wing"
                      ? t.directory
                      : t.enter}
              </small>
              <strong>{t[d]}</strong>
            </span>
          </button>
        ))}
        {!ready && <LabLoading language={language} />}
      </div>
    </section>
  );
}
