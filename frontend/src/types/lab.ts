export interface StoichiometryItem {
  label: string;
  value: string;
  unit?: string;
  explanation?: string;
}

export interface StepExplanation {
  step: string;
  observation: string;
  chemicalReason: string;
}

export interface ReactionData {
  title: string;
  equation: string;
  netIonic?: string;
  reactionType: string;
  thermodynamics?: string;
  enthalpy?: string;
  description: string;
  keyTakeaway: string;
  stepsExplanation: StepExplanation[];
  stoichiometry: StoichiometryItem[];
  spectralLines?: Array<{ element: string; wavelength: string; color: string; intensity: string }>;
  mechanismSteps?: string[];
}

export interface ExperimentInfo {
  id: string;
  title: string;
  shortTitle: string;
  desc: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  iconName: string;
  color: string;
  reactionData: ReactionData;
}

