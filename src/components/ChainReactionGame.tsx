import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PartType =
  | "ramp"
  | "bumper"
  | "conveyor"
  | "launcher";

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

/* =========================================================
   GAME COORDINATE SYSTEM

   Everything inside the actual game uses these same
   coordinates. CSS then scales the entire 720 x 360 surface.
   ========================================================= */

const WIDTH = 720;
const HEIGHT = 360;

const COLS = 9;
const ROWS = 4;

const CELL_W = WIDTH / COLS;
const CELL_H = 70;
const GRID_TOP = 38;

const FLOOR_Y = 332;

const BALL_RADIUS = 8;

const GRAVITY = 210;
const MAX_PARTS = 10;

const partLabels: Record<
  PartType,
  {
    name: string;
    hint: string;
    icon: string;
  }
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

/* =========================================================
   CHALLENGES
   ========================================================= */

const challenges = [
  {
    name: "Workshop Warm-up",

    description:
      "Guide the ball across the shop floor into the bucket on the right.",

    start: {
      x: 45,
      y: 42,
      vx: 55,
      vy: 0,
    },

    bucket: {
      x: 643,
      y: 274,
      width: 57,
      height: 58,
    },

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

    start: {
      x: 48,
      y: 250,
      vx: 68,
      vy: 0,
    },

    bucket: {
      x: 635,
      y: 102,
      width: 60,
      height: 58,
    },

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

    start: {
      x: 674,
      y: 48,
      vx: -58,
      vy: 0,
    },

    bucket: {
      x: 20,
      y: 274,
      width: 58,
      height: 58,
    },

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

    start: {
      x: 54,
      y: 38,
      vx: 48,
      vy: 0,
    },

    bucket: {
      x: 332,
      y: 274,
      width: 58,
      height: 58,
    },

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

/* =========================================================
   HELPERS
   ========================================================= */

function partPosition(part: Part) {
  return {
    x: part.col * CELL_W + CELL_W / 2,

    y:
      GRID_TOP +
      part.row * CELL_H +
      CELL_H / 2,
  };
}

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.max(min, Math.min(max, value));
}

/* =========================================================
   GAME COMPONENT
   ========================================================= */

export function ChainReactionGame() {
  const [challengeIndex, setChallengeIndex] =
    useState(0);

  const challenge =
    challenges[challengeIndex] ??
    challenges[0];

  const [parts, setParts] = useState<Part[]>(
    challenge.fixedParts,
  );

  const [selected, setSelected] =
    useState<PartType>("ramp");

  const [running, setRunning] =
    useState(false);

  const [result, setResult] = useState<
    | "building"
    | "running"
    | "success"
    | "stopped"
  >("building");

  const [removeMode, setRemoveMode] =
    useState(false);

  const [activePart, setActivePart] =
    useState<number | null>(null);

  const nextId = useRef(1);

  const animation =
    useRef<number | null>(null);

  const ballElement =
    useRef<HTMLDivElement | null>(null);

  const liveBall = useRef<Ball>({
    ...challenge.start,
  });

  const lastTime = useRef(0);
  const runStarted = useRef(0);
  const stillTime = useRef(0);

  const collisionCooldown = useRef<
    Record<number, number>
  >({});

  /* =======================================================
     BALL DRAWING

     IMPORTANT:
     Physics coordinates are converted to percentages here.

     This means the visual ball stays aligned with the
     720 x 360 physics world at every screen size.
     ======================================================= */

  const drawBall = (ball: Ball) => {
    const element = ballElement.current;

    if (!element) return;

    element.style.left = `${
      (ball.x / WIDTH) * 100
    }%`;

    element.style.top = `${
      (ball.y / HEIGHT) * 100
    }%`;
  };

  /* =======================================================
     STATUS MESSAGE
     ======================================================= */

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

  /* =======================================================
     RESET BALL
     ======================================================= */

  const resetBall = () => {
    if (animation.current !== null) {
      cancelAnimationFrame(
        animation.current,
      );
    }

    animation.current = null;

    liveBall.current = {
      ...challenge.start,
    };

    collisionCooldown.current = {};

    stillTime.current = 0;
    lastTime.current = 0;
    runStarted.current = 0;

    setRunning(false);
    setResult("building");
    setActivePart(null);

    requestAnimationFrame(() => {
      drawBall(challenge.start);
    });
  };

  /* =======================================================
     CLEAR MACHINE
     ======================================================= */

  const clearMachine = () => {
    resetBall();

    setParts([
      ...challenge.fixedParts,
    ]);

    setRemoveMode(false);
  };

  /* =======================================================
     CHANGE CHALLENGE
     ======================================================= */

  const selectChallenge = (
    index: number,
  ) => {
    if (animation.current !== null) {
      cancelAnimationFrame(
        animation.current,
      );
    }

    animation.current = null;

    const nextChallenge =
      challenges[index] ??
      challenges[0];

    setChallengeIndex(index);

    setParts([
      ...nextChallenge.fixedParts,
    ]);

    liveBall.current = {
      ...nextChallenge.start,
    };

    collisionCooldown.current = {};

    stillTime.current = 0;
    lastTime.current = 0;
    runStarted.current = 0;

    setRunning(false);
    setResult("building");
    setRemoveMode(false);
    setActivePart(null);

    requestAnimationFrame(() => {
      drawBall(nextChallenge.start);
    });
  };

  /* =======================================================
     PLACE COMPONENT

     Pointer events work with:
     - mouse
     - touchscreen
     - stylus
     ======================================================= */

  const placePart = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (running || removeMode) {
      return;
    }

    const bounds =
      event.currentTarget.getBoundingClientRect();

    /*
     Convert the click/tap from the responsive CSS size
     back into the 720 x 360 physics coordinate system.
    */

    const x =
      ((event.clientX - bounds.left) /
        bounds.width) *
      WIDTH;

    const y =
      ((event.clientY - bounds.top) /
        bounds.height) *
      HEIGHT;

    if (
      y < GRID_TOP ||
      y >
        GRID_TOP +
          ROWS * CELL_H
    ) {
      return;
    }

    const col = clamp(
      Math.floor(x / CELL_W),
      0,
      COLS - 1,
    );

    const row = clamp(
      Math.floor(
        (y - GRID_TOP) /
          CELL_H,
      ),
      0,
      ROWS - 1,
    );

    setParts((current) => {
      const occupied = current.some(
        (part) =>
          part.col === col &&
          part.row === row,
      );

      if (occupied) {
        return current;
      }

      const userParts =
        current.filter(
          (part) => !part.locked,
        );

      if (
        userParts.length >=
        MAX_PARTS
      ) {
        return current;
      }

      const newPart: Part = {
        id: nextId.current++,
        type: selected,
        col,
        row,
        flipped: false,
      };

      return [
        ...current,
        newPart,
      ];
    });
  };

  /* =======================================================
     ROTATE / REMOVE
     ======================================================= */

  const rotatePart = (id: number) => {
    if (running) return;

    setParts((current) =>
      current.map((part) => {
        if (
          part.id !== id ||
          part.locked
        ) {
          return part;
        }

        return {
          ...part,
          flipped: !part.flipped,
        };
      }),
    );
  };

  const removePart = (id: number) => {
    if (running) return;

    setParts((current) =>
      current.filter(
        (part) =>
          part.id !== id ||
          part.locked,
      ),
    );
  };

  const interactWithPart = (
    event: React.PointerEvent<HTMLButtonElement>,
    part: Part,
  ) => {
    event.stopPropagation();

    if (
      running ||
      part.locked
    ) {
      return;
    }

    if (removeMode) {
      removePart(part.id);
      return;
    }

    rotatePart(part.id);
  };

  /* =======================================================
     PHYSICS
     ======================================================= */

  useEffect(() => {
    if (!running) return;

    const step = (time: number) => {
      if (!runStarted.current) {
        runStarted.current = time;
      }

      const previousTime =
        lastTime.current || time;

      const rawDt =
        (time - previousTime) /
        1000;

      /*
       Cap large frame gaps.

       This stops physics from exploding when:
       - browser stutters
       - mobile frame rate drops
       - tab temporarily loses focus
      */

      const frameDt = Math.min(
        rawDt,
        0.032,
      );

      lastTime.current = time;

      /*
       Multiple smaller physics steps produce much more
       reliable collision detection.
      */

      const SUBSTEPS = 5;

      const dt =
        frameDt / SUBSTEPS;

      let next = {
        ...liveBall.current,
      };

      for (
        let substep = 0;
        substep < SUBSTEPS;
        substep++
      ) {
        /* -----------------------
           GRAVITY
           ----------------------- */

        next.vy += GRAVITY * dt;

        next.x += next.vx * dt;
        next.y += next.vy * dt;

        /* -----------------------
           COMPONENT COLLISIONS
           ----------------------- */

        for (const part of parts) {
          const centre =
            partPosition(part);

          const cooldownUntil =
            collisionCooldown.current[
              part.id
            ] ?? 0;

          /* =====================
             BUMPER
             ===================== */

          if (
            part.type ===
            "bumper"
          ) {
            const dx =
              next.x - centre.x;

            const dy =
              next.y - centre.y;

            const distance =
              Math.hypot(dx, dy);

            const bumperRadius = 18;

            const collisionDistance =
              bumperRadius +
              BALL_RADIUS;

            if (
              distance <
                collisionDistance &&
              distance > 0
            ) {
              const nx =
                dx / distance;

              const ny =
                dy / distance;

              /*
               Push ball outside the bumper first.
               Prevents vibration/sticking.
              */

              next.x =
                centre.x +
                nx *
                  collisionDistance;

              next.y =
                centre.y +
                ny *
                  collisionDistance;

              const approach =
                next.vx * nx +
                next.vy * ny;

              if (
                approach < 0 &&
                time >=
                  cooldownUntil
              ) {
                const restitution =
                  1.55;

                next.vx -=
                  restitution *
                  approach *
                  nx;

                next.vy -=
                  restitution *
                  approach *
                  ny;

                next.vx +=
                  nx * 15;

                next.vy +=
                  ny * 15;

                collisionCooldown.current[
                  part.id
                ] =
                  time + 100;

                setActivePart(
                  part.id,
                );

                window.setTimeout(
                  () => {
                    setActivePart(
                      (current) =>
                        current ===
                        part.id
                          ? null
                          : current,
                    );
                  },
                  120,
                );
              }
            }

            continue;
          }

          /* =====================
             CONVEYOR
             ===================== */

          if (
            part.type ===
            "conveyor"
          ) {
            const halfWidth = 28;

            const surfaceY =
              centre.y - 8;

            const horizontal =
              Math.abs(
                next.x -
                  centre.x,
              ) <= halfWidth;

            const touching =
              next.y +
                BALL_RADIUS >=
                surfaceY - 3 &&
              next.y +
                BALL_RADIUS <=
                surfaceY + 8;

            if (
              horizontal &&
              touching &&
              next.vy >= -15
            ) {
              next.y =
                surfaceY -
                BALL_RADIUS;

              if (next.vy > 0) {
                next.vy = 0;
              }

              const direction =
                part.flipped
                  ? -1
                  : 1;

              const targetVelocity =
                115 *
                direction;

              /*
               Smooth acceleration rather than
               instantly changing velocity.
              */

              const response =
                Math.min(
                  1,
                  5 * dt,
                );

              next.vx +=
                (targetVelocity -
                  next.vx) *
                response;
            }

            continue;
          }

          /* =====================
             RAMP / LAUNCHER
             ===================== */

          const direction =
            part.flipped
              ? -1
              : 1;

          const halfWidth = 30;

          const localX =
            next.x -
            centre.x;

          if (
            Math.abs(localX) >
            halfWidth
          ) {
            continue;
          }

          const slope =
            part.type ===
            "launcher"
              ? -0.55 *
                direction
              : 0.5 *
                direction;

          const surfaceY =
            centre.y +
            localX * slope;

          const ballBottom =
            next.y +
            BALL_RADIUS;

          const touchingSurface =
            ballBottom >=
              surfaceY - 3 &&
            ballBottom <=
              surfaceY + 9;

          if (!touchingSurface) {
            continue;
          }

          /*
           Put ball directly on the ramp.
           This prevents repeated penetration.
          */

          next.y =
            surfaceY -
            BALL_RADIUS;

          /* =====================
             LAUNCHER
             ===================== */

          if (
            part.type ===
            "launcher"
          ) {
            if (
              time >=
              cooldownUntil
            ) {
              next.vy = -175;

              next.vx +=
                75 *
                direction;

              collisionCooldown.current[
                part.id
              ] =
                time + 280;

              setActivePart(
                part.id,
              );

              window.setTimeout(
                () => {
                  setActivePart(
                    (current) =>
                      current ===
                      part.id
                        ? null
                        : current,
                  );
                },
                140,
              );
            }

            continue;
          }

          /* =====================
             RAMP
             ===================== */

          /*
           Tangent vector for the ramp.
          */

          const tangentX =
            direction;

          const tangentY = 0.5;

          const tangentLength =
            Math.hypot(
              tangentX,
              tangentY,
            );

          const tx =
            tangentX /
            tangentLength;

          const ty =
            tangentY /
            tangentLength;

          const projectedSpeed =
            next.vx * tx +
            next.vy * ty;

          /*
           Keep enough velocity to avoid the
           ball sticking to the ramp.
          */

          const minimumSpeed = 40;

          const rampSpeed =
            Math.max(
              minimumSpeed,
              Math.abs(
                projectedSpeed,
              ),
            );

          const travelDirection =
            Math.sign(
              projectedSpeed ||
                direction,
            );

          next.vx =
            tx *
            rampSpeed *
            travelDirection;

          next.vy =
            ty *
            rampSpeed *
            travelDirection;
        }

        /* =====================
           FLOOR
           ===================== */

        if (
          next.y +
            BALL_RADIUS >=
          FLOOR_Y
        ) {
          next.y =
            FLOOR_Y -
            BALL_RADIUS;

          if (
            Math.abs(next.vy) >
            30
          ) {
            next.vy =
              -Math.abs(
                next.vy,
              ) * 0.18;
          } else {
            next.vy = 0;
          }

          /*
           Floor friction.
          */

          next.vx *=
            Math.pow(
              0.985,
              dt * 60,
            );

          if (
            Math.abs(next.vx) <
            1
          ) {
            next.vx = 0;
          }
        }

        /* =====================
           LEFT WALL
           ===================== */

        if (
          next.x -
            BALL_RADIUS <
          0
        ) {
          next.x =
            BALL_RADIUS;

          next.vx =
            Math.abs(
              next.vx,
            ) * 0.45;
        }

        /* =====================
           RIGHT WALL
           ===================== */

        if (
          next.x +
            BALL_RADIUS >
          WIDTH
        ) {
          next.x =
            WIDTH -
            BALL_RADIUS;

          next.vx =
            -Math.abs(
              next.vx,
            ) * 0.45;
        }

        /* =====================
           CEILING
           ===================== */

        if (
          next.y -
            BALL_RADIUS <
          0
        ) {
          next.y =
            BALL_RADIUS;

          next.vy =
            Math.abs(
              next.vy,
            ) * 0.35;
        }
      }

      /* ===================================================
         TARGET DETECTION
         =================================================== */

      const bucketLeft =
        challenge.bucket.x;

      const bucketRight =
        challenge.bucket.x +
        challenge.bucket.width;

      const bucketTop =
        challenge.bucket.y;

      const bucketBottom =
        challenge.bucket.y +
        challenge.bucket.height;

      const ballInsideBucket =
        next.x >
          bucketLeft +
            BALL_RADIUS &&
        next.x <
          bucketRight -
            BALL_RADIUS &&
        next.y >
          bucketTop &&
        next.y <
          bucketBottom;

      if (ballInsideBucket) {
        liveBall.current =
          next;

        drawBall(next);

        setRunning(false);
        setResult("success");

        animation.current =
          null;

        return;
      }

      /* ===================================================
         STOP DETECTION
         =================================================== */

      const speed =
        Math.hypot(
          next.vx,
          next.vy,
        );

      const touchingFloor =
        next.y +
          BALL_RADIUS >=
        FLOOR_Y - 1;

      if (
        touchingFloor &&
        speed < 7
      ) {
        stillTime.current +=
          frameDt;
      } else {
        stillTime.current = 0;
      }

      /*
       If the ball has barely moved for 1.25 seconds,
       stop the attempt.
      */

      if (
        stillTime.current >
        1.25
      ) {
        liveBall.current =
          next;

        drawBall(next);

        setRunning(false);
        setResult("stopped");

        animation.current =
          null;

        return;
      }

      /*
       Absolute safety timeout.
      */

      if (
        time -
          runStarted.current >
        12000
      ) {
        liveBall.current =
          next;

        drawBall(next);

        setRunning(false);
        setResult("stopped");

        animation.current =
          null;

        return;
      }

      liveBall.current = next;

      drawBall(next);

      animation.current =
        requestAnimationFrame(
          step,
        );
    };

    animation.current =
      requestAnimationFrame(
        step,
      );

    return () => {
      if (
        animation.current !==
        null
      ) {
        cancelAnimationFrame(
          animation.current,
        );
      }
    };
  }, [
    running,
    parts,
    challenge,
  ]);

  /* =======================================================
     RUN MACHINE
     ======================================================= */

  const runMachine = () => {
    if (
      animation.current !==
      null
    ) {
      cancelAnimationFrame(
        animation.current,
      );
    }

    animation.current = null;

    liveBall.current = {
      ...challenge.start,
    };

    collisionCooldown.current = {};

    stillTime.current = 0;
    lastTime.current = 0;
    runStarted.current = 0;

    drawBall(
      challenge.start,
    );

    setRemoveMode(false);
    setResult("running");
    setRunning(true);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="machine-panel relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="technical-label">
            Interactive mechanism lab
          </p>

          <h2 className="mt-2 text-2xl font-bold text-starlight sm:text-3xl">
            Chain Reaction Builder
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Place and rotate
            mechanical components to
            guide the ball from the
            launch point into the
            target bucket. Test,
            adjust and try again.
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

      {/* ===================================================
          CHALLENGE SELECTOR
          =================================================== */}

      <div
        className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap"
        aria-label="Game challenge selection"
      >
        {challenges.map(
          (
            item,
            index,
          ) => (
            <button
              key={item.name}
              type="button"
              disabled={running}
              onClick={() =>
                selectChallenge(
                  index,
                )
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
              ).padStart(
                2,
                "0",
              )}{" "}
              · {item.name}
            </button>
          ),
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {challenge.description}
      </p>

      {/* ===================================================
          MAIN GAME LAYOUT
          =================================================== */}

      <div className="mt-6 grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
        {/* ===============================================
            COMPONENT TRAY
            =============================================== */}

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
                disabled={running}
                onClick={() => {
                  setSelected(type);
                  setRemoveMode(
                    false,
                  );
                }}
                className={`flex min-h-14 items-center gap-3 border p-3 text-left transition-colors ${
                  selected ===
                    type &&
                  !removeMode
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/60"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background font-mono text-lg text-primary">
                  {
                    partLabels[
                      type
                    ].icon
                  }
                </span>

                <span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-starlight">
                    {
                      partLabels[
                        type
                      ].name
                    }
                  </span>

                  <span className="mt-1 hidden text-[10px] text-muted-foreground sm:block">
                    {
                      partLabels[
                        type
                      ].hint
                    }
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* REMOVE MODE */}

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
            Tap an empty cell to
            place a component. Tap a
            placed component to
            rotate it. Use Remove Part
            to delete components.
          </p>
        </div>

        {/* ===============================================
            GAME COLUMN
            =============================================== */}

        <div className="min-w-0">
          {/*
            RESPONSIVE GAME BOARD

            The board always maintains a 2:1 ratio.

            Every visual coordinate is expressed as a
            percentage of WIDTH / HEIGHT so the visual
            world and physics world remain aligned.
          */}

          <div
            role="application"
            aria-label="Chain reaction machine building area"
            onPointerUp={
              placePart
            }
            className="blueprint-grid relative aspect-[2/1] w-full touch-manipulation cursor-crosshair select-none overflow-hidden border border-border bg-background/70"
          >
            {/* ===========================================
                START MARKER

                Uses EXACT same start coordinates as ball.
                =========================================== */}

            <div
              className="pointer-events-none absolute z-[5] -translate-x-1/2"
              style={{
                left: `${
                  (challenge
                    .start.x /
                    WIDTH) *
                  100
                }%`,

                top: `${
                  (challenge
                    .start.y /
                    HEIGHT) *
                  100
                }%`,
              }}
            >
              <div className="-translate-y-9 text-center">
                <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-primary sm:text-[9px]">
                  Start
                </span>

                <div className="mx-auto mt-1 h-[2px] w-10 bg-primary/70 sm:w-14" />
              </div>
            </div>

            {/* ===========================================
                TARGET BUCKET
                =========================================== */}

            <div
              className="pointer-events-none absolute z-[4] border-x-[3px] border-b-[3px] border-primary/80 bg-primary/10"
              style={{
                left: `${
                  (challenge
                    .bucket.x /
                    WIDTH) *
                  100
                }%`,

                top: `${
                  (challenge
                    .bucket.y /
                    HEIGHT) *
                  100
                }%`,

                width: `${
                  (challenge
                    .bucket
                    .width /
                    WIDTH) *
                  100
                }%`,

                height: `${
                  (challenge
                    .bucket
                    .height /
                    HEIGHT) *
                  100
                }%`,
              }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] font-bold uppercase text-primary sm:-top-6 sm:text-[9px]">
                Target
              </span>
            </div>

            {/* ===========================================
                PHYSICS FLOOR

                This uses FLOOR_Y directly.

                Visual floor and physics floor therefore
                cannot drift apart.
                =========================================== */}

            <div
              className="pointer-events-none absolute left-0 right-0 z-[3] h-[2px] bg-border sm:h-[3px]"
              style={{
                top: `${
                  (FLOOR_Y /
                    HEIGHT) *
                  100
                }%`,
              }}
            />

            {/* ===========================================
                COMPONENTS
                =========================================== */}

            {parts.map(
              (part) => {
                const {
                  x,
                  y,
                } =
                  partPosition(
                    part,
                  );

                const left =
                  (x / WIDTH) *
                  100;

                const top =
                  (y / HEIGHT) *
                  100;

                return (
                  <button
                    key={part.id}
                    type="button"
                    aria-label={
                      part.locked
                        ? `Fixed ${
                            partLabels[
                              part
                                .type
                            ]
                              .name
                          }`
                        : `${
                            partLabels[
                              part
                                .type
                            ]
                              .name
                          }. Tap to ${
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
                    className={`absolute z-10 flex h-[44px] w-[58px] -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center ${
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
                      left: `${left}%`,
                      top: `${top}%`,
                    }}
                  >
                    {/* BUMPER */}

                    {part.type ===
                    "bumper" ? (
                      <span
                        className={`h-8 w-8 rounded-full border-[3px] border-primary bg-primary/20 ${
                          activePart ===
                          part.id
                            ? "shadow-[0_0_25px_rgba(229,169,61,0.85)]"
                            : "shadow-[0_0_12px_rgba(229,169,61,0.25)]"
                        }`}
                      />
                    ) : part.type ===
                      "conveyor" ? (
                      /* CONVEYOR */

                      <span
                        className={`relative h-5 w-12 border-2 border-primary/80 bg-card ${
                          part.flipped
                            ? "rotate-180"
                            : ""
                        }`}
                      >
                        <span className="absolute inset-0 flex items-center justify-around font-mono text-[9px] text-primary">
                          › › ›
                        </span>
                      </span>
                    ) : (
                      /* RAMP / LAUNCHER */

                      <span
                        className={`relative h-[3px] w-12 bg-primary ${
                          part.flipped
                            ? "-rotate-[28deg]"
                            : "rotate-[28deg]"
                        } ${
                          activePart ===
                          part.id
                            ? "shadow-[0_0_20px_rgba(229,169,61,0.9)]"
                            : "shadow-[0_0_8px_rgba(229,169,61,0.3)]"
                        }`}
                      >
                        {part.type ===
                          "launcher" && (
                          <span className="absolute -right-1 -top-[7px] h-4 w-[6px] bg-starlight" />
                        )}
                      </span>
                    )}
                  </button>
                );
              },
            )}

            {/* ===========================================
                BALL

                Position is always a percentage of the
                same 720 x 360 physics world.
                =========================================== */}

            <div
              ref={
                ballElement
              }
              className="pointer-events-none absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-[0_0_14px_rgba(229,169,61,0.8)]"
              style={{
                left: `${
                  (challenge
                    .start.x /
                    WIDTH) *
                  100
                }%`,

                top: `${
                  (challenge
                    .start.y /
                    HEIGHT) *
                  100
                }%`,

                willChange:
                  "left, top",
              }}
            />
          </div>

          {/* ===============================================
              STATUS
              =============================================== */}

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

          <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-foreground/45 sm:text-[10px]">
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

      {/* ===================================================
          BOTTOM CONTROLS
          =================================================== */}

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Experiment with gravity,
          momentum and component
          placement. Rotate components
          to change the path of the
          ball.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {/* CLEAR */}

          <button
            type="button"
            onClick={
              clearMachine
            }
            disabled={running}
            className="min-h-11 border border-border px-4 py-3 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
          >
            Clear
          </button>

          {/* RESET */}

          <button
            type="button"
            onClick={
              resetBall
            }
            className="min-h-11 border border-border px-4 py-3 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Reset ball
          </button>

          {/* RUN */}

          <button
            type="button"
            onClick={
              runMachine
            }
            disabled={running}
            className="col-span-2 min-h-12 border border-primary bg-primary px-5 py-3 font-mono text-xs font-bold uppercase text-primary-foreground transition-colors hover:bg-background hover:text-primary disabled:opacity-50 sm:col-auto"
          >
            {result ===
            "success"
              ? "Run again"
              : "Run machine"}
          </button>

          {/* NEXT CHALLENGE */}

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