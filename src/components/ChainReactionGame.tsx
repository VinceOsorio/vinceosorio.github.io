import { useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   TYPES
   ========================================================= */

type PartType = "ramp" | "bumper" | "conveyor" | "launcher";

type Part = {
  id: number;
  type: PartType;
  x: number;
  y: number;
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
   GAME WORLD
   ========================================================= */

const WIDTH = 720;
const HEIGHT = 360;

const FLOOR_Y = 332;
const BALL_RADIUS = 8;

const GRAVITY = 210;

/*
  Increased from 10.

  This gives you enough components to actually build longer
  machines across the board.
*/
const MAX_PARTS = 20;

/*
  Fine placement snapping.

  These ONLY affect parts placed by the user.

  Fixed challenge components use exact X/Y coordinates and
  will not move if these values are changed.
*/
const SNAP_X = 5;
const SNAP_Y = 5;

/*
  Prevent components from being placed too close to the
  extreme left/right edges.
*/
const PART_HALF_WIDTH = 30;

/*
  Minimum centre-to-centre spacing between components.

  Because this is only 8 units, components can now be placed
  much closer together.
*/
const MIN_PART_DISTANCE = 8;

/* =========================================================
   COMPONENT INFORMATION
   ========================================================= */

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

   IMPORTANT:

   Fixed components use actual X/Y game coordinates.

   They DO NOT use the snapping grid.

   That means you can make SNAP_X and SNAP_Y smaller later
   without destroying the challenge layouts.
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
        x: 135,
        y: 140,
        flipped: false,
        locked: true,
      },

      {
        id: -2,
        type: "bumper",
        x: 285,
        y: 252,
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
        x: 225,
        y: 280,
        flipped: false,
        locked: true,
      },

      {
        id: -4,
        type: "launcher",
        x: 435,
        y: 280,
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
        x: 585,
        y: 140,
        flipped: true,
        locked: true,
      },

      {
        id: -6,
        type: "bumper",
        x: 435,
        y: 224,
        flipped: false,
        locked: true,
      },

      {
        id: -7,
        type: "conveyor",
        x: 285,
        y: 280,
        flipped: true,
        locked: true,
      },
    ],
  },

  {
    name: "Zigzag Drop",

    description:
      "Navigate alternating fixed ramps to reach the centre bucket.",

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
        x: 135,
        y: 98,
        flipped: false,
        locked: true,
      },

      {
        id: -9,
        type: "ramp",
        x: 285,
        y: 182,
        flipped: true,
        locked: true,
      },

      {
        id: -10,
        type: "ramp",
        x: 435,
        y: 266,
        flipped: false,
        locked: true,
      },
    ],
  },
] satisfies [Challenge, ...Challenge[]];

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function snap(value: number, spacing: number) {
  return Math.round(value / spacing) * spacing;
}

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/* =========================================================
   MAIN GAME COMPONENT
   ========================================================= */

export function ChainReactionGame() {
  const [challengeIndex, setChallengeIndex] = useState(0);

  const challenge =
    challenges[challengeIndex] ?? challenges[0];

  const [parts, setParts] = useState<Part[]>([
    ...challenge.fixedParts,
  ]);

  const [selected, setSelected] =
    useState<PartType>("ramp");

  const [running, setRunning] = useState(false);

  const [result, setResult] = useState<
    "building" | "running" | "success" | "stopped"
  >("building");

  const [removeMode, setRemoveMode] = useState(false);

  const [activePart, setActivePart] = useState<
    number | null
  >(null);

  const [preview, setPreview] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const nextId = useRef(1);

  const animation = useRef<number | null>(null);

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
     DRAW BALL
     ======================================================= */

  const drawBall = (ball: Ball) => {
    const element = ballElement.current;

    if (!element) return;

    element.style.left = `${(ball.x / WIDTH) * 100}%`;
    element.style.top = `${(ball.y / HEIGHT) * 100}%`;
  };

  /* =======================================================
     STATUS TEXT
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

    return "Select a component, then place it anywhere above the floor.";
  }, [result, removeMode]);

  /* =======================================================
     RESET BALL
     ======================================================= */

  const resetBall = () => {
    if (animation.current !== null) {
      cancelAnimationFrame(animation.current);
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
    setPreview(null);

    requestAnimationFrame(() => {
      drawBall(challenge.start);
    });
  };

  /* =======================================================
     CLEAR MACHINE
     ======================================================= */

  const clearMachine = () => {
    resetBall();

    setParts([...challenge.fixedParts]);

    setRemoveMode(false);
  };

  /* =======================================================
     CHANGE CHALLENGE
     ======================================================= */

  const selectChallenge = (index: number) => {
    if (animation.current !== null) {
      cancelAnimationFrame(animation.current);
    }

    animation.current = null;

    const nextChallenge =
      challenges[index] ?? challenges[0];

    setChallengeIndex(index);

    setParts([...nextChallenge.fixedParts]);

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
    setPreview(null);

    requestAnimationFrame(() => {
      drawBall(nextChallenge.start);
    });
  };

  /* =======================================================
     POINTER -> GAME COORDINATES
     ======================================================= */

  const getPointerPosition = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const bounds =
      event.currentTarget.getBoundingClientRect();

    const rawX =
      ((event.clientX - bounds.left) / bounds.width) *
      WIDTH;

    const rawY =
      ((event.clientY - bounds.top) / bounds.height) *
      HEIGHT;

    /*
      Very fine 5 x 5 snapping.
    */

    const x = clamp(
      snap(rawX, SNAP_X),
      PART_HALF_WIDTH,
      WIDTH - PART_HALF_WIDTH,
    );

    const y = clamp(
      snap(rawY, SNAP_Y),
      18,
      FLOOR_Y - 18,
    );

    return {
      x,
      y,
    };
  };

  /* =======================================================
     PLACEMENT PREVIEW
     ======================================================= */

  const updatePreview = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (running || removeMode) {
      setPreview(null);
      return;
    }

    /*
      No hover preview on touch devices.
    */

    if (event.pointerType === "touch") {
      return;
    }

    const position = getPointerPosition(event);

    if (position.y >= FLOOR_Y - 12) {
      setPreview(null);
      return;
    }

    setPreview(position);
  };

  /* =======================================================
     PLACE COMPONENT
     ======================================================= */

  const placePart = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (running || removeMode) {
      return;
    }

    const position = getPointerPosition(event);

    if (position.y >= FLOOR_Y - 12) {
      return;
    }

    setParts((current) => {
      const userParts = current.filter(
        (part) => !part.locked,
      );

      if (userParts.length >= MAX_PARTS) {
        return current;
      }

      /*
        Only prevent nearly direct overlap.

        Components can otherwise be positioned extremely
        close together.
      */

      const tooClose = current.some((part) => {
        return (
          distance(
            position.x,
            position.y,
            part.x,
            part.y,
          ) < MIN_PART_DISTANCE
        );
      });

      if (tooClose) {
        return current;
      }

      const newPart: Part = {
        id: nextId.current++,
        type: selected,
        x: position.x,
        y: position.y,
        flipped: false,
      };

      return [...current, newPart];
    });
  };

  /* =======================================================
     ROTATE COMPONENT
     ======================================================= */

  const rotatePart = (id: number) => {
    if (running) return;

    setParts((current) =>
      current.map((part) => {
        if (part.id !== id || part.locked) {
          return part;
        }

        return {
          ...part,
          flipped: !part.flipped,
        };
      }),
    );
  };

  /* =======================================================
     REMOVE COMPONENT
     ======================================================= */

  const removePart = (id: number) => {
    if (running) return;

    setParts((current) =>
      current.filter(
        (part) =>
          part.id !== id || part.locked,
      ),
    );
  };

  /* =======================================================
     INTERACT WITH COMPONENT
     ======================================================= */

  const interactWithPart = (
    event: React.PointerEvent<HTMLButtonElement>,
    part: Part,
  ) => {
    event.stopPropagation();

    if (running || part.locked) {
      return;
    }

    if (removeMode) {
      removePart(part.id);
      return;
    }

    rotatePart(part.id);
  };

  /* =======================================================
     PHYSICS ENGINE
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
        (time - previousTime) / 1000;

      /*
        Prevent a slow frame from causing the ball to jump
        through components.
      */

      const frameDt = Math.min(rawDt, 0.032);

      lastTime.current = time;

      /*
        Physics substeps.

        Instead of one large physics calculation per frame,
        we calculate six smaller movements.

        This makes collisions significantly smoother.
      */

      const SUBSTEPS = 6;

      const dt = frameDt / SUBSTEPS;

      let next = {
        ...liveBall.current,
      };

      for (
        let substep = 0;
        substep < SUBSTEPS;
        substep++
      ) {
        /* ===============================================
           GRAVITY
           =============================================== */

        next.vy += GRAVITY * dt;

        next.x += next.vx * dt;
        next.y += next.vy * dt;

        /* ===============================================
           COMPONENT COLLISIONS
           =============================================== */

        for (const part of parts) {
          const centreX = part.x;
          const centreY = part.y;

          const cooldownUntil =
            collisionCooldown.current[part.id] ?? 0;

          /* =============================================
             BUMPER
             ============================================= */

          if (part.type === "bumper") {
            const dx =
              next.x - centreX;

            const dy =
              next.y - centreY;

            const ballDistance =
              Math.hypot(dx, dy);

            const bumperRadius = 15;

            const collisionDistance =
              bumperRadius + BALL_RADIUS;

            if (
              ballDistance < collisionDistance &&
              ballDistance > 0
            ) {
              const nx =
                dx / ballDistance;

              const ny =
                dy / ballDistance;

              next.x =
                centreX +
                nx * collisionDistance;

              next.y =
                centreY +
                ny * collisionDistance;

              const approach =
                next.vx * nx +
                next.vy * ny;

              if (
                approach < 0 &&
                time >= cooldownUntil
              ) {
                const restitution = 1.5;

                next.vx -=
                  restitution *
                  approach *
                  nx;

                next.vy -=
                  restitution *
                  approach *
                  ny;

                next.vx += nx * 14;
                next.vy += ny * 14;

                collisionCooldown.current[
                  part.id
                ] = time + 100;

                setActivePart(part.id);

                window.setTimeout(() => {
                  setActivePart((current) =>
                    current === part.id
                      ? null
                      : current,
                  );
                }, 120);
              }
            }

            continue;
          }

          /* =============================================
             CONVEYOR
             ============================================= */

          if (part.type === "conveyor") {
            const halfWidth = 22;

            const surfaceY =
              centreY - 7;

            const horizontal =
              Math.abs(
                next.x - centreX,
              ) <= halfWidth;

            const touching =
              next.y + BALL_RADIUS >=
                surfaceY - 4 &&
              next.y + BALL_RADIUS <=
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
                part.flipped ? -1 : 1;

              const targetVelocity =
                115 * direction;

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

          /* =============================================
             RAMP / LAUNCHER
             ============================================= */

          const direction =
            part.flipped ? -1 : 1;

          /*
            Physics length is kept in game coordinates.

            Visual component sizes are responsive, but
            physics remain consistent on every device.
          */

          const halfWidth = 22;

          const localX =
            next.x - centreX;

          if (
            Math.abs(localX) >
            halfWidth
          ) {
            continue;
          }

          const slope =
            part.type === "launcher"
              ? -0.55 * direction
              : 0.5 * direction;

          const surfaceY =
            centreY +
            localX * slope;

          const ballBottom =
            next.y + BALL_RADIUS;

          const touchingSurface =
            ballBottom >=
              surfaceY - 4 &&
            ballBottom <=
              surfaceY + 9;

          if (!touchingSurface) {
            continue;
          }

          next.y =
            surfaceY -
            BALL_RADIUS;

          /* =============================================
             LAUNCHER
             ============================================= */

          if (
            part.type === "launcher"
          ) {
            if (
              time >= cooldownUntil
            ) {
              next.vy = -175;

              next.vx +=
                75 * direction;

              collisionCooldown.current[
                part.id
              ] = time + 280;

              setActivePart(part.id);

              window.setTimeout(() => {
                setActivePart((current) =>
                  current === part.id
                    ? null
                    : current,
                );
              }, 140);
            }

            continue;
          }

          /* =============================================
             RAMP
             ============================================= */

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

        /* ===============================================
           SOLID TARGET BUCKET

               OPEN TOP
                  ↓

              █       █
              █       █
              █       █
              █████████

           The sides and bottom are physical surfaces.
           =============================================== */

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

        const WALL = 5;

        /* -----------------------------------------------
           LEFT BUCKET WALL
           ----------------------------------------------- */

        const touchingLeftWall =
          next.x + BALL_RADIUS >=
            bucketLeft &&
          next.x - BALL_RADIUS <=
            bucketLeft + WALL &&
          next.y + BALL_RADIUS >
            bucketTop &&
          next.y - BALL_RADIUS <
            bucketBottom;

        if (
          touchingLeftWall &&
          next.vx > 0
        ) {
          next.x =
            bucketLeft -
            BALL_RADIUS;

          next.vx =
            -Math.abs(
              next.vx,
            ) * 0.35;
        }

        /* -----------------------------------------------
           RIGHT BUCKET WALL
           ----------------------------------------------- */

        const touchingRightWall =
          next.x - BALL_RADIUS <=
            bucketRight &&
          next.x + BALL_RADIUS >=
            bucketRight - WALL &&
          next.y + BALL_RADIUS >
            bucketTop &&
          next.y - BALL_RADIUS <
            bucketBottom;

        if (
          touchingRightWall &&
          next.vx < 0
        ) {
          next.x =
            bucketRight +
            BALL_RADIUS;

          next.vx =
            Math.abs(
              next.vx,
            ) * 0.35;
        }

        /* -----------------------------------------------
           BUCKET FLOOR
           ----------------------------------------------- */

        const insideBucketWidth =
          next.x >
            bucketLeft +
              WALL +
              BALL_RADIUS &&
          next.x <
            bucketRight -
              WALL -
              BALL_RADIUS;

        const touchingBucketFloor =
          insideBucketWidth &&
          next.y + BALL_RADIUS >=
            bucketBottom &&
          next.y <
            bucketBottom &&
          next.vy > 0;

        if (
          touchingBucketFloor
        ) {
          next.y =
            bucketBottom -
            BALL_RADIUS;

          next.vy = 0;

          next.vx *= 0.65;
        }

        /* ===============================================
           MAIN FLOOR
           =============================================== */

        if (
          next.y + BALL_RADIUS >=
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
            Gentle floor friction.
          */

          next.vx *=
            Math.pow(
              0.985,
              dt * 60,
            );

          if (
            Math.abs(next.vx) < 1
          ) {
            next.vx = 0;
          }
        }

        /* ===============================================
           LEFT WALL
           =============================================== */

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

        /* ===============================================
           RIGHT WALL
           =============================================== */

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

        /* ===============================================
           CEILING
           =============================================== */

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
         SUCCESS CHECK

         The ball's entire centre/radius must be safely
         INSIDE the bucket.

         Touching an outside wall does NOT count.

         Since the side walls are solid, the practical way
         to complete the level is by entering from above.
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

      const WALL = 5;

      const safelyInsideBucket =
        next.x >=
          bucketLeft +
            WALL +
            BALL_RADIUS &&
        next.x <=
          bucketRight -
            WALL -
            BALL_RADIUS &&
        next.y >=
          bucketTop +
            BALL_RADIUS &&
        next.y <=
          bucketBottom -
            BALL_RADIUS;

      if (safelyInsideBucket) {
        liveBall.current = next;

        drawBall(next);

        setRunning(false);
        setResult("success");

        animation.current = null;

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

      if (
        stillTime.current >
        1.25
      ) {
        liveBall.current = next;

        drawBall(next);

        setRunning(false);
        setResult("stopped");

        animation.current = null;

        return;
      }

      /*
        Safety timeout.
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

        animation.current = null;

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
  }, [running, parts, challenge]);

  /* =======================================================
     RUN MACHINE
     ======================================================= */

  const runMachine = () => {
    if (
      animation.current !== null
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

    drawBall(challenge.start);

    setPreview(null);
    setRemoveMode(false);
    setResult("running");
    setRunning(true);
  };

  /* =======================================================
     COMPONENT GRAPHICS

     IMPORTANT:

     These are RESPONSIVE.

     Mobile = smaller
     Tablet = medium
     Desktop = larger

     Physics coordinates stay exactly the same.
     ======================================================= */

  const renderPartGraphic = (
    type: PartType,
    flipped: boolean,
    active = false,
  ) => {
    /* -----------------------------------------------------
       BUMPER
       ----------------------------------------------------- */

    if (type === "bumper") {
      return (
        <span
          className={`
            h-4 w-4
            rounded-full
            border-2
            border-primary
            bg-primary/20

            sm:h-5 sm:w-5

            lg:h-7 lg:w-7
            lg:border-[3px]

            ${
              active
                ? "shadow-[0_0_25px_rgba(229,169,61,0.85)]"
                : "shadow-[0_0_12px_rgba(229,169,61,0.25)]"
            }
          `}
        />
      );
    }

    /* -----------------------------------------------------
       CONVEYOR
       ----------------------------------------------------- */

    if (type === "conveyor") {
      return (
        <span
          className={`
            relative
            h-3 w-7
            border
            border-primary/80
            bg-card

            sm:h-4 sm:w-8

            lg:h-5 lg:w-12
            lg:border-2

            ${
              flipped
                ? "rotate-180"
                : ""
            }
          `}
        >
          <span
            className="
              absolute inset-0
              flex
              items-center
              justify-around
              font-mono
              text-[6px]
              text-primary

              sm:text-[7px]
              lg:text-[8px]
            "
          >
            › › ›
          </span>
        </span>
      );
    }

    /* -----------------------------------------------------
       RAMP / LAUNCHER
       ----------------------------------------------------- */

    return (
      <span
        className={`
          relative
          h-[2px]
          w-7
          bg-primary

          sm:w-9

          lg:h-[3px]
          lg:w-14

          ${
            flipped
              ? "-rotate-[28deg]"
              : "rotate-[28deg]"
          }

          ${
            active
              ? "shadow-[0_0_20px_rgba(229,169,61,0.9)]"
              : "shadow-[0_0_8px_rgba(229,169,61,0.3)]"
          }
        `}
      >
        {type === "launcher" && (
          <span
            className="
              absolute
              -right-1
              -top-[5px]
              h-3
              w-[5px]
              bg-starlight

              lg:-top-[7px]
              lg:h-4
              lg:w-[6px]
            "
          />
        )}
      </span>
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="machine-panel relative overflow-hidden p-3 sm:p-6 lg:p-8">
      {/* =====================================================
          HEADER
          ===================================================== */}

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

      {/* =====================================================
          CHALLENGE SELECTOR
          ===================================================== */}

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
              className={`
                min-h-11
                shrink-0
                border
                px-4
                py-2
                font-mono
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                transition-colors

                ${
                  index ===
                  challengeIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                }
              `}
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

      {/* =====================================================
          MAIN GAME LAYOUT
          ===================================================== */}

      <div className="mt-6 grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
        {/* ===================================================
            COMPONENT TRAY
            =================================================== */}

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
                  setRemoveMode(false);
                }}
                className={`
                  flex
                  min-h-14
                  items-center
                  gap-3
                  border
                  p-3
                  text-left
                  transition-colors

                  ${
                    selected ===
                      type &&
                    !removeMode
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/60"
                  }
                `}
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

          {/* REMOVE BUTTON */}

          <button
            type="button"
            disabled={running}
            onClick={() =>
              setRemoveMode(
                (current) =>
                  !current,
              )
            }
            className={`
              mt-2
              min-h-11
              w-full
              border
              px-3
              py-2
              font-mono
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              transition-colors

              ${
                removeMode
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }
            `}
          >
            {removeMode
              ? "Cancel remove"
              : "Remove part"}
          </button>

          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Tap almost anywhere above the floor to place a
            component. Parts use fine snapping for precise
            placement. Tap a placed component to rotate it.
          </p>
        </div>

        {/* ===================================================
            GAME BOARD
            =================================================== */}

        <div className="min-w-0">
          <div
            role="application"
            aria-label="Chain reaction machine building area"
            onPointerMove={
              updatePreview
            }
            onPointerLeave={() =>
              setPreview(null)
            }
            onPointerUp={
              placePart
            }
            className="
              blueprint-grid
              relative
              aspect-[2/1]
              w-full
              touch-none
              cursor-crosshair
              select-none
              overflow-hidden
              border
              border-border
              bg-background/70
            "
          >
            {/* ===============================================
                START MARKER
                =============================================== */}

            <div
              className="pointer-events-none absolute z-[5] -translate-x-1/2"
              style={{
                left: `${
                  (challenge.start
                    .x /
                    WIDTH) *
                  100
                }%`,

                top: `${
                  (challenge.start
                    .y /
                    HEIGHT) *
                  100
                }%`,
              }}
            >
              <div className="-translate-y-9 text-center">
                <span className="font-mono text-[7px] font-bold uppercase tracking-wider text-primary sm:text-[9px]">
                  Start
                </span>

                <div className="mx-auto mt-1 h-[2px] w-8 bg-primary/70 sm:w-14" />
              </div>
            </div>

            {/* ===============================================
                SOLID OPEN-TOP TARGET BUCKET
                =============================================== */}

            <div
              className="
                pointer-events-none
                absolute
                z-[4]
                border-x-[4px]
                border-b-[4px]
                border-primary
                bg-primary/15
                shadow-[inset_0_-10px_20px_rgba(229,169,61,0.08)]

                sm:border-x-[5px]
                sm:border-b-[5px]
              "
              style={{
                left: `${
                  (challenge.bucket
                    .x /
                    WIDTH) *
                  100
                }%`,

                top: `${
                  (challenge.bucket
                    .y /
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
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] font-bold uppercase text-primary sm:-top-6 sm:text-[9px]">
                Target
              </span>
            </div>

            {/* ===============================================
                FLOOR
                =============================================== */}

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

            {/* ===============================================
                DESKTOP PLACEMENT PREVIEW
                =============================================== */}

            {preview &&
              !running &&
              !removeMode && (
                <div
                  className="
                    pointer-events-none
                    absolute
                    z-[8]
                    flex
                    h-[40px]
                    w-[48px]
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    opacity-35
                  "
                  style={{
                    left: `${
                      (preview.x /
                        WIDTH) *
                      100
                    }%`,

                    top: `${
                      (preview.y /
                        HEIGHT) *
                      100
                    }%`,
                  }}
                >
                  {renderPartGraphic(
                    selected,
                    false,
                  )}
                </div>
              )}

            {/* ===============================================
                COMPONENTS
                =============================================== */}

            {parts.map(
              (part) => (
                <button
                  key={part.id}
                  type="button"
                  aria-label={
                    part.locked
                      ? `Fixed ${
                          partLabels[
                            part
                              .type
                          ].name
                        }`
                      : `${
                          partLabels[
                            part
                              .type
                          ].name
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
                  className={`
                    absolute
                    z-10
                    flex

                    h-[32px]
                    w-[36px]

                    -translate-x-1/2
                    -translate-y-1/2

                    touch-manipulation
                    items-center
                    justify-center

                    sm:h-[38px]
                    sm:w-[44px]

                    lg:h-[48px]
                    lg:w-[64px]

                    ${
                      part.locked
                        ? "cursor-not-allowed opacity-75"
                        : removeMode
                          ? "cursor-pointer opacity-60"
                          : "cursor-pointer"
                    }

                    ${
                      activePart ===
                      part.id
                        ? "scale-110"
                        : ""
                    }

                    transition-transform
                    duration-100
                  `}
                  style={{
                    left: `${
                      (part.x /
                        WIDTH) *
                      100
                    }%`,

                    top: `${
                      (part.y /
                        HEIGHT) *
                      100
                    }%`,
                  }}
                >
                  {renderPartGraphic(
                    part.type,
                    part.flipped,
                    activePart ===
                      part.id,
                  )}
                </button>
              ),
            )}

            {/* ===============================================
                BALL
                =============================================== */}

            <div
              ref={ballElement}
              className="
                pointer-events-none
                absolute
                z-20

                h-3
                w-3

                -translate-x-1/2
                -translate-y-1/2

                rounded-full
                border
                border-white
                bg-primary

                shadow-[0_0_10px_rgba(229,169,61,0.8)]

                sm:h-4
                sm:w-4
                sm:border-2
                sm:shadow-[0_0_14px_rgba(229,169,61,0.8)]
              "
              style={{
                left: `${
                  (challenge.start
                    .x /
                    WIDTH) *
                  100
                }%`,

                top: `${
                  (challenge.start
                    .y /
                    HEIGHT) *
                  100
                }%`,

                willChange:
                  "left, top",
              }}
            />
          </div>

          {/* =================================================
              STATUS
              ================================================= */}

          <div
            className={`
              mt-3
              border-l-2
              px-4
              py-2
              text-sm

              ${
                result ===
                "success"
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              }
            `}
          >
            {statusText}
          </div>

          <p className="mt-2 font-mono text-[8px] uppercase tracking-wider text-foreground/45 sm:text-[10px]">
            Fixed components are faded and cannot be moved ·
            Your parts:{" "}
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

      {/* =====================================================
          BOTTOM CONTROLS
          ===================================================== */}

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Experiment with gravity, momentum and component
          placement. Rotate components to change the path of
          the ball. The target is a physical open-top bucket,
          so the ball must enter from above.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {/* CLEAR */}

          <button
            type="button"
            onClick={
              clearMachine
            }
            disabled={
              running
            }
            className="
              min-h-11
              border
              border-border
              px-4
              py-3
              font-mono
              text-xs
              font-bold
              uppercase
              text-foreground
              transition-colors

              hover:border-primary
              hover:text-primary

              disabled:opacity-40
            "
          >
            Clear
          </button>

          {/* RESET BALL */}

          <button
            type="button"
            onClick={
              resetBall
            }
            className="
              min-h-11
              border
              border-border
              px-4
              py-3
              font-mono
              text-xs
              font-bold
              uppercase
              text-foreground
              transition-colors

              hover:border-primary
              hover:text-primary
            "
          >
            Reset ball
          </button>

          {/* RUN */}

          <button
            type="button"
            onClick={
              runMachine
            }
            disabled={
              running
            }
            className="
              col-span-2
              min-h-12
              border
              border-primary
              bg-primary
              px-5
              py-3
              font-mono
              text-xs
              font-bold
              uppercase
              text-primary-foreground
              transition-colors

              hover:bg-background
              hover:text-primary

              disabled:opacity-50

              sm:col-auto
            "
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
                className="
                  col-span-2
                  min-h-11
                  border
                  border-primary
                  px-5
                  py-3
                  font-mono
                  text-xs
                  font-bold
                  uppercase
                  text-primary
                  transition-colors

                  hover:bg-primary
                  hover:text-primary-foreground

                  sm:col-auto
                "
              >
                Next challenge
              </button>
            )}
        </div>
      </div>
    </div>
  );
}