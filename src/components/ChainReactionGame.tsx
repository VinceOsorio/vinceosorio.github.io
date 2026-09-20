import { useEffect, useMemo, useRef, useState } from "react";

type PartType = "ramp" | "bumper" | "conveyor" | "launcher";
type Part = {
  id: number;
  type: PartType;
  col: number;
  row: number;
  flipped: boolean;
  locked?: boolean;
};
type Ball = { x: number; y: number; vx: number; vy: number };
type Challenge = {
  name: string;
  description: string;
  start: Ball;
  bucket: { x: number; y: number; width: number; height: number };
  fixedParts: Part[];
};

const WIDTH = 720;
const HEIGHT = 360;
const COLS = 9;
const ROWS = 4;
const CELL_W = WIDTH / COLS;
const CELL_H = 70;
const GRID_TOP = 38;
const BALL_RADIUS = 9;

const partLabels: Record<PartType, { name: string; hint: string; icon: string }> = {
  ramp: { name: "Ramp", hint: "Guides the ball", icon: "╱" },
  bumper: { name: "Bumper", hint: "Bounces the ball", icon: "●" },
  conveyor: { name: "Conveyor", hint: "Adds horizontal speed", icon: "▰" },
  launcher: { name: "Launcher", hint: "Kicks the ball upward", icon: "↗" },
};

const challenges: Challenge[] = [
  {
    name: "Workshop Warm-up",
    description: "Guide the ball across the shop floor into the bucket on the right.",
    start: { x: 45, y: 42, vx: 42, vy: 0 },
    bucket: { x: 643, y: 274, width: 57, height: 58 },
    fixedParts: [
      { id: -1, type: "ramp", col: 1, row: 1, flipped: false, locked: true },
      { id: -2, type: "bumper", col: 3, row: 3, flipped: false, locked: true },
    ],
  },
  {
    name: "High Bucket",
    description: "Use launchers and bumpers to reach the raised bucket.",
    start: { x: 48, y: 250, vx: 58, vy: 0 },
    bucket: { x: 635, y: 102, width: 60, height: 58 },
    fixedParts: [
      { id: -3, type: "conveyor", col: 2, row: 3, flipped: false, locked: true },
      { id: -4, type: "launcher", col: 5, row: 3, flipped: false, locked: true },
    ],
  },
  {
    name: "Reverse Run",
    description: "The ball starts on the right and the target is on the left.",
    start: { x: 674, y: 48, vx: -48, vy: 0 },
    bucket: { x: 20, y: 274, width: 58, height: 58 },
    fixedParts: [
      { id: -5, type: "ramp", col: 7, row: 1, flipped: true, locked: true },
      { id: -6, type: "bumper", col: 5, row: 2, flipped: false, locked: true },
      { id: -7, type: "conveyor", col: 3, row: 3, flipped: true, locked: true },
    ],
  },
  {
    name: "Zigzag Drop",
    description: "Navigate alternating fixed ramps to reach a centre bucket.",
    start: { x: 54, y: 38, vx: 36, vy: 0 },
    bucket: { x: 332, y: 274, width: 58, height: 58 },
    fixedParts: [
      { id: -8, type: "ramp", col: 1, row: 0, flipped: false, locked: true },
      { id: -9, type: "ramp", col: 3, row: 1, flipped: true, locked: true },
      { id: -10, type: "ramp", col: 5, row: 2, flipped: false, locked: true },
    ],
  },
];

function partPosition(part: Part) {
  return {
    x: part.col * CELL_W + CELL_W / 2,
    y: GRID_TOP + part.row * CELL_H + CELL_H / 2,
  };
}

export function ChainReactionGame() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const challenge = challenges[challengeIndex] ?? challenges[0];
  const [parts, setParts] = useState<Part[]>(challenge.fixedParts);
  const [selected, setSelected] = useState<PartType>("ramp");
  const [ball, setBall] = useState<Ball>(challenge.start);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<"building" | "running" | "success" | "stopped">("building");
  const nextId = useRef(1);
  const animation = useRef<number | null>(null);
  const liveBall = useRef<Ball>(challenge.start);
  const lastTime = useRef(0);
  const runStarted = useRef(0);

  const statusText = useMemo(() => {
    if (result === "success") return "Chain complete - target reached!";
    if (result === "stopped") return "The ball stopped. Adjust the machine and try again.";
    if (result === "running") return "Machine in motion...";
    return "Select a component, then click a grid space to place it.";
  }, [result]);

  const resetBall = () => {
    if (animation.current) cancelAnimationFrame(animation.current);
    liveBall.current = { ...challenge.start };
    setBall({ ...challenge.start });
    setRunning(false);
    setResult("building");
    lastTime.current = 0;
    runStarted.current = 0;
  };

  const clearMachine = () => {
    resetBall();
    setParts(challenge.fixedParts);
  };

  const selectChallenge = (index: number) => {
    if (animation.current) cancelAnimationFrame(animation.current);
    const selectedChallenge = challenges[index] ?? challenges[0];
    setChallengeIndex(index);
    setParts(selectedChallenge.fixedParts);
    setBall({ ...selectedChallenge.start });
    liveBall.current = { ...selectedChallenge.start };
    setRunning(false);
    setResult("building");
    lastTime.current = 0;
    runStarted.current = 0;
  };

  const placePart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (running) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const y = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
    const col = Math.max(0, Math.min(COLS - 1, Math.floor(x / CELL_W)));
    const row = Math.max(0, Math.min(ROWS - 1, Math.floor((y - GRID_TOP) / CELL_H)));
    const startCol = Math.floor(challenge.start.x / CELL_W);
    const startRow = Math.floor((challenge.start.y - GRID_TOP) / CELL_H);
    if (
      y < GRID_TOP ||
      y > GRID_TOP + ROWS * CELL_H ||
      (col === startCol && row === Math.max(0, startRow))
    )
      return;

    setParts((current) => {
      const existing = current.find((part) => part.col === col && part.row === row);
      if (existing?.locked) return current;
      if (existing) {
        return current.map((part) =>
          part.id === existing.id ? { ...part, flipped: !part.flipped } : part,
        );
      }
      if (current.filter((part) => !part.locked).length >= 10) return current;
      return [...current, { id: nextId.current++, type: selected, col, row, flipped: false }];
    });
  };

  const removePart = (id: number) => {
    if (!running) setParts((current) => current.filter((part) => part.id !== id || part.locked));
  };

  useEffect(() => {
    if (!running) return;

    const step = (time: number) => {
      if (!runStarted.current) runStarted.current = time;
      const dt = Math.min((time - (lastTime.current || time)) / 1000, 0.025);
      lastTime.current = time;
      const next = { ...liveBall.current };

      next.vy += 205 * dt;
      next.x += next.vx * dt;
      next.y += next.vy * dt;

      for (const part of parts) {
        const centre = partPosition(part);
        if (part.type === "bumper") {
          const dx = next.x - centre.x;
          const dy = next.y - centre.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 25 + BALL_RADIUS && distance > 0) {
            const nx = dx / distance;
            const ny = dy / distance;
            next.x = centre.x + nx * (25 + BALL_RADIUS);
            next.y = centre.y + ny * (25 + BALL_RADIUS);
            const approach = next.vx * nx + next.vy * ny;
            next.vx -= 1.8 * approach * nx;
            next.vy -= 1.8 * approach * ny;
            next.vx += nx * 35;
            next.vy += ny * 35;
          }
        } else if (part.type === "conveyor") {
          const top = centre.y - 13;
          if (
            Math.abs(next.x - centre.x) < 34 &&
            next.y + BALL_RADIUS >= top &&
            next.y < top + 13 &&
            next.vy >= 0
          ) {
            next.y = top - BALL_RADIUS;
            next.vy = -Math.abs(next.vy) * 0.15;
            next.vx += (part.flipped ? -125 : 125) * dt;
          }
        } else {
          const direction = part.flipped ? -1 : 1;
          const localX = next.x - centre.x;
          if (Math.abs(localX) < 35) {
            const slope = part.type === "launcher" ? -0.58 * direction : 0.5 * direction;
            const surfaceY = centre.y + localX * slope;
            if (
              next.y + BALL_RADIUS >= surfaceY &&
              next.y + BALL_RADIUS <= surfaceY + 13 &&
              next.vy > -40
            ) {
              next.y = surfaceY - BALL_RADIUS;
              if (part.type === "launcher") {
                next.vy = -155;
                next.vx += 58 * direction;
              } else {
                next.vy = -Math.abs(next.vy) * 0.12;
                next.vx += 54 * direction * dt;
              }
            }
          }
        }
      }

      if (next.y + BALL_RADIUS > 332) {
        next.y = 332 - BALL_RADIUS;
        next.vy = -Math.abs(next.vy) * 0.28;
        next.vx *= 0.994;
      }
      if (next.x - BALL_RADIUS < 0) {
        next.x = BALL_RADIUS;
        next.vx = Math.abs(next.vx) * 0.65;
      }

      const inBucket =
        next.x > challenge.bucket.x &&
        next.x < challenge.bucket.x + challenge.bucket.width &&
        next.y > challenge.bucket.y;
      if (inBucket) {
        liveBall.current = next;
        setBall(next);
        setRunning(false);
        setResult("success");
        return;
      }

      if (next.x > WIDTH + 20 || next.y > HEIGHT + 20 || time - runStarted.current > 18000) {
        setRunning(false);
        setResult("stopped");
        return;
      }

      liveBall.current = next;
      setBall(next);
      animation.current = requestAnimationFrame(step);
    };

    animation.current = requestAnimationFrame(step);
    return () => {
      if (animation.current) cancelAnimationFrame(animation.current);
    };
  }, [running, parts, challenge]);

  const runMachine = () => {
    resetBall();
    liveBall.current = { ...challenge.start };
    lastTime.current = 0;
    setResult("running");
    setRunning(true);
  };

  return (
    <div className="machine-panel relative overflow-hidden p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="technical-label">Interactive mechanism lab</p>
          <h2 className="mt-2 text-2xl font-bold text-starlight sm:text-3xl">
            Chain Reaction Builder
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Place and rotate mechanical components to guide the ball from the launch point into the
            target bucket. Test, adjust and try again.
          </p>
        </div>
        <div className="border border-border bg-card px-4 py-3 text-center">
          <span className="technical-label block">Current challenge</span>
          <strong className="mt-1 block font-mono text-sm text-primary">
            {challengeIndex + 1}/{challenges.length} · {challenge.name}
          </strong>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Game challenge selection">
        {challenges.map((item, index) => (
          <button
            key={item.name}
            type="button"
            disabled={running}
            onClick={() => selectChallenge(index)}
            className={`border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${index === challengeIndex ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
          >
            {String(index + 1).padStart(2, "0")} · {item.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{challenge.description}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[190px_1fr]">
        <div>
          <p className="technical-label mb-3">Component tray</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {(Object.keys(partLabels) as PartType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelected(type)}
                disabled={running}
                className={`flex items-center gap-3 border p-3 text-left transition-colors ${selected === type ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background font-mono text-lg text-primary">
                  {partLabels[type].icon}
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-starlight">
                    {partLabels[type].name}
                  </span>
                  <span className="mt-1 hidden text-[10px] text-muted-foreground sm:block">
                    {partLabels[type].hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Click an occupied cell to rotate it. Double-click a part to remove it.
          </p>
        </div>

        <div>
          <div
            role="application"
            aria-label="Rube Goldberg machine building area"
            onClick={placePart}
            className="blueprint-grid relative aspect-[2/1] min-h-72 w-full cursor-crosshair overflow-hidden border border-border bg-background/70"
          >
            <div
              className="absolute text-center"
              style={{
                left: `${Math.max(1, (challenge.start.x / WIDTH) * 100 - 4)}%`,
                top: `${Math.max(1, (challenge.start.y / HEIGHT) * 100 - 8)}%`,
              }}
            >
              <span className="technical-label">Start</span>
              <div className="mt-1 h-1 w-16 bg-primary/70" />
            </div>
            <div
              className="absolute border-x-4 border-b-4 border-primary/80 bg-primary/10"
              style={{
                left: `${(challenge.bucket.x / WIDTH) * 100}%`,
                top: `${(challenge.bucket.y / HEIGHT) * 100}%`,
                width: `${(challenge.bucket.width / WIDTH) * 100}%`,
                height: `${(challenge.bucket.height / HEIGHT) * 100}%`,
              }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase text-primary">
                Target
              </span>
            </div>
            <div className="absolute bottom-[7.3%] left-0 right-0 h-1 bg-border" />

            {parts.map((part) => {
              const { x, y } = partPosition(part);
              return (
                <button
                  key={part.id}
                  type="button"
                  title={
                    part.locked
                      ? `Fixed ${partLabels[part.type].name}`
                      : `${partLabels[part.type].name}: click to rotate, double-click to remove`
                  }
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    removePart(part.id);
                  }}
                  className={`absolute z-10 flex h-14 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${part.locked ? "cursor-not-allowed opacity-75" : ""}`}
                  style={{ left: `${(x / WIDTH) * 100}%`, top: `${(y / HEIGHT) * 100}%` }}
                >
                  {part.type === "bumper" ? (
                    <span className="h-12 w-12 rounded-full border-4 border-primary bg-primary/20 shadow-[0_0_18px_rgba(80,170,255,0.25)]" />
                  ) : part.type === "conveyor" ? (
                    <span
                      className={`relative h-6 w-16 border-2 border-primary/80 bg-card ${part.flipped ? "rotate-180" : ""}`}
                    >
                      <span className="absolute inset-0 flex items-center justify-around font-mono text-xs text-primary">
                        › › ›
                      </span>
                    </span>
                  ) : (
                    <span
                      className={`h-1.5 w-16 bg-primary shadow-[0_0_10px_rgba(80,170,255,0.35)] ${part.flipped ? "-rotate-[28deg]" : "rotate-[28deg]"}`}
                    >
                      {part.type === "launcher" && (
                        <span className="absolute -right-1 -top-2 h-5 w-2 bg-starlight" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}

            <div
              className="pointer-events-none absolute z-20 h-[18px] w-[18px] rounded-full border-2 border-white bg-primary shadow-[0_0_16px_rgba(80,170,255,0.8)]"
              style={{
                left: `${((ball.x - BALL_RADIUS) / WIDTH) * 100}%`,
                top: `${((ball.y - BALL_RADIUS) / HEIGHT) * 100}%`,
              }}
            />
          </div>

          <div
            className={`mt-3 border-l-2 px-4 py-2 text-sm ${result === "success" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
          >
            {statusText}
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-foreground/45">
            Fixed components are faded and cannot be moved · Your parts:{" "}
            {parts.filter((part) => !part.locked).length}/10
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Experiment with gravity, momentum and component placement. The same layout may behave
          differently when a ramp is rotated or a conveyor changes direction.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearMachine}
            disabled={running}
            className="border border-border px-4 py-3 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={resetBall}
            className="border border-border px-4 py-3 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Reset ball
          </button>
          <button
            type="button"
            onClick={runMachine}
            disabled={running}
            className="border border-primary bg-primary px-5 py-3 font-mono text-xs font-bold uppercase text-primary-foreground transition-colors hover:bg-background hover:text-primary disabled:opacity-50"
          >
            {result === "success" ? "Run again" : "Run machine"}
          </button>
          {result === "success" && challengeIndex < challenges.length - 1 && (
            <button
              type="button"
              onClick={() => selectChallenge(challengeIndex + 1)}
              className="border border-primary px-5 py-3 font-mono text-xs font-bold uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Next challenge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
