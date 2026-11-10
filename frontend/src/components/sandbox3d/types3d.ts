export type EquipmentType =
  | 'beaker'
  | 'flask'
  | 'test_tube'
  | 'cylinder'
  | 'burette_stand'
  | 'bunsen_burner'
  | 'magnetic_stirrer'
  | 'ph_probe'
  | 'reagent_bottle'
  | 'tripod_stand'
  | 'wire_gauze'
  | 'evaporating_dish'
  | 'stirring_rod'
  | 'wash_bottle'
  | 'watch_glass'
  | 'test_tube_rack';

export interface ChemicalSpecies {
  id: string;
  name: string;
  formula: string;
  molarity: number; // M
  volumeMl: number; // mL
  color: string; // hex
  type: 'acid' | 'base' | 'salt' | 'indicator' | 'water';
}

export interface LiquidState {
  volumeMl: number;
  maxVolumeMl: number;
  color: string; // hex
  ph: number;
  temperatureC: number;
  species: Record<string, number>; // id -> moles
  precipitate?: {
    name: string;
    formula: string;
    color: string;
    amountGrams: number;
  };
  indicator?: 'phenolphthalein' | 'methyl_orange';
  isBoiling?: boolean;
}

export interface Item3DState {
  id: string;
  type: EquipmentType;
  name: string;
  label?: string;
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number]; // rx, ry, rz in radians
  scale: [number, number, number];
  liquid?: LiquidState;
  // Specific equipment properties
  isActive?: boolean; // burner flame on, stirrer spinning, burette dripping
  temperatureSetting?: number; // for burner or stirrer
  stirSpeedRpm?: number;
  chemicalBottleType?: string; // e.g. 'HCl', 'NaOH', 'CuSO4'
  // Stacking & Physical Relationships
  snappedToId?: string; // ID of item this item is sitting on (e.g. beaker on wire_gauze)
  supportHeight?: number; // Surface height for items placed on top of this
  isGauzeGlowing?: boolean; // Wire gauze glowing hot from burner beneath
  tiltAngle?: number; // Tilt angle in degrees for pouring
}

export interface DetectedReaction3D {
  title: string;
  equation: string;
  netIonic?: string;
  reactionType: string;
  enthalpy?: string;
  description: string;
  observation: string;
  timestamp: number;
}
