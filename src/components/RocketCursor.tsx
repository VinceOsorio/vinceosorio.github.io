import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  type: "flame" | "smoke";
};

export function RocketCursor() {
  const rocketRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const rocket = rocketRef.current;
    const canvas = canvasRef.current;

    if (!rocket || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only use custom cursor on devices with a precise pointer.
    const finePointer = window.matchMedia("(pointer: fine)");

    if (!finePointer.matches) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    // ------------------------------------------------
    // CURSOR POSITION
    // ------------------------------------------------

    let mouseX = -100;
    let mouseY = -100;

    let previousX = -100;
    let previousY = -100;

    let moveX = 0;
    let moveY = 0;

    // Actual direction the mouse is moving.
    let directionAngle = -45;

    // Rotation applied to emoji.
    //
    // 🚀 naturally points roughly 45 degrees upward/right.
    // Therefore we add 45 degrees to make it face
    // the actual movement direction.
    let rocketRotation = 0;

    let particles: Particle[] = [];

    let cursorVisible = false;

    // ------------------------------------------------
    // SHOW / HIDE
    // ------------------------------------------------

    const showCursor = () => {
      if (cursorVisible) return;

      cursorVisible = true;
      rocket.style.opacity = "1";

      document.documentElement.classList.add("rocket-cursor-active");
    };

    const hideCursor = () => {
      cursorVisible = false;
      rocket.style.opacity = "0";

      document.documentElement.classList.remove("rocket-cursor-active");
    };

    // ------------------------------------------------
    // POINTER MOVEMENT
    // ------------------------------------------------

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }

      previousX = mouseX;
      previousY = mouseY;

      mouseX = event.clientX;
      mouseY = event.clientY;

      if (previousX > -50 && previousY > -50) {
        moveX = mouseX - previousX;
        moveY = mouseY - previousY;
      } else {
        moveX = 0;
        moveY = 0;
      }

      const speed = Math.hypot(moveX, moveY);

      // Determine which direction the cursor is travelling.
      if (speed > 0.15) {
        directionAngle = (Math.atan2(moveY, moveX) * 180) / Math.PI;
      }

      // IMPORTANT:
      // No smoothing on position.
      // The emoji is always exactly where the real cursor is.
      rocket.style.left = `${mouseX}px`;
      rocket.style.top = `${mouseY}px`;

      showCursor();
    };

    // ------------------------------------------------
    // LEAVING WINDOW
    // ------------------------------------------------

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        hideCursor();
      }
    };

    const handleBlur = () => {
      hideCursor();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        hideCursor();
      }
    };

    // ------------------------------------------------
    // PARTICLES
    // ------------------------------------------------

    const createExhaustParticle = (
      backX: number,
      backY: number,
      directionRadians: number,
      speed: number,
    ) => {
      // Exhaust travels in the opposite direction
      // that the rocket is facing.
      const exhaustAngle = directionRadians + Math.PI + (Math.random() - 0.5) * 0.5;

      const exhaustSpeed = 0.6 + Math.random() * 1.8 + speed * 0.025;

      const isSmoke = Math.random() > 0.7;

      particles.push({
        x: backX + (Math.random() - 0.5) * 3,

        y: backY + (Math.random() - 0.5) * 3,

        vx: Math.cos(exhaustAngle) * exhaustSpeed,

        vy: Math.sin(exhaustAngle) * exhaustSpeed,

        life: 1,

        size: isSmoke ? 3 + Math.random() * 4 : 2 + Math.random() * 4,

        type: isSmoke ? "smoke" : "flame",
      });
    };

    // ------------------------------------------------
    // ANIMATION LOOP
    // ------------------------------------------------

    let animationFrame = 0;

    const animate = () => {
      const speed = Math.hypot(moveX, moveY);

      // ----------------------------------------------
      // ROTATION
      // ----------------------------------------------

      if (speed > 0.15) {
        // 🚀 naturally points approximately -45°.
        // Add 45° so the nose faces the movement vector.
        const desiredRotation = directionAngle + 45;

        let difference = desiredRotation - rocketRotation;

        // Find shortest rotation path.
        while (difference > 180) {
          difference -= 360;
        }

        while (difference < -180) {
          difference += 360;
        }

        // Smooth rotation only.
        // Higher value = faster turning.
        rocketRotation += difference * 0.32;
      }

      rocket.style.transform = `
        translate(-50%, -50%)
        rotate(${rocketRotation}deg)
      `;

      // ----------------------------------------------
      // FIND BACK OF ROCKET
      // ----------------------------------------------

      // directionAngle represents the actual direction
      // that the nose of the rocket is facing.
      const directionRadians = (directionAngle * Math.PI) / 180;

      // Distance from emoji center to its exhaust nozzle.
      const exhaustOffset = 18;

      // Move backward from the centre of the rocket.
      const backX = mouseX - Math.cos(directionRadians) * exhaustOffset;

      const backY = mouseY - Math.sin(directionRadians) * exhaustOffset;

      // ----------------------------------------------
      // CREATE EXHAUST
      // ----------------------------------------------

      if (cursorVisible && speed > 0.4) {
        const particleCount = speed > 15 ? 4 : speed > 7 ? 3 : speed > 2 ? 2 : 1;

        for (let i = 0; i < particleCount; i++) {
          createExhaustParticle(backX, backY, directionRadians, speed);
        }
      }

      // Slowly decay movement so flame stops
      // once the cursor stops moving.
      moveX *= 0.72;
      moveY *= 0.72;

      // ----------------------------------------------
      // CLEAR CANVAS
      // ----------------------------------------------

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Prevent excessive particle buildup.
      if (particles.length > 250) {
        particles = particles.slice(-250);
      }

      // ----------------------------------------------
      // DRAW PARTICLES
      // ----------------------------------------------

      particles = particles.filter((particle) => particle.life > 0);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Slight drag.
        particle.vx *= 0.96;
        particle.vy *= 0.96;

        particle.life -= particle.type === "flame" ? 0.065 : 0.035;

        if (particle.type === "flame") {
          const radius = particle.size * Math.max(particle.life, 0);

          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            radius,
          );

          gradient.addColorStop(0, `rgba(255, 255, 210, ${particle.life})`);

          gradient.addColorStop(0.3, `rgba(255, 200, 70, ${particle.life * 0.9})`);

          gradient.addColorStop(0.65, `rgba(255, 100, 20, ${particle.life * 0.65})`);

          gradient.addColorStop(1, "rgba(255, 70, 10, 0)");

          ctx.globalCompositeOperation = "lighter";

          ctx.fillStyle = gradient;

          ctx.beginPath();

          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);

          ctx.fill();
        } else {
          // Smoke
          ctx.globalCompositeOperation = "source-over";

          ctx.fillStyle = `rgba(
            170,
            170,
            180,
            ${particle.life * 0.15}
          )`;

          ctx.beginPath();

          ctx.arc(particle.x, particle.y, particle.size * (1.4 - particle.life), 0, Math.PI * 2);

          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";

      animationFrame = requestAnimationFrame(animate);
    };

    // ------------------------------------------------
    // EVENTS
    // ------------------------------------------------

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    window.addEventListener("pointerout", handlePointerOut, { passive: true });

    window.addEventListener("blur", handleBlur);

    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", handleVisibility);

    animationFrame = requestAnimationFrame(animate);

    // ------------------------------------------------
    // CLEANUP
    // ------------------------------------------------

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("pointerout", handlePointerOut);

      window.removeEventListener("blur", handleBlur);

      window.removeEventListener("resize", resizeCanvas);

      document.removeEventListener("visibilitychange", handleVisibility);

      document.documentElement.classList.remove("rocket-cursor-active");
    };
  }, []);

  return (
    <>
      {/* Rocket exhaust */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          z-[9998]
        "
      />

      {/* Actual cursor */}
      <div
        ref={rocketRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          left-0
          top-0
          z-[9999]
          select-none
          opacity-0
          transition-opacity
          duration-100
        "
        style={{
          willChange: "transform, left, top",

          fontSize: "32px",

          lineHeight: 1,

          transformOrigin: "50% 50%",
        }}
      >
        🚀
      </div>
    </>
  );
}
