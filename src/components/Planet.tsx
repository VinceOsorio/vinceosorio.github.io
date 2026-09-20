import { type ReactNode, useId } from "react";

export type ProjectAccessory =
  | "plain"
  | "solar"
  | "antenna"
  | "ring"
  | "thrusters"
  | "dish"
  | "rocket"
  | "balloon"
  | "hubble"
  | "voyager"
  | "comet"
  | "beacon"
  | "lander"
  | "capsule";

const METAL = "#aebfd0";
const LIGHT = "#e8f5ff";
const BLUE = "#2f6fad";
const DARK = "#0d1c33";
const GOLD = "#e7bd68";
const LINE = "#b9ddff";

type ImageProps = {
  image?: string | undefined;
  clipBase: string;
};

function Panel({ x, y, w = 24, h = 11 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1.5" fill={BLUE} stroke={LINE} strokeWidth="1" />
      <path
        d={`M${x + w / 3} ${y}v${h} M${x + (w * 2) / 3} ${y}v${h} M${x} ${y + h / 2}h${w}`}
        stroke="#9ed0ff"
        strokeOpacity=".45"
        strokeWidth=".7"
      />
    </g>
  );
}

/**
 * Fills an existing SVG body shape with the project image.
 * The shape is used only as a clip mask, so all of the original
 * outlines/accessories can still be drawn normally above the image.
 */
function BodyImage({
  image,
  clipBase,
  name,
  x,
  y,
  width,
  height,
  shape,
}: ImageProps & {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: ReactNode;
}) {
  if (!image) return null;

  const clipId = `${clipBase}-${name}`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>{shape}</clipPath>
      </defs>
      <image
        href={image}
        x={x}
        y={y}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
    </>
  );
}

function RingedPlanet({ image, clipBase }: ImageProps) {
  return (
    <g transform="rotate(-14 50 50)">
      {/* Existing rings stay exactly as the accessories around the main body. */}
      <ellipse cx="50" cy="50" rx="46" ry="15" stroke={LINE} strokeWidth="2" opacity=".72" />
      <ellipse cx="50" cy="50" rx="38" ry="11" stroke="#75aee0" strokeWidth="1.2" opacity=".5" />

      {/* Main planet body. */}
      <circle cx="50" cy="50" r="31" fill="#397baa" />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="ringed-planet-body"
        x={19}
        y={19}
        width={62}
        height={62}
        shape={<circle cx="50" cy="50" r="31" />}
      />
      <circle cx="50" cy="50" r="31" fill="none" stroke={LIGHT} strokeWidth="1.4" />

      {/* Original surface details remain on top. */}
      <circle cx="40" cy="38" r="9" fill="#74bce9" opacity=".18" />
      <path d="M30 52c14 5 28 6 40 1" stroke="#d8ecff" strokeWidth="1.2" opacity=".45" />
    </g>
  );
}

function Satellite({ image, clipBase }: ImageProps) {
  return (
    <g transform="rotate(-8 50 50)">
      {/* Solar panels and antenna stay outside the image body. */}
      <Panel x={2} y={44} w={30} h={14} />
      <Panel x={68} y={44} w={30} h={14} />
      <path d="M32 51h11M57 51h11" stroke={LINE} strokeWidth="1.4" />

      {/* Project image fills the complete central satellite body. */}
      <rect x="38" y="33" width="24" height="34" rx="4" fill={METAL} />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="satellite-body"
        x={38}
        y={33}
        width={24}
        height={34}
        shape={<rect x="38" y="33" width="24" height="34" rx="4" />}
      />
      <rect
        x="38"
        y="33"
        width="24"
        height="34"
        rx="4"
        fill="none"
        stroke={LIGHT}
        strokeWidth="1.3"
      />

      <path d="M50 33V22" stroke={LINE} strokeWidth="1.3" />
      <circle cx="50" cy="19" r="3" fill={GOLD} />
    </g>
  );
}

function DishSatellite({ image, clipBase }: ImageProps) {
  return (
    <g transform="rotate(11 50 50)">
      {/* Solar panels remain unchanged. */}
      <Panel x={3} y={45} w={29} h={12} />
      <Panel x={68} y={45} w={29} h={12} />
      <path d="M32 51h12M57 51h11" stroke={LINE} strokeWidth="1.4" />

      {/* Project image fills the complete central body. */}
      <rect x="39" y="35" width="22" height="28" rx="3" fill={METAL} />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="dish-satellite-body"
        x={39}
        y={35}
        width={22}
        height={28}
        shape={<rect x="39" y="35" width="22" height="28" rx="3" />}
      />
      <rect
        x="39"
        y="35"
        width="22"
        height="28"
        rx="3"
        fill="none"
        stroke={LIGHT}
        strokeWidth="1"
      />

      {/* Dish remains an accessory over/outside the main body. */}
      <path
        d="M47 35c-10-11-4-23 10-24 1 10-2 18-10 24Z"
        fill="#dbe6ef"
        stroke={LIGHT}
        strokeWidth="1.2"
      />
      <path d="m48 34 8-18" stroke={DARK} strokeWidth="1.1" />
      <circle cx="58" cy="14" r="2.4" fill={GOLD} />
    </g>
  );
}

function Voyager({ image, clipBase }: ImageProps) {
  return (
    <g transform="rotate(-17 50 50)">
      {/* Main circular probe body becomes the project image. */}
      <circle cx="52" cy="46" r="20" fill="#ced9e2" />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="voyager-body"
        x={32}
        y={26}
        width={40}
        height={40}
        shape={<circle cx="52" cy="46" r="20" />}
      />
      <circle cx="52" cy="46" r="20" fill="none" stroke={LIGHT} strokeWidth="1.4" />

      {/* Original dish/instruments/booms stay unchanged. */}
      <path
        d="M38 44c7-11 22-17 31-7-3 9-9 17-18 22"
        fill="#edf2f6"
        stroke={LIGHT}
        strokeWidth="1.1"
      />
      <path d="m52 46 15-9" stroke={DARK} strokeWidth="1.3" />
      <circle cx="69" cy="34" r="2.8" fill={GOLD} />
      <path d="M41 57 13 83M42 61 25 92M61 59 85 78" stroke={LINE} strokeWidth="1.2" />
      <circle cx="10" cy="86" r="3.2" fill={GOLD} />
      <rect
        x="22"
        y="88"
        width="9"
        height="5"
        rx="1"
        fill="#b56f45"
        stroke="#ffd49b"
        strokeWidth=".7"
      />
      <path d="m63 44 28-19" stroke="#84c5ff" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="93" cy="23" r="2.4" fill="#9edcff" />
    </g>
  );
}

function Hubble({ image, clipBase }: ImageProps) {
  return (
    <g transform="rotate(-22 50 50)">
      {/* Solar panels remain unchanged. */}
      <Panel x={4} y={44} w={28} h={12} />
      <Panel x={68} y={44} w={28} h={12} />
      <path d="M32 50h12M58 50h10" stroke={LINE} strokeWidth="1.4" />

      {/* Project image fills the long telescope body. */}
      <rect x="38" y="28" width="24" height="44" rx="4" fill={METAL} />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="hubble-body"
        x={38}
        y={28}
        width={24}
        height={44}
        shape={<rect x="38" y="28" width="24" height="44" rx="4" />}
      />
      <rect
        x="38"
        y="28"
        width="24"
        height="44"
        rx="4"
        fill="none"
        stroke={LIGHT}
        strokeWidth="1.3"
      />

      {/* Telescope cap and details remain. */}
      <rect x={40} y="21" width="20" height="10" rx="2" fill="#dce8f2" stroke={LIGHT} />
      <circle cx="50" cy="22" r="6" fill={DARK} stroke="#94d4ff" />
      <path d="M43 75h14" stroke={GOLD} strokeWidth="2" />
    </g>
  );
}

function Rocket({ image, clipBase }: ImageProps) {
  const bodyPath = "M38 70c0-24 6-46 12-54 9 10 12 30 9 54Z";

  return (
    <g transform="rotate(22 50 50)">
      {/* Project image fills the complete rocket fuselage. */}
      <path d={bodyPath} fill={METAL} />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="rocket-body"
        x={38}
        y={16}
        width={24}
        height={54}
        shape={<path d={bodyPath} />}
      />
      <path d={bodyPath} fill="none" stroke={LIGHT} strokeWidth="1.4" />

      {/* Fins and flames remain outside the image-filled fuselage. */}
      <path d="m42 62-11 11 12 1m15-12 11 11-11 1" fill="#758ba0" stroke={LIGHT} />
      <path d="M46 70 40 96h10l2-20 3 20h10l-8-30Z" fill="#ff9a55" opacity=".82" />
      <path d="M50 71 48 90h4l1-14 2 14h4l-4-20Z" fill="#fff0be" />
    </g>
  );
}

function Sputnik({ image, clipBase }: ImageProps) {
  return (
    <g transform="rotate(-10 50 50)">
      {/* Main sphere becomes the project image. */}
      <circle cx="50" cy="48" r="21" fill={METAL} />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="sputnik-body"
        x={29}
        y={27}
        width={42}
        height={42}
        shape={<circle cx="50" cy="48" r="21" />}
      />
      <circle cx="50" cy="48" r="21" fill="none" stroke={LIGHT} strokeWidth="1.4" />

      {/* Antenna legs remain unchanged. */}
      <path d="M34 61 7 90M42 64 26 96M58 64 78 94M64 60 94 84" stroke={LINE} strokeWidth="1.3" />
      <circle cx="50" cy="48" r="27" stroke="#8bcaff" opacity=".14" />
    </g>
  );
}

function Balloon({ image, clipBase }: ImageProps) {
  return (
    <g>
      {/* Project image fills the complete balloon envelope. */}
      <ellipse cx="50" cy="25" rx="25" ry="31" fill="#9ccdf1" fillOpacity=".72" />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="balloon-body"
        x={25}
        y={-6}
        width={50}
        height={62}
        shape={<ellipse cx="50" cy="25" rx="25" ry="31" />}
      />
      <ellipse cx="50" cy="25" rx="25" ry="31" fill="none" stroke={LIGHT} strokeWidth="1.2" />

      {/* Suspension, payload, solar panels and beacon remain. */}
      <path d="M39 49 45 60m14-11-6 11m-4-7v13" stroke={LINE} />
      <rect x="40" y="62" width="20" height="16" rx="2" fill={METAL} stroke={LIGHT} />
      <Panel x={23} y={64} w={17} h={10} />
      <Panel x={60} y={64} w={17} h={10} />
      <path d="M50 78v12" stroke={LINE} />
      <circle cx="50" cy="93" r="3" fill={GOLD} />
    </g>
  );
}

function Lander({ image, clipBase }: ImageProps) {
  const bodyPath = "M34 44h32l9 20H25Z";

  return (
    <g>
      {/* Project image fills the complete central lander body. */}
      <path d={bodyPath} fill={METAL} />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="lander-body"
        x={25}
        y={44}
        width={50}
        height={20}
        shape={<path d={bodyPath} />}
      />
      <path d={bodyPath} fill="none" stroke={LIGHT} strokeWidth="1.2" />

      {/* Upper module, legs, feet and antenna remain unchanged. */}
      <rect x="40" y="32" width="20" height="12" rx="2" fill={GOLD} stroke="#ffe0a5" />
      <path d="M30 60 14 84m54-24 16 24M40 61l-6 28m21-28 6 28" stroke={LINE} strokeWidth="1.5" />
      <path d="M12 86h12m50 0h12M28 92h12m16 0h12" stroke="#89c9ff" strokeWidth="2" />
      <path d="M50 32V18" stroke={LINE} />
      <circle cx="50" cy="15" r="3" fill="#ff8c7f" />
    </g>
  );
}

function Capsule({ image, clipBase }: ImageProps) {
  const lowerBodyPath = "m30 66 10-34h20l10 34Z";
  const nosePath = "M40 32c1-9 4-14 10-17 6 3 9 9 10 17Z";

  return (
    <g>
      {/* Project image fills the complete capsule silhouette above the lower service module. */}
      <path d={lowerBodyPath} fill={METAL} />
      <path d={nosePath} fill="#dbe7f1" />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="capsule-body"
        x={30}
        y={15}
        width={40}
        height={51}
        shape={
          <>
            <path d={lowerBodyPath} />
            <path d={nosePath} />
          </>
        }
      />
      <path d={lowerBodyPath} fill="none" stroke={LIGHT} strokeWidth="1.4" />
      <path d={nosePath} fill="none" stroke={LIGHT} />

      {/* Lower module and thrusters remain unchanged. */}
      <path d="M34 66h32l-5 11H39Z" fill="#68788b" stroke={LIGHT} />
      <path
        d="m39 78-5 12m13-12v15m8-15 5 12"
        stroke="#ffb160"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function Comet({ image, clipBase }: ImageProps) {
  return (
    <g transform="rotate(-14 50 50)">
      {/* Existing comet tails remain. */}
      <path d="M2 64c28-22 50-28 76-23-22 5-38 14-58 32Z" fill="#74beff" opacity=".22" />
      <path d="M3 58c28-12 52-17 76-12-24 1-42 10-63 22Z" fill="#d8f2ff" opacity=".34" />

      {/* Project image fills the entire comet head. */}
      <circle cx="74" cy="45" r="18" fill="#a9c7d9" />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="comet-body"
        x={56}
        y={27}
        width={36}
        height={36}
        shape={<circle cx="74" cy="45" r="18" />}
      />
      <circle cx="74" cy="45" r="18" fill="none" stroke={LIGHT} strokeWidth="1.2" />

      {/* Keep a very subtle crater texture on top without hiding the image. */}
      <circle cx="68" cy="40" r="3.5" fill="#71899b" opacity="0.18" />
      <circle cx="80" cy="51" r="2.6" fill="#607789" opacity="0.18" />
    </g>
  );
}

function ThrusterProbe({ image, clipBase }: ImageProps) {
  const bodyPath = "M32 36h36l9 15-9 16H32l-10-16Z";

  return (
    <g transform="rotate(8 50 50)">
      {/* Project image fills the complete hexagonal probe body. */}
      <path d={bodyPath} fill={METAL} />
      <BodyImage
        image={image}
        clipBase={clipBase}
        name="thruster-probe-body"
        x={22}
        y={36}
        width={55}
        height={31}
        shape={<path d={bodyPath} />}
      />
      <path d={bodyPath} fill="none" stroke={LIGHT} strokeWidth="1.3" />

      {/* Probe booms, thruster trails and nodes remain unchanged. */}
      <path d="M24 43 4 37m20 22-20 7m60-26 26-19M68 64l26 17" stroke={LINE} strokeWidth="1.2" />
      <path d="M4 37-6 33m10 30-10 6" stroke="#71c4ff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="96" cy="18" r="2.8" fill={GOLD} />
      <circle cx="97" cy="86" r="2.8" fill="#91dcff" />
    </g>
  );
}

export function Planet({
  size,
  image,
  className = "",
  accessory = "plain",
}: {
  planet?: "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "neptune";
  size: number;
  image?: string;
  className?: string;
  accessory?: ProjectAccessory;
}) {
  const rawId = useId();
  const clipBase = rawId.replace(/:/g, "");

  const object = (() => {
    const props = { image, clipBase };

    switch (accessory) {
      case "ring":
      case "plain":
        return <RingedPlanet {...props} />;
      case "solar":
        return <Satellite {...props} />;
      case "antenna":
      case "dish":
        return <DishSatellite {...props} />;
      case "voyager":
        return <Voyager {...props} />;
      case "hubble":
        return <Hubble {...props} />;
      case "rocket":
        return <Rocket {...props} />;
      case "beacon":
        return <Sputnik {...props} />;
      case "balloon":
        return <Balloon {...props} />;
      case "lander":
        return <Lander {...props} />;
      case "capsule":
        return <Capsule {...props} />;
      case "comet":
        return <Comet {...props} />;
      case "thrusters":
        return <ThrusterProbe {...props} />;
      default:
        return <Satellite {...props} />;
    }
  })();

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: size * 0.75,
          height: size * 0.75,
          transform: "translate(-50%, -50%)",
          background: "rgba(75, 155, 255, 0.08)",
          filter: `blur(${Math.max(8, size * 0.13)}px)`,
        }}
      />
      <svg
        viewBox="0 0 100 100"
        className="orbiter-art relative h-full w-full overflow-visible drop-shadow-[0_0_9px_rgba(120,190,255,0.3)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {object}
      </svg>
    </span>
  );
}
