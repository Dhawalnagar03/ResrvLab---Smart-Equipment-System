export interface Equipment {
  id: string;
  name: string;
  category: "Analytical" | "Imaging" | "Storage" | "Preparation";
  description: string;
  model: string;
  location: string;
  availability: "Available" | "In Use" | "Reserved" | "Maintenance";
  currentSession: {
    user: string;
    role: string;
    project: string;
    startTime: string;
    endTime: string;
  } | null;
  specs: {
    label: string;
    value: string;
  }[];
  qrCodeVal: string;
  safetyInstructions: string[];
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  user: string;
  role: string;
  project: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: "active" | "completed" | "cancelled";
}

export const initialEquipmentList: Equipment[] = [
  {
    id: "EQ-001",
    name: "Beckman Optima Max-XP Ultra-Centrifuge",
    category: "Preparation",
    description: "High-performance tabletop ultracentrifuge operating at up to 150,000 RPM. Designed for rapid separations of molecular samples including proteins, RNA/DNA, and subcellular fractions.",
    model: "Optima Max-XP",
    location: "Preparative Room, Bay-B",
    availability: "Available",
    currentSession: null,
    specs: [
      { label: "Max Speed", value: "150,000 RPM" },
      { label: "Max RCF", value: "1,019,000 x g" },
      { label: "Rotor Capacity", value: "4 x 7.0 mL" },
      { label: "Temp Range", value: "0°C to 40°C" }
    ],
    qrCodeVal: "resrvlab://EQ-001",
    safetyInstructions: [
      "Ensure the rotor is perfectly balanced before start.",
      "Always verify vacuum seal is intact.",
      "Do not exceed maximum rotor weight limits."
    ]
  },
  {
    id: "EQ-002",
    name: "Bruker Avance III 600 MHz NMR Spectrometer",
    category: "Analytical",
    description: "State-of-the-art multinuclear magnetic resonance spectrometer. Provides high-resolution structural determination of biomolecules, polymers, and complex chemical compounds.",
    model: "Avance III 600",
    location: "NMR Hall, Room 102",
    availability: "In Use",
    currentSession: {
      user: "Dr. Elena Vance",
      role: "Principal Investigator",
      project: "Neurotransmitter Structural Modeling",
      startTime: "18:00",
      endTime: "21:30"
    },
    specs: [
      { label: "Magnetic Field", value: "14.1 Tesla" },
      { label: "Proton Frequency", value: "600 MHz" },
      { label: "Probe Type", value: "5mm BBFO CryoProbe" },
      { label: "Autosampler", value: "24-slot SampleJet" }
    ],
    qrCodeVal: "resrvlab://EQ-002",
    safetyInstructions: [
      "Strictly no metallic items within the 5 Gauss line.",
      "Pacemaker wearers must not enter the room.",
      "Check helium and nitrogen levels before operating."
    ]
  },
  {
    id: "EQ-003",
    name: "Zeiss LSM 980 Confocal Microscope",
    category: "Imaging",
    description: "Super-resolution confocal laser scanning microscope for live-cell imaging, 3D optical sectioning, and multicolor fluorescence analysis with AiryScan 2 detector.",
    model: "LSM 980 with AiryScan",
    location: "Bio-Imaging Suite, Dark Room A",
    availability: "Reserved",
    currentSession: null,
    specs: [
      { label: "Laser Lines", value: "405, 488, 561, 639 nm" },
      { label: "Resolution limit", value: "90 nm (with Airyscan)" },
      { label: "Detectors", value: "32-channel GaAsP spectral" },
      { label: "Objectives", value: "10x, 20x, 40x Oil, 63x Oil" }
    ],
    qrCodeVal: "resrvlab://EQ-003",
    safetyInstructions: [
      "Verify live cell incubator chamber temperature before placing sample.",
      "Never turn laser modules ON without optical safety shield down.",
      "Clean oil objectives only with approved lens paper."
    ]
  },
  {
    id: "EQ-004",
    name: "Agilent 1290 Infinity II HPLC System",
    category: "Analytical",
    description: "High-throughput liquid chromatography system with quaternary pump and diode array detector, perfect for complex sample separations, chemical purity checks, and drug development analysis.",
    model: "Infinity II 1290",
    location: "Analytical Lab, Bench 4",
    availability: "Available",
    currentSession: null,
    specs: [
      { label: "Max Pressure", value: "1300 bar" },
      { label: "Flow Rate Range", value: "0.001 - 5.0 mL/min" },
      { label: "Sampler Capacity", value: "96-well plate (x2)" },
      { label: "Detector", value: "Diode Array (190-640 nm)" }
    ],
    qrCodeVal: "resrvlab://EQ-004",
    safetyInstructions: [
      "Check solvent reservoirs; never run the pump dry.",
      "Purge the columns thoroughly before running bio-fluids.",
      "Dispose of chemical waste in marked containment containers."
    ]
  },
  {
    id: "EQ-005",
    name: "Thermo CryoPlus 3 Liquid Nitrogen Storage Tank",
    category: "Storage",
    description: "Vapor-phase cryogenic storage system. Ideal for long-term cell lines cryo-preservation, primary tissue sample archives, and biological reagent banking at -196°C.",
    model: "CryoPlus 3",
    location: "Cryo-Storage Basement, Room 04",
    availability: "Available",
    currentSession: null,
    specs: [
      { label: "Liquid Capacity", value: "340 Liters" },
      { label: "Vial Capacity", value: "Up to 24,000 vials" },
      { label: "Controller", value: "Microprocessor-based Temp/Level" },
      { label: "Monitoring", value: "24/7 telemetry alert" }
    ],
    qrCodeVal: "resrvlab://EQ-005",
    safetyInstructions: [
      "Always wear cryogenic gloves and a full-face safety shield.",
      "Work in a well-ventilated space to avoid asphyxiation risk.",
      "Lock storage rack secure brackets after sample insertion."
    ]
  },
  {
    id: "EQ-006",
    name: "Eppendorf Mastercycler X50 PCR Thermal Cycler",
    category: "Preparation",
    description: "Ultrafast PCR machine featuring a silver gradient block for optimal amplification speed and temperature homogeneity. Programmed with modern touchscreen and smart alerts.",
    model: "Mastercycler X50s",
    location: "Genomics Wing, Bench 1",
    availability: "Maintenance",
    currentSession: null,
    specs: [
      { label: "Heating Rate", value: "10 °C/s" },
      { label: "Gradient Range", value: "1 °C to 30 °C" },
      { label: "Block compatibility", value: "96-well PCR plates / tubes" },
      { label: "Touchscreen", value: "10-inch high-res display" }
    ],
    qrCodeVal: "resrvlab://EQ-006",
    safetyInstructions: [
      "Do not touch silver block or heated lid while hot.",
      "Ensure sample caps are clicked tightly to avoid evaporation.",
      "Wipe condensation from gold pins periodically."
    ]
  }
];

export const initialBookings: Booking[] = [
  {
    id: "BK-101",
    equipmentId: "EQ-002",
    equipmentName: "Bruker Avance III 600 MHz NMR Spectrometer",
    user: "Dr. Elena Vance",
    role: "Principal Investigator",
    project: "Neurotransmitter Structural Modeling",
    date: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "21:30",
    status: "active"
  },
  {
    id: "BK-102",
    equipmentId: "EQ-003",
    equipmentName: "Zeiss LSM 980 Confocal Microscope",
    user: "Liam Carter",
    role: "PhD Researcher",
    project: "Mitochondrial Dynamics in Cancer Cells",
    date: new Date().toISOString().split("T")[0],
    startTime: "22:00",
    endTime: "23:59",
    status: "active"
  },
  {
    id: "BK-103",
    equipmentId: "EQ-001",
    equipmentName: "Beckman Optima Max-XP Ultra-Centrifuge",
    user: "Sarah Jenkins",
    role: "Research Assistant",
    project: "Exosome Fractionation Studies",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // yesterday
    startTime: "09:00",
    endTime: "12:00",
    status: "completed"
  },
  {
    id: "BK-104",
    equipmentId: "EQ-004",
    equipmentName: "Agilent 1290 Infinity II HPLC System",
    user: "Liam Carter",
    role: "PhD Researcher",
    project: "Assessing Polymer Degradation Rates",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // tomorrow
    startTime: "10:00",
    endTime: "13:30",
    status: "active"
  }
];
