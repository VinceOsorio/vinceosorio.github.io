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

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Challenge = {
  name: string;
  description: string;
  start: Ball;
  bucket: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fixedParts: Part[];
};

const WIDTH = 720;
const HEIGHT = 360;
const COLS = 9;
const ROWS = 4;

const CELL_W = WIDTH / COLS;
const CELL_H = 70;
const GRID_TOP = 38;
const FLOOR_Y = 332;
const BALL_RADIUS = 9;

const GRAVITY = 205;
const MAX_PARTS = 10;

const partLabels: Record<
  PartType,
  { name: string; hint: string; icon: string }
> = {
  ramp: {
    name: "Ramp",
    hint: "Guides the ball",
    icon: "╱",
  },
  bumper: {
    name: "Bumper",
    hint: "Bounces the ball",
    icon: "●",
  },
  conveyor: {
    name: "Conveyor",
    hint: "Adds horizontal speed",
    icon: "▰",
  },
  launcher: {
    name: "Launcher",
    hint: "Kicks the ball upward",
    icon: "↗",
  },
};

const challenges = [
  {
    name: "Workshop Warm-up",
    description:
      "Guide the ball across the shop floor into the bucket on the right.",
    start: { x: 45, y: 42, vx: 55, vy: 0 },
    bucket: { x: 643, y: 274, width: 57, height: 58 },
    fixedParts: [
        {
          id: -1,
          type: "ramp",
          col: 1,
          row: 1,
          flipped: false,
          locked: true,
        },
        {
          id: -2,
          type: "bumper",
          col: 3,
          row: 3,
          flipped: false,
          locked: true,
        },
      ],
    },

  {
    name: "High Bucket",
    description:
      "Use launchers and bumpers to reach the raised bucket.",
    start: { x: 48, y: 250, vx: 68, vy: 0 },
    bucket: { x: 635, y: 102, width: 60, height: 58 },
    fixedParts: [
      {
        id: -3,
        type: "conveyor",
        col: 2,
        row: 3,
        flipped: false,
        locked: true,
      },
      {
        id: -4,
        type: "launcher",
        col: 5,
        row: 3,
        flipped: false,
        locked: true,
      },
    ],
  },

  {
    name: "Reverse Run",
    description:
      "The ball starts on the right and the target is on the left.",
    start: { x: 674, y: 48, vx: -58, vy: 0 },
    bucket: { x: 20, y: 274, width: 58, height: 58 },
    fixedParts: [
      {
        id: -5,
        type: "ramp",
        col: 7,
        row: 1,
        flipped: true,
        locked: true,
      },
      {
        id: -6,
        type: "bumper",
        col: 5,
        row: 2,
        flipped: false,
        locked: true,
      },
      {
        id: -7,
        type: "conveyor",
        col: 3,
        row: 3,
        flipped: true,
        locked: true,
      },
    ],
  },

  {
    name: "Zigzag Drop",
    description:
      "Navigate alternating fixed ramps to reach a centre bucket.",
    start: { x: 54, y: 38, vx: 48, vy: 0 },
    bucket: { x: 332, y: 274, width: 58, height: 58 },
    fixedParts: [
      {
        id: -8,
        type: "ramp",
        col: 1,
        row: 0,
        flipped: false,
        locked: true,
      },
      {
        id: -9,
        type: "ramp",
        col: 3,
        row: 1,
        flipped: true,
        locked: true,
      },
      {
        id: -10,
        type: "ramp",
        col: 5,
        row: 2,
        flipped: false,
        locked: true,
      },
    ],
  },
] satisfies [Challenge, ...Challenge[]];

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
  const [running, setRunning] = useState(false);

  const [result, setResult] = useState<
    "building" | "running" | "success" | "stopped"
  >("building");

  const [removeMode, setRemoveMode] = useState(false);
  const [activePart, setActivePart] = useState<number | null>(null);

  const nextId = useRef(1);
  const animation = useRef<number | null>(null);
  const ballElement = useRef<HTMLDivElement | null>(null);

  const liveBall = useRef<Ball>({ ...challenge.start });
  const lastTime = useRef(0);
  const runStarted = useRef(0);

  const stillTime = useRef(0);

  // Prevent the same launcher / bumper from triggering
  // repeatedly while the ball is still touching it.
  const collisionCooldown = useRef<Record<number, number>>({});

  const drawBall = (next: Ball) => {
    if (!ballElement.current) return;

    ballElement.current.style.transform = `translate3d(
      ${next.x - BALL_RADIUS}px,
      ${next.y - BALL_RADIUS}px,
      0
    )`;
  };

  const statusText = useMemo(() => {
    if (result === "success") {
      return "Chain complete — target reached!";
    }

    if (result === "stopped") {
      return "The ball stopped. Adjust the machine and try again.";
    }

    if (result === "running") {
      return "Machine in motion...";
    }

    if (removeMode) {
      return "Remove mode active — tap a component to remove it.";
    }

    return "Select a component, then place it on the grid.";
  }, [result, removeMode]);

  const resetBall = () => {
    if (animation.current) {
      cancelAnimationFrame(animation.current);
    }

    liveBall.current = { ...challenge.start };

    requestAnimationFrame(() => {
      drawBall(challenge.start);
    });

    collisionCooldown.current = {};
    stillTime.current = 0;
    lastTime.current = 0;
    runStarted.current = 0;

    setRunning(false);
    setResult("building");
    setActivePart(null);
  };

  const clearMachine = () => {
    resetBall();
    setParts(challenge.fixedParts);
    setRemoveMode(false);
  };

  const selectChallenge = (index: number) => {
    if (animation.current) {
      cancelAnimationFrame(animation.current);
    }

    const nextChallenge = challenges[index] ?? challenges[0];

    setChallengeIndex(index);
    setParts(nextChallenge.fixedParts);

    liveBall.current = { ...nextChallenge.start };

    requestAnimationFrame(() => {
      drawBall(nextChallenge.start);
    });

    collisionCooldown.current = {};
    stillTime.current = 0;
    lastTime.current = 0;
    runStarted.current = 0;

    setRunning(false);
    setResult("building");
    setRemoveMode(false);
    setActivePart(null);
  };

  const placePart = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (running || removeMode) return;

    const bounds = event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) / bounds.width) * WIDTH;

    const y =
      ((event.clientY - bounds.top) / bounds.height) * HEIGHT;

    if (
      y < GRID_TOP ||
      y > GRID_TOP + ROWS * CELL_H
    ) {
      return;
    }

    const col = Math.max(
      0,
      Math.min(
        COLS - 1,
        Math.floor(x / CELL_W),
      ),
    );

    const row = Math.max(
      0,
      Math.min(
        ROWS - 1,
        Math.floor((y - GRID_TOP) / CELL_H),
      ),
    );

    const startCol = Math.floor(
      challenge.start.x / CELL_W,
    );

    const startRow = Math.floor(
      (challenge.start.y - GRID_TOP) / CELL_H,
    );

    if (
      col === startCol &&
      row === Math.max(0, startRow)
    ) {
      return;
    }

    setParts((current) => {
      const existing = current.find(
        (part) =>
          part.col === col &&
          part.row === row,
      );

      if (existing) {
        return current;
      }

      const userPartCount = current.filter(
        (part) => !part.locked,
      ).length;

      if (userPartCount >= MAX_PARTS) {
        return current;
      }

      return [
        ...current,
        {
          id: nextId.current++,
          type: selected,
          col,
          row,
          flipped: false,
        },
      ];
    });
  };

  const rotatePart = (id: number) => {
    if (running) return;

    setParts((current) =>
      current.map((part) =>
        part.id === id && !part.locked
          ? {
              ...part,
              flipped: !part.flipped,
            }
          : part,
      ),
    );
  };

  const removePart = (id: number) => {
    if (running) return;

    setParts((current) =>
      current.filter(
        (part) =>
          part.id !== id || part.locked,
      ),
    );
  };

  const interactWithPart = (
    event: React.PointerEvent<HTMLButtonElement>,
    part: Part,
  ) => {
    event.stopPropagation();

    if (running || part.locked) return;

    if (removeMode) {
      removePart(part.id);
      return;
    }

    rotatePart(part.id);
  };

  useEffect(() => {
    if (!running) return;

    const step = (time: number) => {
      if (!runStarted.current) {
        runStarted.current = time;
      }

      const rawDt =
        (time - (lastTime.current || time)) /
        1000;

      const frameDt = Math.min(rawDt, 0.032);

      lastTime.current = time;

      /*
       * Several smaller physics steps per visual frame.
       * This prevents the ball from jumping through ramps
       * and makes collisions much more consistent.
       */
      const substeps = 4;
      const dt = frameDt / substeps;

      let next = { ...liveBall.current };

      for (let stepIndex = 0; stepIndex < substeps; stepIndex++) {
        next.vy += GRAVITY * dt;

        next.x += next.vx * dt;
        next.y += next.vy * dt;

        for (const part of parts) {
          const centre = partPosition(part);

          const cooldownUntil =
            collisionCooldown.current[part.id] ?? 0;

          /*
           * BUMPER
           */
          if (part.type === "bumper") {
            const dx = next.x - centre.x;
            const dy = next.y - centre.y;

            const distance = Math.hypot(dx, dy);
            const collisionDistance =
              25 + BALL_RADIUS;

            if (
              distance < collisionDistance &&
              distance > 0
            ) {
              const nx = dx / distance;
              const ny = dy / distance;

              // Push ball outside bumper first.
              next.x =
                centre.x +
                nx * collisionDistance;

              next.y =
                centre.y +
                ny * collisionDistance;

              const approach =
                next.vx * nx +
                next.vy * ny;

              if (
                approach < 0 &&
                time >= cooldownUntil
              ) {
                const bounce = 1.55;

                next.vx -=
                  bounce * approach * nx;

                next.vy -=
                  bounce * approach * ny;

                // Small extra kick makes bumper feel responsive.
                next.vx += nx * 18;
                next.vy += ny * 18;

                collisionCooldown.current[
                  part.id
                ] = time + 90;

                setActivePart(part.id);

                window.setTimeout(() => {
                  setActivePart((current) =>
                    current === part.id
                      ? null
                      : current,
                  );
                }, 110);
              }
            }

            continue;
          }

          /*
           * CONVEYOR
           */
          if (part.type === "conveyor") {
            const top = centre.y - 13;

            if (
              Math.abs(next.x - centre.x) < 35 &&
              next.y + BALL_RADIUS >= top &&
              next.y + BALL_RADIUS <= top + 12 &&
              next.vy >= -10
            ) {
              next.y =
                top - BALL_RADIUS;

              if (next.vy > 0) {
                next.vy *= -0.08;
              }

              const direction =
                part.flipped ? -1 : 1;

              /*
               * Move toward a useful conveyor velocity
               * instead of adding speed forever.
               */
              const targetVX =
                115 * direction;

              next.vx +=
                (targetVX - next.vx) *
                Math.min(1, 4.5 * dt);
            }

            continue;
          }

          /*
           * RAMP / LAUNCHER
           */
          const direction =
            part.flipped ? -1 : 1;

          const localX =
            next.x - centre.x;

          if (Math.abs(localX) > 36) {
            continue;
          }

          const slope =
            part.type === "launcher"
              ? -0.58 * direction
              : 0.5 * direction;

          const surfaceY =
            centre.y +
            localX * slope;

          const ballBottom =
            next.y + BALL_RADIUS;

          const touchingSurface =
            ballBottom >= surfaceY - 2 &&
            ballBottom <= surfaceY + 10;

          if (!touchingSurface) {
            continue;
          }

          /*
           * Put ball exactly on the surface so it
           * doesn't vibrate inside the ramp.
           */
          next.y =
            surfaceY - BALL_RADIUS;

          if (part.type === "launcher") {
            if (time >= cooldownUntil) {
              next.vy = -175;

              next.vx +=
                72 * direction;

              collisionCooldown.current[
                part.id
              ] = time + 260;

              setActivePart(part.id);

              window.setTimeout(() => {
                setActivePart((current) =>
                  current === part.id
                    ? null
                    : current,
                );
              }, 130);
            }

            continue;
          }

          /*
           * Ramp response.
           *
           * Rather than repeatedly bouncing the ball,
           * gently redirect its velocity along the
           * surface.
           */
          if (next.vy > -30) {
            const tangentX =
              direction;

            const tangentY =
              0.5;

            const length = Math.hypot(
              tangentX,
              tangentY,
            );

            const tx =
              tangentX / length;

            const ty =
              tangentY / length;

            const speedAlongRamp =
              next.vx * tx +
              next.vy * ty;

            const guidedSpeed =
              Math.max(
                45,
                Math.abs(speedAlongRamp),
              );

            next.vx =
              tx *
              guidedSpeed *
              Math.sign(
                speedAlongRamp || direction,
              );

            next.vy =
              ty *
              guidedSpeed *
              Math.sign(
                speedAlongRamp || direction,
              );

            /*
             * Prevent ramp contact from feeling sticky.
             */
            next.vx +=
              direction * 9 * dt;
          }
        }

        /*
         * FLOOR
         */
        if (
          next.y + BALL_RADIUS >
          FLOOR_Y
        ) {
          next.y =
            FLOOR_Y - BALL_RADIUS;

          if (Math.abs(next.vy) > 32) {
            next.vy =
              -Math.abs(next.vy) * 0.2;
          } else {
            next.vy = 0;
          }

          next.vx *=
            Math.pow(0.988, dt * 60);

          if (
            Math.abs(next.vx) < 1.5
          ) {
            next.vx = 0;
          }
        }

        /*
         * SIDE WALLS
         */
        if (
          next.x - BALL_RADIUS <
          0
        ) {
          next.x = BALL_RADIUS;
          next.vx =
            Math.abs(next.vx) * 0.55;
        }

        if (
          next.x + BALL_RADIUS >
          WIDTH
        ) {
          next.x =
            WIDTH - BALL_RADIUS;
          next.vx =
            -Math.abs(next.vx) * 0.55;
        }
      }

      /*
       * TARGET CHECK
       */
      const inBucket =
        next.x >
          challenge.bucket.x &&
        next.x <
          challenge.bucket.x +
            challenge.bucket.width &&
        next.y >
          challenge.bucket.y;

      if (inBucket) {
        liveBall.current = next;
        drawBall(next);

        setRunning(false);
        setResult("success");
        return;
      }

      /*
       * Detect a ball that has effectively stopped.
       * No more waiting around for 18 seconds.
       */
      const speed =
        Math.hypot(next.vx, next.vy);

      const onFloor =
        next.y + BALL_RADIUS >=
        FLOOR_Y - 2;

      if (
        onFloor &&
        speed < 8
      ) {
        stillTime.current += frameDt;
      } else {
        stillTime.current = 0;
      }

      if (
        stillTime.current > 1.2
      ) {
        liveBall.current = next;
        drawBall(next);

        setRunning(false);
        setResult("stopped");
        return;
      }

      /*
       * Safety timeout.
       */
      if (
        time -
          runStarted.current >
        12000
      ) {
        liveBall.current = next;
        drawBall(next);

        setRunning(false);
        setResult("stopped");
        return;
      }

      liveBall.current = next;
      drawBall(next);

      animation.current =
        requestAnimationFrame(step);
    };

    animation.current =
      requestAnimationFrame(step);

    return () => {
      if (animation.current) {
        cancelAnimationFrame(
          animation.current,
        );
      }
    };
  }, [running, parts, challenge]);

  const runMachine = () => {
    if (animation.current) {
      cancelAnimationFrame(
        animation.current,
      );
    }

    liveBall.current = {
      ...challenge.start,
    };

    drawBall(challenge.start);

    collisionCooldown.current = {};
    stillTime.current = 0;
    lastTime.current = 0;
    runStarted.current = 0;

    setRemoveMode(false);
    setResult("running");
    setRunning(true);
  };

  return (
    <div className="machine-panel relative overflow-hidden p-4 sm:p-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="technical-label">
            Interactive mechanism lab
          </p>

          <h2 className="mt-2 text-2xl font-bold text-starlight sm:text-3xl">
            Chain Reaction Builder
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Place and rotate mechanical components to guide
            the ball from the launch point into the target
            bucket. Test, adjust and try again.
          </p>
        </div>

        <div className="border border-border bg-card px-4 py-3 text-center">
          <span className="technical-label block">
            Current challenge
          </span>

          <strong className="mt-1 block font-mono text-sm text-primary">
            {challengeIndex + 1}/
            {challenges.length} ·{" "}
            {challenge.name}
          </strong>
        </div>
      </div>

      {/* CHALLENGES */}
      <div
        className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap"
        aria-label="Game challenge selection"
      >
        {challenges.map(
          (item, index) => (
            <button
              key={item.name}
              type="button"
              disabled={running}
              onClick={() =>
                selectChallenge(index)
              }
              className={`min-h-11 shrink-0 border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                index ===
                challengeIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {String(
                index + 1,
              ).padStart(2, "0")}{" "}
              · {item.name}
            </button>
          ),
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {challenge.description}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[190px_1fr]">
        {/* COMPONENT TRAY */}
        <div>
          <p className="technical-label mb-3">
            Component tray
          </p>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {(
              Object.keys(
                partLabels,
              ) as PartType[]
            ).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelected(type);
                  setRemoveMode(false);
                }}
                disabled={running}
                className={`flex min-h-14 items-center gap-3 border p-3 text-left transition-colors ${
                  selected === type &&
                  !removeMode
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/60"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background font-mono text-lg text-primary">
                  {
                    partLabels[type]
                      .icon
                  }
                </span>

                <span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-starlight">
                    {
                      partLabels[type]
                        .name
                    }
                  </span>

                  <span className="mt-1 hidden text-[10px] text-muted-foreground sm:block">
                    {
                      partLabels[type]
                        .hint
                    }
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* MOBILE-FRIENDLY REMOVE MODE */}
          <button
            type="button"
            disabled={running}
            onClick={() =>
              setRemoveMode(
                (current) =>
                  !current,
              )
            }
            className={`mt-2 min-h-11 w-full border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
              removeMode
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {removeMode
              ? "Cancel remove"
              : "Remove part"}
          </button>

          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Tap an empty cell to place a component.
            Tap a placed component to rotate it.
            Use Remove Part to delete components.
          </p>
        </div>

        {/* GAME */}
        <div className="min-w-0">
          <div
            role="application"
            aria-label="Rube Goldberg machine building area"
            onPointerUp={
              placePart
            }
            className="blueprint-grid relative aspect-[2/1] w-full touch-manipulation cursor-crosshair overflow-hidden border border-border bg-background/70"
          >
            {/* START */}
            <div
              className="pointer-events-none absolute text-center"
              style={{
                left: `${Math.max(
                  1,
                  (challenge.start.x /
                    WIDTH) *
                    100 -
                    4,
                )}%`,
                top: `${Math.max(
                  1,
                  (challenge.start.y /
                    HEIGHT) *
                    100 -
                    8,
                )}%`,
              }}
            >
              <span className="technical-label">
                Start
              </span>

              <div className="mt-1 h-1 w-16 bg-primary/70" />
            </div>

            {/* TARGET */}
            <div
              className="pointer-events-none absolute border-x-4 border-b-4 border-primary/80 bg-primary/10"
              style={{
                left: `${
                  (challenge.bucket.x /
                    WIDTH) *
                  100
                }%`,
                top: `${
                  (challenge.bucket.y /
                    HEIGHT) *
                  100
                }%`,
                width: `${
                  (challenge.bucket
                    .width /
                    WIDTH) *
                  100
                }%`,
                height: `${
                  (challenge.bucket
                    .height /
                    HEIGHT) *
                  100
                }%`,
              }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase text-primary sm:-top-6 sm:text-[9px]">
                Target
              </span>
            </div>

            {/* FLOOR */}
            <div className="pointer-events-none absolute bottom-[7.3%] left-0 right-0 h-1 bg-border" />

            {/* COMPONENTS */}
            {parts.map((part) => {
              const { x, y } =
                partPosition(part);

              return (
                <button
                  key={part.id}
                  type="button"
                  aria-label={
                    part.locked
                      ? `Fixed ${partLabels[part.type].name}`
                      : `${partLabels[part.type].name}. Tap to ${
                          removeMode
                            ? "remove"
                            : "rotate"
                        }.`
                  }
                  onPointerUp={(
                    event,
                  ) =>
                    interactWithPart(
                      event,
                      part,
                    )
                  }
                  onDoubleClick={(
                    event,
                  ) => {
                    event.stopPropagation();

                    if (
                      !part.locked
                    ) {
                      removePart(
                        part.id,
                      );
                    }
                  }}
                  className={`absolute z-10 flex h-12 w-14 -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center sm:h-14 sm:w-16 ${
                    part.locked
                      ? "cursor-not-allowed opacity-75"
                      : removeMode
                        ? "cursor-pointer opacity-60"
                        : "cursor-pointer"
                  } ${
                    activePart ===
                    part.id
                      ? "scale-110"
                      : ""
                  } transition-transform duration-100`}
                  style={{
                    left: `${
                      (x / WIDTH) *
                      100
                    }%`,
                    top: `${
                      (y / HEIGHT) *
                      100
                    }%`,
                  }}
                >
                  {part.type ===
                  "bumper" ? (
                    <span
                      className={`h-9 w-9 rounded-full border-[3px] border-primary bg-primary/20 sm:h-12 sm:w-12 sm:border-4 ${
                        activePart ===
                        part.id
                          ? "shadow-[0_0_28px_rgba(80,170,255,0.9)]"
                          : "shadow-[0_0_18px_rgba(80,170,255,0.25)]"
                      }`}
                    />
                  ) : part.type ===
                    "conveyor" ? (
                    <span
                      className={`relative h-5 w-12 border-2 border-primary/80 bg-card sm:h-6 sm:w-16 ${
                        part.flipped
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      <span className="absolute inset-0 flex items-center justify-around font-mono text-[10px] text-primary sm:text-xs">
                        › › ›
                      </span>
                    </span>
                  ) : (
                    <span
                      className={`relative h-1.5 w-12 bg-primary shadow-[0_0_10px_rgba(80,170,255,0.35)] sm:w-16 ${
                        part.flipped
                          ? "-rotate-[28deg]"
                          : "rotate-[28deg]"
                      } ${
                        activePart ===
                        part.id
                          ? "shadow-[0_0_22px_rgba(80,170,255,0.9)]"
                          : ""
                      }`}
                    >
                      {part.type ===
                        "launcher" && (
                        <span className="absolute -right-1 -top-2 h-5 w-2 bg-starlight" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}

            {/* BALL */}
            <div
              ref={ballElement}
              className="pointer-events-none absolute z-20 h-[18px] w-[18px] rounded-full border-2 border-white bg-primary shadow-[0_0_16px_rgba(80,170,255,0.8)]"
              style={{
                left: 0,
                top: 0,
                transform: `translate3d(${
                  challenge.start.x -
                  BALL_RADIUS
                }px, ${
                  challenge.start.y -
                  BALL_RADIUS
                }px, 0)`,
                willChange:
                  "transform",
              }}
            />
          </div>

          {/* STATUS */}
          <div
            className={`mt-3 border-l-2 px-4 py-2 text-sm ${
              result ===
              "success"
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {statusText}
          </div>

          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-foreground/45">
            Fixed components are
            faded and cannot be moved
            · Your parts:{" "}
            {
              parts.filter(
                (part) =>
                  !part.locked,
              ).length
            }
            /{MAX_PARTS}
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Experiment with gravity, momentum and
          component placement. Rotate components to
          change the path of the ball.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={clearMachine}
            disabled={running}
            className="min-h-11 border border-border px-4 py-3 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={resetBall}
            className="min-h-11 border border-border px-4 py-3 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Reset ball
          </button>

          <button
            type="button"
            onClick={runMachine}
            disabled={running}
            className="col-span-2 min-h-12 border border-primary bg-primary px-5 py-3 font-mono text-xs font-bold uppercase text-primary-foreground transition-colors hover:bg-background hover:text-primary disabled:opacity-50 sm:col-auto"
          >
            {result ===
            "success"
              ? "Run again"
              : "Run machine"}
          </button>

          {result ===
            "success" &&
            challengeIndex <
              challenges.length -
                1 && (
              <button
                type="button"
                onClick={() =>
                  selectChallenge(
                    challengeIndex +
                      1,
                  )
                }
                className="col-span-2 min-h-11 border border-primary px-5 py-3 font-mono text-xs font-bold uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:col-auto"
              >
                Next challenge
              </button>
            )}
        </div>
      </div>
    </div>
  );
}