import type { ChallengeConfig, DomainEntity } from '../types';
import { validateThresholds, deriveStatus } from '../services/ai';

export const challengeConfig: ChallengeConfig = {
  appName: "AquaClean Sentinel",
  problemStatement: "Waste management system for sea eco life.",
  domain: "Marine Ecosystem Protection & Oceanic Debris Management",
  primaryMetricLabel: "Marine Waste Density",
  metricUnit: "kg/km²",
  metricPolarity: "higher-is-worse",
  warningThreshold: 45,
  criticalThreshold: 85,
  showSDG: true,
  sdgAlignment: "SDG 14: Life Below Water & SDG 12: Responsible Consumption"
};

// Enforce threshold safety check upon initialization
validateThresholds(challengeConfig);

const rawChallengeEntities: Omit<DomainEntity, 'status'>[] = [
  {
    id: "mar-01",
    label: "Great Barrier Reef Sector Alpha",
    primaryMetric: 92,
    historicalData: [
      { time: "06:00", value: 58 },
      { time: "08:00", value: 65 },
      { time: "10:00", value: 74 },
      { time: "12:00", value: 81 },
      { time: "14:00", value: 88 },
      { time: "16:00", value: 92 }
    ],
    fallbackSummary: "Marine waste density has reached 92 kg/km² across Sector Alpha, directly exposing coral reefs and juvenile green sea turtles to severe polymer pollution. Hydrodynamic ocean modeling indicates localized current gyres are concentrating non-biodegradable debris.",
    fallbackAction: "Deploy autonomous skimmer vessels and surface interceptor booms immediately to isolate floating debris before coastal tide shift."
  },
  {
    id: "mar-02",
    label: "North Pacific Sanctuary Zone 4",
    primaryMetric: 54,
    historicalData: [
      { time: "06:00", value: 38 },
      { time: "08:00", value: 42 },
      { time: "10:00", value: 46 },
      { time: "12:00", value: 50 },
      { time: "14:00", value: 52 },
      { time: "16:00", value: 54 }
    ],
    fallbackSummary: "Floating marine debris levels stand at 54 kg/km², crossing the warning threshold and escalating entanglement risks for migratory humpback whales. Surface currents continue transporting macro-plastic fragments from offshore shipping lanes.",
    fallbackAction: "Dispatch eco-recovery ocean tenders to remove abandoned fishing nets and survey surrounding cetacean migration paths."
  },
  {
    id: "mar-03",
    label: "Coral Triangle Estuary Nursery",
    primaryMetric: 28,
    historicalData: [
      { time: "06:00", value: 35 },
      { time: "08:00", value: 32 },
      { time: "10:00", value: 30 },
      { time: "12:00", value: 29 },
      { time: "14:00", value: 28 },
      { time: "16:00", value: 28 }
    ],
    fallbackSummary: "Estuary mangrove waste concentration has stabilized at a nominal 28 kg/km² following river mouth barrier installation. Benthic seagrass coverage and juvenile reef fish population health display positive biological indicators.",
    fallbackAction: "Maintain automated river trash interceptor grates and continue bi-weekly microplastic water quality sampling."
  },
  {
    id: "mar-04",
    label: "Galapagos Marine Reserve North",
    primaryMetric: 89,
    historicalData: [
      { time: "06:00", value: 62 },
      { time: "08:00", value: 71 },
      { time: "10:00", value: 78 },
      { time: "12:00", value: 84 },
      { time: "14:00", value: 87 },
      { time: "16:00", value: 89 }
    ],
    fallbackSummary: "Critical plastic waste density of 89 kg/km² detected near marine iguana and sea lion feeding habitats due to equatorial drift. Ingestion hazard indices for endemic fauna have reached peak critical warning levels.",
    fallbackAction: "Activate rapid emergency cleanup taskforce and restrict coastal motorized vessel access near protected feeding zones."
  },
  {
    id: "mar-05",
    label: "Sargasso Sea Pelagic Habitat",
    primaryMetric: 41,
    historicalData: [
      { time: "06:00", value: 48 },
      { time: "08:00", value: 45 },
      { time: "10:00", value: 44 },
      { time: "12:00", value: 43 },
      { time: "14:00", value: 42 },
      { time: "16:00", value: 41 }
    ],
    fallbackSummary: "Debris concentration within Sargassum weed mats has reduced to 41 kg/km², showing steady improvement following offshore collection efforts. Particle counts remain elevated but lie safely below immediate bio-accumulation limits.",
    fallbackAction: "Deploy satellite drogues to track pelagic weed drift and schedule targeted filtration sweeps next week."
  }
];

const rawDemoEntities: Omit<DomainEntity, 'status'>[] = [
  {
    id: "demo-01",
    label: "Bermuda Deepwater Pelagic Trench",
    primaryMetric: 96,
    historicalData: [
      { time: "06:00", value: 70 },
      { time: "08:00", value: 79 },
      { time: "10:00", value: 85 },
      { time: "12:00", value: 90 },
      { time: "14:00", value: 94 },
      { time: "16:00", value: 96 }
    ],
    fallbackSummary: "Severe ocean waste accumulation of 96 kg/km² recorded near deepwater trench dropoffs. Sinking polymer micro-particles threaten abyssal seafloor benthic organisms and deep-diving sperm whale feeding zones.",
    fallbackAction: "Deploy autonomous deep-submergence collection units and establish surface containment barriers."
  },
  {
    id: "demo-02",
    label: "Mediterranean Turtle Nesting Sanctuary",
    primaryMetric: 61,
    historicalData: [
      { time: "06:00", value: 42 },
      { time: "08:00", value: 48 },
      { time: "10:00", value: 52 },
      { time: "12:00", value: 57 },
      { time: "14:00", value: 60 },
      { time: "16:00", value: 61 }
    ],
    fallbackSummary: "Coastal nesting sanctuary debris metric reached 61 kg/km², driven by seasonal shoreline runoff and uncollected plastic litter. Loggerhead hatchlings encounter physical obstruction hazards during seaward movement.",
    fallbackAction: "Mobilize coastal eco-response teams to clear nesting beaches and install floating runoff catchments."
  },
  {
    id: "demo-03",
    label: "Kailua Coastal Mangrove Lagoon",
    primaryMetric: 22,
    historicalData: [
      { time: "06:00", value: 26 },
      { time: "08:00", value: 25 },
      { time: "10:00", value: 24 },
      { time: "12:00", value: 23 },
      { time: "14:00", value: 22 },
      { time: "16:00", value: 22 }
    ],
    fallbackSummary: "Lagoon waste levels remain nominal at 22 kg/km² following continuous solar river interceptor operation. Water clarity and nursery fish fry survival remain at optimal environmental baselines.",
    fallbackAction: "Maintain automated sensor network monitoring and clean solar interceptor debris baskets weekly."
  }
];

// Enforce deriveStatus across all challenge & demo entities dynamically
export const challengeEntities: DomainEntity[] = rawChallengeEntities.map(e => ({
  ...e,
  status: deriveStatus(e.primaryMetric, challengeConfig)
}));

export const demoEntities: DomainEntity[] = rawDemoEntities.map(e => ({
  ...e,
  status: deriveStatus(e.primaryMetric, challengeConfig)
}));
