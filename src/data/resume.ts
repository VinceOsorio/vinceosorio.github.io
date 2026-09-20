export type Role = { title: string; period: string; bullets: string[] };
export type Experience = { org: string; location?: string; period?: string; roles: Role[] };

export const experience: Experience[] = [
  {
    org: "BC Hydro",
    location: "Vancouver, British Columbia",
    period: "May 2026 - August 2026",
    roles: [
      {
        title: "Mechanical Engineering Co-op Student - Site C Clean Energy Project",
        period: "May 2026 - August 2026",
        bullets: [
          "Maintained and reviewed the Master Contractor Drawing List, tracking approximately 2,000 contractor drawings and revisions.",
          "Used Excel and Power Query to process more than 20,000 rows from 10+ engineering data sources, reducing recurring work from about four hours to under one hour.",
          "Reviewed and organized more than 500 technical drawings in Bluebeam Revu and coordinated documentation with four technical teams and contractor groups.",
        ],
      },
    ],
  },
  {
    org: "Modern Niagara",
    location: "Vancouver, British Columbia",
    period: "May 2025 - December 2025",
    roles: [
      {
        title: "Mechanical Engineering Student Project Coordinator - New St. Paul's Hospital",
        period: "May 2025 - December 2025",
        bullets: [
          "Supported QA inspections using information from more than 1,000 mechanical, electrical and architectural drawings.",
          "Assisted commissioning inspections for over 500 HVAC assets, including reheat coils, VAVs and air-handling units, with Bluerithm documentation.",
          "Led coordination of 50+ scanning and coring activities, submitted 27 RFIs and supported seismic inspections across 10 floors.",
          "Created technical markups for plumbing, HVAC, fire protection and floor/ceiling plans and used Excel for reporting and forecasting.",
        ],
      },
    ],
  },
  {
    org: "Plan Group",
    location: "Vancouver, British Columbia",
    period: "September 2024 - December 2024",
    roles: [
      {
        title: "Student Project Coordinator, Electrical/Mechanical - New St. Paul's Hospital",
        period: "September 2024 - December 2024",
        bullets: [
          "Maintained approximately 15 document-control logs covering change notices, shop drawings, RFIs, closeout documents and invoicing support.",
          "Assisted with material estimates and delivery coordination for about five work packages per week and updated 100+ drawings and specifications.",
          "Helped onboard more than 500 employees, processing approximately 30-50 workers per week during busy periods.",
        ],
      },
    ],
  },
  {
    org: "Zen Maker Lab",
    location: "North Vancouver, British Columbia",
    period: "May 2023 - August 2024",
    roles: [
      {
        title: "Project Developer, Summer Camp Instructor and Workshop Manager",
        period: "May 2023 - August 2024",
        bullets: [
          "Developed, repaired and built mechanical and electrical projects ranging from electronic pianos to programmable robots.",
          "Prepared lesson plans and reports for other instructors and taught full-day engineering camps to children ages 5-12.",
          "Used handheld power tools, tabletop equipment and prototyping electronics while managing workshop activities and documentation.",
        ],
      },
    ],
  },
];

export const studentTeams: Experience[] = [
  {
    org: "UBC Subbots",
    location: "University of British Columbia",
    period: "September 2024 - Present",
    roles: [
      {
        title: "Mechanical Projects Lead",
        period: "May 2026 - Present",
        bullets: [
          "Lead mechanical projects for autonomous underwater vehicles and supporting test equipment.",
          "Review CAD, drawings, materials and calculations while organizing design reviews, testing and documentation.",
          "Mentor members in SolidWorks, prototyping, machining, assembly, waterproofing and the engineering design process.",
        ],
      },
      {
        title: "Mechanical Team Member",
        period: "September 2024 - April 2026",
        bullets: [
          "Supported frame and enclosure research and development for MATE ROV and RoboSub vehicles.",
          "Rapid-prototyped components using 3D printers, hand tools, mills, lathes and other shop equipment.",
        ],
      },
    ],
  },
];

export const education = [
  {
    school: "University of British Columbia",
    detail:
      "Bachelor of Applied Science - Mechanical Engineering, Naval Architecture and Marine Engineering Option",
    period: "Expected April 2028",
  },
  {
    school: "Capilano University",
    detail: "Engineering Transition Certificate",
    period: "April 2023",
  },
];

export const skills = [
  {
    group: "Design and Engineering Software",
    items: [
      "SOLIDWORKS",
      "Fusion 360",
      "AutoCAD",
      "Onshape",
      "Bluebeam Revu",
      "Revizto",
      "Bluerithm",
      "PM4+",
    ],
  },
  {
    group: "Data Analysis and Programming",
    items: [
      "MATLAB",
      "Python",
      "C",
      "Microsoft Excel",
      "Power Query",
      "Statistical analysis",
      "Engineering data visualization",
    ],
  },
  {
    group: "Prototyping and Testing",
    items: [
      "Arduino",
      "Sensor integration",
      "Data acquisition",
      "IMU and force-sensor testing",
      "Electrical circuit prototyping",
      "Mechanical troubleshooting",
    ],
  },
  {
    group: "Manufacturing and Fabrication",
    items: [
      "SLA/FDM 3D printing",
      "Laser cutting",
      "Waterjet cutting",
      "Machining",
      "MIG welding",
      "Technical drafting",
      "Powered and manual hand tools",
    ],
  },
  {
    group: "Engineering and Project Techniques",
    items: [
      "Mechanical design",
      "Design reviews",
      "QA/QC inspections",
      "Technical drawing review",
      "Document control",
      "Deficiency tracking",
      "Multidisciplinary coordination",
    ],
  },
];

export const awards = [
  "Ike Barber Scholarship - 2023",
  "Dean's List - 2022",
  "BC Achievement Scholarship - 2022",
];
export const interests = [
  "Personal engineering projects",
  "Boxing",
  "Running",
  "Marine and underwater technology",
];
