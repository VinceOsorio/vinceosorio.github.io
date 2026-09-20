import frc2020aAsset from "@/assets/projects/portfolio-000.jpg.asset.json";
import frc2020bAsset from "@/assets/projects/portfolio-001.jpg.asset.json";
import frc2020cAsset from "@/assets/projects/portfolio-002.jpg.asset.json";
import frc2022aAsset from "@/assets/projects/portfolio-003.jpg.asset.json";
import frc2022bAsset from "@/assets/projects/portfolio-004.jpg.asset.json";
import frc2022cAsset from "@/assets/projects/portfolio-005.jpg.asset.json";
import kart1Asset from "@/assets/projects/portfolio-006.jpg.asset.json";
import kart2Asset from "@/assets/projects/portfolio-007.jpg.asset.json";
import kart3Asset from "@/assets/projects/portfolio-008.jpg.asset.json";
import rortv1Asset from "@/assets/projects/portfolio-009.jpg.asset.json";
import rortv2Asset from "@/assets/projects/portfolio-011.jpg.asset.json";
import rortv3Asset from "@/assets/projects/portfolio-012.jpg.asset.json";
import frortv1Asset from "@/assets/projects/portfolio-013.jpg.asset.json";
import frortv2Asset from "@/assets/projects/portfolio-014.jpg.asset.json";
import frortv3Asset from "@/assets/projects/portfolio-015.jpg.asset.json";
import rovSketchAsset from "@/assets/projects/portfolio-020.png.asset.json";
import rovCadAsset from "@/assets/projects/portfolio-021.jpg.asset.json";
import rovBuild1Asset from "@/assets/projects/portfolio-023.jpg.asset.json";
import rovBuild2Asset from "@/assets/projects/portfolio-024.jpg.asset.json";
import rovPrintAsset from "@/assets/projects/portfolio-025.png.asset.json";
import rovFieldAsset from "@/assets/projects/portfolio-027.jpg.asset.json";
import rovField2Asset from "@/assets/projects/portfolio-028.jpg.asset.json";
import boatCodeAsset from "@/assets/projects/portfolio-029.jpg.asset.json";
import boatNotesAsset from "@/assets/projects/portfolio-030.png.asset.json";
import boatPlansAsset from "@/assets/projects/portfolio-031.png.asset.json";
import outboardSketchAsset from "@/assets/projects/portfolio-032.png.asset.json";
import outboardPlanAsset from "@/assets/projects/portfolio-033.png.asset.json";
import subbots2025Asset from "@/assets/projects/portfolio-034.jpg.asset.json";
import subbots2026Asset from "@/assets/projects/portfolio-036.jpg.asset.json";

const frc2020a = frc2020aAsset.url;
const frc2020b = frc2020bAsset.url;
const frc2020c = frc2020cAsset.url;
const frc2022a = frc2022aAsset.url;
const frc2022b = frc2022bAsset.url;
const frc2022c = frc2022cAsset.url;
const kart1 = kart1Asset.url;
const kart2 = kart2Asset.url;
const kart3 = kart3Asset.url;
const rortv1 = rortv1Asset.url;
const rortv2 = rortv2Asset.url;
const rortv3 = rortv3Asset.url;
const frortv1 = frortv1Asset.url;
const frortv2 = frortv2Asset.url;
const frortv3 = frortv3Asset.url;
const rovSketch = rovSketchAsset.url;
const rovCad = rovCadAsset.url;
const rovBuild1 = rovBuild1Asset.url;
const rovBuild2 = rovBuild2Asset.url;
const rovPrint = rovPrintAsset.url;
const rovField = rovFieldAsset.url;
const rovField2 = rovField2Asset.url;
const boatCode = boatCodeAsset.url;
const boatNotes = boatNotesAsset.url;
const boatPlans = boatPlansAsset.url;
const outboardSketch = outboardSketchAsset.url;
const outboardPlan = outboardPlanAsset.url;
const subbots2025 = subbots2025Asset.url;
const subbots2026 = subbots2026Asset.url;

export type ProjectStatus = "completed" | "ongoing" | "upcoming";
export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  body: string[];
  category: string;
  role: string;
  focus: string;
  outcome: string;
  stack: string[];
  year: string;
  status: ProjectStatus;
  cover: string;
  gallery: string[];
  orbit: number;
  size: number;
  duration: number;
  offset: number;
  color: string;
  planet: "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "neptune";
};

export const projects: Project[] = [
  {
    slug: "double-rov-development",
    name: "Double ROV Development",
    tagline: "Mechanical leadership · RoboSub competition",
    summary:
      "Leading two ROV platforms for UBC Subbots: a short-term competition vehicle and a longer-term platform using more advanced materials and manufacturing methods.",
    category: "Marine Robotics",
    role: "Mechanical Projects Lead",
    focus: "Team planning, concept development and mechanical integration",
    outcome: "Two coordinated ROV development paths with shared design standards",
    body: [
      "This project involves leading the mechanical development of two underwater vehicles at the same time. The short-term ROV is intended to give the team a practical platform that can be designed, manufactured and tested quickly, while the long-term ROV gives us room to investigate more complex materials, fabrication methods and mechanical layouts.",
      "My role is to break the work into manageable mechanical tasks, coordinate timelines and design reviews, and make sure the frame, enclosures, penetrators, actuators and mounting systems can work with the electrical and software requirements. This requires regular communication between subteams because even a small change in enclosure size or sensor location can affect buoyancy, wiring and vehicle control.",
      "I also review CAD models and drawings, help members compare material and manufacturing options, and organize prototype and water-testing activities. A major goal is to improve our documentation so that design decisions and lessons learned can be carried from the short-term ROV into the long-term platform.",
      "The project is still in progress. Its main value so far has been creating a more structured development process while giving newer members meaningful design and manufacturing experience.",
    ],
    stack: ["SOLIDWORKS", "ROV Design", "Design Reviews", "Waterproofing", "Team Leadership"],
    year: "2026 - Present",
    status: "ongoing",
    cover: subbots2026,
    gallery: [subbots2026],
    orbit: 190,
    size: 84,
    duration: 30,
    offset: 0.35,
    color: "radial-gradient(circle at 30% 30%, #d9f5ff, #2d8cb8 45%, #082a3c)",
    planet: "neptune",
  },
  {
    slug: "robosub-2026",
    name: "RoboSub 2026 ROV",
    tagline: "Frames and enclosures · autonomous underwater vehicle",
    summary:
      "A redesigned autonomous underwater vehicle with a narrower, longer hull and enclosures that also act as structural members.",
    category: "Marine Robotics",
    role: "Frames and Enclosures Lead",
    focus: "Structural layout, pressure enclosures and subsystem packaging",
    outcome: "A slimmer ROV architecture with more integrated structural enclosures",
    body: [
      "For RoboSub 2026, I helped lead the redesign of the vehicle's frame and enclosure system. We began by reviewing the previous ROV and identifying where the frame was wider, heavier or more difficult to service than necessary.",
      "The updated concept uses a thinner but longer vehicle layout. Some cylindrical enclosures are integrated as structural members, which reduces the need for separate cross supports and creates a more compact package. The arrangement also had to preserve access to electronics, penetrators and fasteners during assembly and maintenance.",
      "I was responsible for developing the low-power enclosure and supporting the overall mechanical layout. The design work considered sealing, pressure loading, internal component spacing, cable routing and removal of the electronics tray for servicing.",
      "This project strengthened my understanding of how underwater mechanical design connects structure, buoyancy, waterproofing and multidisciplinary integration. It also showed me how important serviceability is when a vehicle must be opened, inspected and rebuilt repeatedly during competition testing.",
    ],
    stack: [
      "SOLIDWORKS",
      "Structural Design",
      "Pressure Enclosures",
      "System Integration",
      "Manufacturing",
    ],
    year: "2025 - 2026",
    status: "completed",
    cover: subbots2025,
    gallery: [subbots2025, subbots2026],
    orbit: 250,
    size: 60,
    duration: 44,
    offset: 0.6,
    color: "radial-gradient(circle at 30% 30%, #b7e9ff, #276b98 45%, #071d35)",
    planet: "earth",
  },
  {
    slug: "autonomous-rail-speeder",
    name: "Autonomous Rail Speeder",
    tagline: "Autonomous rail vehicle · UBC design project",
    summary:
      "Two autonomous rail-vehicle concepts developed with a seven-person team to complete a defined set of course challenges.",
    category: "Autonomous Systems",
    role: "Mechanical Designer and Task Coordinator",
    focus: "Rail guidance, task planning and design documentation",
    outcome: "Two vehicle iterations completed within a two-month schedule",
    body: [
      "Our team designed two versions of an autonomous vehicle intended to operate on rails and complete a series of challenges within a two-month project schedule.",
      "I led the management and completion of more than 30 course tasks, contributed heavily to documentation and applied the engineering design process from requirements through evaluation.",
      "The project required close collaboration across a seven-person team to keep mechanical development, controls and documentation aligned.",
    ],
    stack: [
      "Mechanical Design",
      "Autonomous Systems",
      "Project Planning",
      "Technical Documentation",
    ],
    year: "2025",
    status: "completed",
    cover: "",
    gallery: [],
    orbit: 300,
    size: 62,
    duration: 54,
    offset: 0.18,
    color: "radial-gradient(circle at 30% 30%, #ffe2b8, #ba641f 45%, #44200a)",
    planet: "mars",
  },
  {
    slug: "water-rov",
    name: "Water ROV",
    tagline: "Personal marine robotics project",
    summary:
      "A remotely piloted vessel developed for moderate conditions near docks and coastal areas through four hull prototypes.",
    category: "Personal Project",
    role: "Designer and Builder",
    focus: "Hull iteration, propulsion control and waterproofing",
    outcome: "Four hull prototypes and a functioning Arduino-controlled test vessel",
    body: [
      "I originally started this project as a rescue vessel for Zen Maker Lab's annual boat race. The goal was to build a remotely controlled craft that could operate near a dock and push or pull student boats that became stranded away from shore.",
      "I explored four hull arrangements before selecting a twin-hull layout that provided space for the electronics and separated the two propulsion units. The prototypes helped me compare stability, printability, component access and how the vessel would sit in the water once the batteries and motors were installed.",
      "The control system used an Arduino and two electronic speed controllers so the motors could be controlled independently for differential steering. I also worked through practical waterproofing problems involving printed joints, wiring exits and protection of the electronics from splashes and short periods of exposure.",
      "Incomplete prints and limited time prevented the original rescue version from being finished for the event, so the project shifted toward a smaller speed-focused test craft. That setback was useful because it showed me the importance of printing time, spare components and early water testing when planning a prototype.",
      "Future work includes cleaning up the electronics, improving the software, adding a camera mount and comparing propeller or hull changes through controlled testing rather than relying only on visual judgement.",
    ],
    stack: [
      "Arduino",
      "Electronic Speed Controllers",
      "3D Printing",
      "Waterproofing",
      "Marine Prototyping",
    ],
    year: "2024",
    status: "ongoing",
    cover: rovCad,
    gallery: [rovCad, rovSketch, rovBuild1, rovBuild2, rovPrint, rovField, rovField2],
    orbit: 330,
    size: 60,
    duration: 62,
    offset: 0.42,
    color: "radial-gradient(circle at 30% 30%, #d7f5ff, #1686a8 45%, #063543)",
    planet: "earth",
  },
  {
    slug: "mini-speedboat",
    name: "Mini Speedboat",
    tagline: "3D-printed outboard motor concept",
    summary:
      "A research-led mini speedboat project centred on building a small outboard motor primarily from 3D-printed parts.",
    category: "Personal Project",
    role: "Independent Designer and Researcher",
    focus: "Outboard-motor architecture and 3D-printed mechanical systems",
    outcome: "Component study, concept sketches and an initial engine assembly plan",
    body: [
      "I started the mini speedboat project because I wanted to understand how the parts inside an outboard motor work together instead of treating the motor as a single purchased component. The project began with research into the powerhead, driveshaft, gearcase, cooling path, steering mount and propeller system.",
      "A major challenge was that the reference patent drawings did not include every view or dimension needed to reproduce the assembly directly. I used the available sections and external research to identify the missing relationships and develop my own sketches of how the components could be packaged.",
      "The first version is planned as a small electrically driven unit made mainly from 3D-printed parts. This keeps the project affordable and lets me evaluate alignment, gearing, sealing and assembly access before considering more demanding materials or power sources.",
      "The project is still in the research and early design stage. My next steps are to complete the CAD layout, select bearings and shafts, check the propeller operating range and build a bench-testable drivetrain before integrating it with a hull.",
    ],
    stack: ["Marine Systems", "3D Printing", "Technical Research", "Mechanical CAD", "Arduino"],
    year: "2024 - Present",
    status: "ongoing",
    cover: boatPlans,
    gallery: [boatPlans, boatNotes, outboardSketch, outboardPlan, boatCode],
    orbit: 360,
    size: 58,
    duration: 70,
    offset: 0.75,
    color: "radial-gradient(circle at 30% 30%, #eee0ff, #7a49ae 45%, #24113e)",
    planet: "saturn",
  },
  {
    slug: "rortv-frortv",
    name: "RORTV and FRORTV",
    tagline: "Rough-terrain and firefighting vehicles",
    summary:
      "Two remote-controlled vehicles developed for obstacle-course and elevated fire-suppression challenges; the FRORTV finished as the top-performing vehicle.",
    category: "University Design Project",
    role: "Drive-System Designer and Team Member",
    focus: "Transmission design, vehicle analysis and fire-suppression integration",
    outcome: "Team A2 produced the top-performing FRORTV in the final competition",
    body: [
      "For RORTV, our six-person team built an RC vehicle that could navigate obstacles while its engine remained running throughout the course. We used a continuously variable transmission to change speed and torque and disconnect the output from the axle when stopped.",
      "For FRORTV, we added electronic speed control and a water-delivery system capable of extinguishing candle fires up to 0.8 m above the ground.",
      "I designed the drive system in SOLIDWORKS, supported gear-ratio, speed, climb-height and centre-of-gravity analysis, and contributed to the engineering-design documentation. Team A2 produced the top-performing FRORTV.",
    ],
    stack: ["SOLIDWORKS", "CVT", "Vehicle Dynamics", "Electronic Speed Control", "Design Process"],
    year: "2024",
    status: "completed",
    cover: frortv1,
    gallery: [frortv1, frortv2, frortv3, rortv1, rortv2, rortv3],
    orbit: 390,
    size: 58,
    duration: 78,
    offset: 0.1,
    color: "radial-gradient(circle at 30% 30%, #ffd6bd, #c54e24 45%, #48160b)",
    planet: "mars",
  },
  {
    slug: "drone-environmental-payload",
    name: "Drone Environmental Payload",
    tagline: "Sensor payload · engineering design process",
    summary:
      "A drone-mounted payload designed by a four-person team to measure environmental conditions in flight.",
    category: "University Design Project",
    role: "Mechanical and Controls Team Member",
    focus: "Sensor integration, payload CAD and engineering documentation",
    outcome: "A documented environmental-sensing payload concept and prototype",
    body: [
      "This was my first university engineering project and focused on following and documenting the engineering design process from problem definition through evaluation.",
      "I used Fusion 360 and SOLIDWORKS to create payload prototypes and programmed sensors and a servo motor using a microcontroller.",
      "Our team delivered two progress reports, a final report and a presentation explaining our design decisions and results.",
    ],
    stack: ["Fusion 360", "SOLIDWORKS", "Microcontrollers", "Sensors", "Servo Motor"],
    year: "2023",
    status: "completed",
    cover: "",
    gallery: [],
    orbit: 420,
    size: 56,
    duration: 86,
    offset: 0.55,
    color: "radial-gradient(circle at 30% 30%, #d8efff, #4e84be 45%, #132b4a)",
    planet: "venus",
  },
  {
    slug: "electric-go-kart",
    name: "Electric Go-Kart",
    tagline: "Steel chassis · machining and welding",
    summary:
      "A class-built electric go-kart that introduced me to MIG welding, milling, turning and steel chassis fabrication.",
    category: "Fabrication Project",
    role: "Fabricator and Mechanical Team Member",
    focus: "Steel chassis fabrication and machined drivetrain components",
    outcome: "A complete rolling electric go-kart assembled by a six-student team",
    body: [
      "During my final year of high school, I worked with five classmates to fabricate and assemble an electric go-kart. The chassis was built from steel members that had to be measured, cut, positioned and welded while keeping the wheel and drivetrain locations aligned.",
      "This was my first project using MIG welding. I learned how joint preparation, fixture setup and weld sequence affected both the strength and final geometry of the frame. I also gained experience with a mill and lathe while producing smaller mechanical parts such as the driveshaft and tie rods.",
      "The electrical drive components were prepared by our teacher, so my main contribution was on the mechanical and fabrication side. I helped fit the steering, axle and supporting parts to the chassis and worked through small alignment issues during assembly.",
      "The project gave me an early appreciation for manufacturing tolerances: a design can look correct in a sketch, but small fabrication errors can create noticeable problems when bearings, shafts and steering parts must all line up.",
    ],
    stack: ["MIG Welding", "Lathe", "Mill", "Steel Fabrication", "Vehicle Assembly"],
    year: "2022",
    status: "completed",
    cover: kart1,
    gallery: [kart1, kart2, kart3],
    orbit: 450,
    size: 52,
    duration: 92,
    offset: 0.27,
    color: "radial-gradient(circle at 30% 30%, #f2f2f2, #8b8f94 45%, #262a2f)",
    planet: "mercury",
  },
  {
    slug: "frc-2022",
    name: "FIRST Robotics 2022",
    tagline: "Mechanical leadership · competition robot",
    summary:
      "A return to FIRST Robotics that combined mechanical and electrical work with team leadership, planning and mentoring.",
    category: "Competition Robotics",
    role: "Mechanical and Electrical Lead Student",
    focus: "Robot integration, CAD and team coordination",
    outcome: "A completed competition robot and stronger team onboarding process",
    body: [
      "After the 2021 competition was cancelled, I returned to a team with many new members and took on a larger leadership and project-management role.",
      "I focused on mechanical and electrical systems, CAD modelling, organization and research while helping new members understand the competition and their tasks.",
      "The season taught me to learn tasks thoroughly before delegating them, which made my leadership clearer and more effective.",
    ],
    stack: ["Robotics", "CAD", "Fabrication", "Electrical Integration", "Team Leadership"],
    year: "2022",
    status: "completed",
    cover: frc2022a,
    gallery: [frc2022a, frc2022b, frc2022c],
    orbit: 475,
    size: 50,
    duration: 98,
    offset: 0.68,
    color: "radial-gradient(circle at 30% 30%, #ffedc7, #d59b2c 45%, #473005)",
    planet: "jupiter",
  },
  {
    slug: "frc-2020",
    name: "FIRST Robotics 2020",
    tagline: "First competition robot · mechanical and electrical",
    summary:
      "My introduction to robotics: fabricating, sourcing and wiring a competition robot for ball handling, wheel control and climbing challenges.",
    category: "Competition Robotics",
    role: "Mechanical and Electrical Team Member",
    focus: "Fabrication, wiring and competition mechanism development",
    outcome: "First complete competition robot and foundation for later engineering work",
    body: [
      "My high-school engineering teacher introduced me to FIRST Robotics, where students in grades 10-12 collaborated on a robot for that year's challenge.",
      "Our design focused on collecting up to five balls, delivering them to scoring locations, controlling a colour wheel and climbing and balancing on a bar.",
      "I contributed to mechanical fabrication, component sourcing and electrical wiring. The experience sparked my interest in engineering and gave me a foundation for later robotics projects.",
    ],
    stack: ["Robotics", "Fabrication", "Electrical Wiring", "Component Sourcing", "Teamwork"],
    year: "2020",
    status: "completed",
    cover: frc2020a,
    gallery: [frc2020a, frc2020b, frc2020c],
    orbit: 500,
    size: 48,
    duration: 104,
    offset: 0.88,
    color: "radial-gradient(circle at 30% 30%, #dbe8ff, #4f68a7 45%, #18233f)",
    planet: "venus",
  },
  {
    slug: "cfd-fea",
    name: "CFD and FEA Studies",
    tagline: "Developing simulation capability",
    summary:
      "Ongoing self-directed work applying computational fluid dynamics and finite element analysis to mechanical and marine designs.",
    category: "Personal Project",
    role: "Independent Analyst",
    focus: "Simulation setup, mesh development and design comparison",
    outcome: "A developing analysis workflow for future ROV, hull and enclosure studies",
    body: [
      "This is an ongoing self-directed project focused on learning how CFD and FEA can support design decisions before a part is manufactured. My goal is not only to produce visual plots, but to understand the assumptions, boundary conditions and mesh choices that determine whether a result is useful.",
      "For CFD, I am interested in applying the workflow to ROV hull drag, flow around external components and early propeller or duct comparisons. For FEA, likely applications include enclosure loading, brackets, frame members and other parts where stiffness and stress concentration matter.",
      "I plan to begin with simple cases that have known analytical or published results, then use those cases to check mesh sensitivity and solver settings. Once the workflow is repeatable, I can apply it to more complicated geometry from my marine projects.",
      "This section will continue to grow as I complete validated studies. I want future updates to show the full process - geometry preparation, assumptions, convergence checks, results and how those results changed the design.",
    ],
    stack: ["CFD", "FEA", "Engineering Analysis", "Simulation", "Design Validation"],
    year: "2026 - Present",
    status: "ongoing",
    cover: "",
    gallery: [],
    orbit: 520,
    size: 46,
    duration: 110,
    offset: 0.48,
    color: "radial-gradient(circle at 30% 30%, #d7ffe6, #369a62 45%, #0b3b23)",
    planet: "mercury",
  },
];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
