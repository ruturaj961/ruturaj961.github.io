/*
  PROJECTS: each block is one card on the home page AND one detail page
  (opened at #/project/<slug>). Cards appear in the order listed here.

  Required
    slug        URL id: lowercase, hyphens, unique. e.g. "baja-suspension"
    title       Heading on the card and the detail page
    year        e.g. "2025"
    summary     One or two sentences, shown on the card and as the page intro

  Optional (leave out or leave empty and that part of the page is hidden)
    tags        Short labels: ["Robotics", "MATLAB"]
    thumbnail   Card image, e.g. "assets/thumbs/baja.jpg" (landscape, ~1600x1000)
    results     Big numbers on the detail page: [{ value: "-21%", label: "unsprung mass" }]
    specs       Fact table: [{ label: "Role", value: "Team Captain" }]
    overview    Paragraphs: ["First paragraph.", "Second paragraph."]
    highlights  Bullet list: ["Did X", "Did Y"]
    video       A YouTube link; it is embedded on the page
    gallery     Images: [{ src: "assets/projects/baja-1.jpg", caption: "Front upright" }]
    links       Reports, code, CAD, anything: [{ label: "Report", url: "https://..." }]
                Google Drive file links get an inline "Preview" on the page.
                The Drive file must be shared as "Anyone with the link".
*/
const PROJECTS = [
  {
    slug: "mems-gyroscope",
    title: "MEMS Gyroscope: Design and Fabrication",
    year: "2026",
    summary:
      "Design and fabrication process for a micro-electromechanical gyroscope.",
    tags: ["MEMS", "Microfabrication"],
    thumbnail: "",
    specs: [
      { label: "Context", value: "Graduate coursework, University of Pennsylvania" },
    ],
    links: [
      { label: "Project report", url: "https://drive.google.com/file/d/1X6a9RtgsIh0kMIWKhZoAZesFhh3U7ev1/view" },
    ],
  },
  {
    slug: "feedback-control",
    title: "Feedback Control Design Portfolio",
    year: "2026",
    summary:
      "Feedback control design and analysis work from MEAM 513 at Penn.",
    tags: ["Controls", "Feedback Design"],
    thumbnail: "",
    specs: [
      { label: "Course", value: "MEAM 513, Feedback Control Design and Analysis" },
      { label: "Institution", value: "University of Pennsylvania" },
    ],
    links: [
      { label: "Controls portfolio", url: "https://drive.google.com/file/d/10wHglUNUq6pDAcCbMB_rnP10CslHPPEr/view" },
    ],
  },
  {
    slug: "franka-motion-planning",
    title: "Motion Planning for a 7-DoF Franka Emika Arm",
    year: "2025",
    summary:
      "Motion planning and optimization for a 7-DoF Franka Emika robot using forward and inverse kinematics.",
    tags: ["Robotics", "Kinematics", "Motion Planning"],
    thumbnail: "",
    specs: [
      { label: "Course", value: "MEAM 5200, University of Pennsylvania" },
      { label: "Robot", value: "Franka Emika, 7 degrees of freedom" },
    ],
    highlights: [
      "Forward and inverse kinematics for a 7-DoF serial arm",
      "Motion planning and trajectory optimization",
    ],
    links: [
      { label: "Project report", url: "https://drive.google.com/file/d/1rmEPKfaHDwdS65dEFsrMC7bLP67wfMkI/view" },
      { label: "Presentation", url: "https://drive.google.com/file/d/1dpiDfToDDLmsn9rVivN3TT1QDJQbH3ht/view" },
    ],
  },
  {
    slug: "autonomous-battle-bot",
    title: "Autonomous Battle Bot",
    year: "2025",
    summary:
      "ESP32-based battle bot with a PID-controlled differential drive, switchable between autonomous and Wi-Fi control.",
    tags: ["Mechatronics", "Embedded", "PID"],
    thumbnail: "",
    specs: [
      { label: "Course", value: "MEAM 5100, Mechatronics, University of Pennsylvania" },
      { label: "Controller", value: "ESP32" },
    ],
    highlights: [
      "PID-controlled differential drive",
      "Autonomous mode plus manual control over Wi-Fi",
    ],
    links: [
      { label: "Project report", url: "https://drive.google.com/file/d/1k8_crZ3kYpvNaiGe9R7IoaqrKgv6-1O9/view" },
    ],
  },
  {
    slug: "baja-suspension-steering",
    title: "Baja SAE: Suspension and Steering for a 4WD ATV",
    year: "2023",
    summary:
      "A reworked suspension, steering and hub design that made a chain-driven 4WD layout possible on Team Redshift Racing's all-terrain vehicle.",
    tags: ["Vehicle Dynamics", "Suspension", "Topology Optimization"],
    thumbnail: "",
    results: [
      { value: "-21%", label: "unsprung mass" },
      { value: "1.9 m", label: "turning radius" },
      { value: "-11%", label: "upright and hub mass" },
    ],
    specs: [
      { label: "Role", value: "Vehicle Dynamics Head and System Integration" },
      { label: "Team", value: "Team Redshift Racing, Baja SAE India" },
      { label: "Tools", value: "Altair Inspire (topology optimization)" },
    ],
    overview: [
      "Overhauled the suspension of a 4WD all-terrain vehicle, cutting unsprung mass enough to move from a propeller-shaft drivetrain to a chain-driven 4WD layout.",
      "Redesigned the steering around an integrated rack to hit the targeted 1.9 m turning radius, and used topology optimization to take weight out of the uprights and wheel hubs.",
    ],
    links: [
      { label: "Suspension, steering and brakes", url: "https://drive.google.com/file/d/1ZD8xwgl7bakWYey-UrEVs6VBGNn1T4H8/view" },
      { label: "Overall vehicle subsystem design", url: "https://drive.google.com/file/d/104aWaHlYz-9LLmP_z1fAzBrCt2iayMLO/view" },
      { label: "System integration and vehicle overview", url: "https://drive.google.com/file/d/1_hU0gwnCKGoraXDUZrr9utSRIiwyFTtE/view" },
    ],
  },
  {
    slug: "baja-cost-reduction",
    title: "Baja SAE: Cutting Prototype Cost by 55%",
    year: "2023",
    summary:
      "As captain of a 45-person team, cut prototype cost by more than half while the team finished in the top 2 of 196.",
    tags: ["Manufacturing", "Cost Engineering", "Leadership"],
    thumbnail: "",
    results: [
      { value: "-55%", label: "prototype cost" },
      { value: "Top 2", label: "of 196 teams" },
      { value: "45", label: "team members led" },
      { value: "8", label: "industry sponsors" },
    ],
    specs: [
      { label: "Role", value: "Team Captain" },
      { label: "Team", value: "Team Redshift Racing, Baja SAE India" },
      { label: "Period", value: "2020 to 2023" },
    ],
    overview: [
      "Brought prototype cost down by 55% through lean manufacturing, just-in-time inventory, make-or-buy decisions and a redesign of the vehicle architecture.",
      "Secured funding from 8 industry partners by pitching to their management, which expanded the team's budget for the season and for future R&D.",
    ],
    links: [
      { label: "Cost reduction report", url: "https://drive.google.com/file/d/1-ffdTlt9fuetsBFHxp9OPNNf_NFEnPQe/view" },
      { label: "Achievements", url: "https://drive.google.com/file/d/1a0Ge4Kug70B27hwEF1CQmnfaDuJbjqHp/view" },
    ],
  },
  {
    slug: "functionally-graded-beams",
    title: "Stress Analysis of Functionally Graded Beams",
    year: "2022",
    summary:
      "Analytical Euler-Bernoulli models of functionally graded beams, validated against ANSYS FEA. Published in IJIRSET.",
    tags: ["FEA", "ANSYS", "Publication"],
    thumbnail: "",
    results: [
      { value: "<3%", label: "deviation from FEA" },
      { value: "-20%", label: "tip deflection" },
    ],
    specs: [
      { label: "Role", value: "Research Assistant" },
      { label: "Institution", value: "K.J. Somaiya College of Engineering, University of Mumbai" },
      { label: "Tools", value: "ANSYS Workbench" },
      { label: "Published", value: "IJIRSET, 2022" },
    ],
    overview: [
      "Modeled functionally graded beams with linear, quadratic and exponential modulus variation using Euler-Bernoulli beam theory.",
      "Validated the analytical models against FEA under point and distributed loads, with less than 3% deviation. The graded designs gave a 20% drop in tip deflection and a smoother displacement profile.",
    ],
    links: [
      { label: "Published paper", url: "https://www.ijirset.com/doi:10.15680/IJIRSET.2022.1112060" },
    ],
  },
];
