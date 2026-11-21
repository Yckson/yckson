import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate, useSearchParams } from "react-router-dom";
import LabScene, {
  destinations,
  type Destination,
  type Stop,
} from "./LabScene";
import { boards, isBoard, computerScience, webMobile, portfolios, type Language } from "./catalog";
import { LabLoading } from "./LabLoading";

const copy = {
  en: {
    name: "Portfolio Hub",
    terminal: computerScience.title.en,
    phone: webMobile.title.en,
    wing: "Exit",
    books: "Articles",
    browse: "Open articles",
    directory: "View portfolios",
    move: "Approach",
    enter: "Enter portfolio",
    back: "Step back",
    arduino: "Arduino", esp32: "ESP32", fpga: "FPGA", workbench: "Development boards",
    hint: "Drag or use the arrow keys to look around. Choose 1 for Computer Science, 2 for the exit, or 3 for the bookshelf. Once there, press the same key to open it. Escape returns to the entrance.",
  },
  pt: {
    name: "Hub de Portfólios",
    terminal: computerScience.title.pt,
    phone: webMobile.title.pt,
    wing: "Saída",
    books: "Artigos",
    browse: "Abrir artigos",
    directory: "Ver portfólios",
    move: "Aproximar",
    enter: "Entrar no portfólio",
    back: "Voltar à entrada",
    arduino: "Arduino", esp32: "ESP32", fpga: "FPGA", workbench: "Placas de desenvolvimento",
    hint: "Arraste ou use as setas para olhar ao redor. Escolha 1 para Ciência da Computação, 2 para a saída ou 3 para a estante. Ao chegar, pressione a mesma tecla para abrir. Escape volta à entrada.",
  },
};
const guidedStops = {
  "computer-science": "terminal", "web-and-mobile": "phone",
  "embedded-systems": "arduino", "microelectronics-and-semiconductors": "fpga",
} as const;

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
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const signs = useRef<Partial<Record<Destination, HTMLButtonElement | null>>>(
    {},
  );
  const t = copy[language];
  const guide = portfolios.find(p => p.slug === params.get("guide"));
  const target = guide && guidedStops[guide.slug];
  const inBoards = isBoard(stop);
  const targetBoard = target !== undefined && isBoard(target);
  const atTarget = stop === target || (target === "arduino" && stop === "esp32");
  const nextSign = targetBoard && !inBoards ? "arduino" : target;
  const pt = language === "pt";
  const cue = atTarget
    ? (arrived === stop
      ? (pt ? "Selecione o marcador novamente para entrar." : "Select the marker again to enter.")
      : (pt ? "Aproximando…" : "Approaching…"))
    : inBoards && !targetBoard ? t.back
    : targetBoard && !inBoards ? (pt ? "Aproxime-se das placas à esquerda do computador." : "Approach the boards to the left of the computer.")
    : target === "fpga" ? (pt ? "Selecione a FPGA na bancada." : "Select the FPGA on the workbench.")
    : target === "arduino" ? (pt ? "Selecione o Arduino ou a ESP32." : "Select the Arduino or ESP32.")
    : target === "phone" ? (pt ? "Aproxime-se do celular sobre a cama." : "Approach the phone on the bed.")
    : (pt ? "Aproxime-se do computador sobre a mesa." : "Approach the computer on the desk.");
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
    const nextParams = new URLSearchParams(params);
    nextParams.set("stop", next);
    setParams(nextParams, { replace: true });
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
    } else if (isBoard(d)) {
      navigate("/" + language + "/portfolio/" + boards[d].slug + "?from=" + d);
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
        {t.hint} 4: Arduino. 5: ESP32. 6: FPGA. 7: {t.phone}.
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
          if (/^[1-7]$/.test(e.key)) {
            if (!e.repeat) pick(destinations[Number(e.key) - 1]);
            e.preventDefault();
            return;
          }
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
            case "Escape":
              visit("reception");
              break;
            default:
              return;
          }
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          if (e.isPrimary && e.button === 0 && !(e.target as Element).closest("button"))
            drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          const last = drag.current;
          if (!last || last.id !== e.pointerId || !e.buttons) return;
          const dx = e.clientX - last.x,
            dy = e.clientY - last.y;
          if (!last.moved && Math.hypot(dx, dy) < 4) return;
          if (!last.moved) e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: true };
          setHover(null);
          const touchGain = Math.min(0.014, Math.max(0.008, Math.PI / e.currentTarget.clientWidth));
          rotate(dx * (e.pointerType === "touch" ? touchGain : 0.005),
            dy * (e.pointerType === "touch" ? touchGain * 0.8 : 0.004));
        }}
        onPointerUp={(e) => {
          if (drag.current?.id === e.pointerId) drag.current = null;
        }}
        onPointerCancel={(e) => {
          if (drag.current?.id === e.pointerId) drag.current = null;
        }}
        onLostPointerCapture={(e) => {
          if (e.target === e.currentTarget && drag.current?.id === e.pointerId) drag.current = null;
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
              entering={entering && (stop === "phone" || stop === "terminal")}
              atPhone={stop === "phone" && arrived === "phone"}
              onScreenFramed={() => navigate("/" + language + "/portfolio/" + (stop === "phone" ? webMobile.slug : computerScience.slug) + "?from=" + stop)}
              atTerminal={stop === "terminal" && arrived === "terminal"} language={language}
              stop={stop}
              {...look}
              reduced={reduced}
              signs={signs}
              active={entering ? null : focus ?? hover ?? target ?? null}
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
        {ready && guide && !entering && <aside className="lab-guide" data-boards={inBoards} data-phone={stop === "phone"} role="status">
          <strong>{guide.title[language]}</strong>
          <span>{cue}</span>
        </aside>}
        <div className={isBoard(stop) ? "board-commands" : undefined}>
        {destinations.map((d) => (
          <button
            hidden
            key={d}
            className="waypoint"
            data-guided={d === nextSign || (nextSign === "arduino" && inBoards && d === "esp32")}
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
            <span className="waypoint-label">
              <small>
                {arrived !== d || stop !== d
                  ? t.move
                  : d === "books"
                    ? t.browse
                    : d === "wing"
                      ? t.directory
                      : t.enter}
              </small>
              <strong>{d === "arduino" && !isBoard(stop) ? t.workbench : t[d]}</strong>
              {isBoard(d) && stop === d && <small>{boards[d].title[language]}</small>}
            </span>
          </button>
        ))}
        </div>
        {!ready && <LabLoading language={language} />}
      </div>
    </section>
  );
}
