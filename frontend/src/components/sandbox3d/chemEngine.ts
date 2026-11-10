import { LiquidState, DetectedReaction3D } from './types3d';

// Chemical definitions available in the sandbox
export const REAGENTS_CATALOG: Record<string, {
  name: string;
  formula: string;
  molarity: number;
  color: string;
  type: 'acid' | 'base' | 'salt' | 'indicator' | 'water';
}> = {
  'HCl': { name: 'Hydrochloric Acid (0.1M)', formula: 'HCl', molarity: 0.1, color: '#f8fafc', type: 'acid' },
  'H2SO4': { name: 'Sulfuric Acid (0.1M)', formula: 'H₂SO₄', molarity: 0.1, color: '#f8fafc', type: 'acid' },
  'HNO3': { name: 'Nitric Acid (0.1M)', formula: 'HNO₃', molarity: 0.1, color: '#f8fafc', type: 'acid' },
  'NaOH': { name: 'Sodium Hydroxide (0.1M)', formula: 'NaOH', molarity: 0.1, color: '#f8fafc', type: 'base' },
  'KOH': { name: 'Potassium Hydroxide (0.1M)', formula: 'KOH', molarity: 0.1, color: '#f8fafc', type: 'base' },
  'NH4OH': { name: 'Ammonium Hydroxide (0.1M)', formula: 'NH₄OH', molarity: 0.1, color: '#f8fafc', type: 'base' },
  'CuSO4': { name: 'Copper(II) Sulfate (0.1M)', formula: 'CuSO₄', molarity: 0.1, color: '#38bdf8', type: 'salt' },
  'FeSO4': { name: 'Iron(II) Sulfate (0.1M)', formula: 'FeSO₄', molarity: 0.1, color: '#bbf7d0', type: 'salt' },
  'KMnO4': { name: 'Potassium Permanganate (0.02M)', formula: 'KMnO₄', molarity: 0.02, color: '#7e22ce', type: 'salt' },
  'AgNO3': { name: 'Silver Nitrate (0.1M)', formula: 'AgNO₃', molarity: 0.1, color: '#f1f5f9', type: 'salt' },
  'NaCl': { name: 'Sodium Chloride (0.1M)', formula: 'NaCl', molarity: 0.1, color: '#f8fafc', type: 'salt' },
  'KI': { name: 'Potassium Iodide (0.1M)', formula: 'KI', molarity: 0.1, color: '#fef9c3', type: 'salt' },
  'Pb_NO3_2': { name: 'Lead(II) Nitrate (0.1M)', formula: 'Pb(NO₃)₂', molarity: 0.1, color: '#f8fafc', type: 'salt' },
  'Phenolphthalein': { name: 'Phenolphthalein Indicator', formula: 'C₂₀H₁₄O₄', molarity: 0.01, color: '#ffffff', type: 'indicator' },
  'Water': { name: 'Distilled Water', formula: 'H₂O', molarity: 55.5, color: '#e0f2fe', type: 'water' },
};

/**
 * Mix liquid from source into destination liquid
 */
export function mixLiquids(
  dest: LiquidState,
  source: LiquidState,
  volumeToTransfer: number
): { newDest: LiquidState; newSource: LiquidState; reaction?: DetectedReaction3D } {
  const actualTransfer = Math.min(volumeToTransfer, source.volumeMl, dest.maxVolumeMl - dest.volumeMl);
  if (actualTransfer <= 0) {
    return { newDest: dest, newSource: source };
  }

  const transferFraction = actualTransfer / source.volumeMl;

  // New source state
  const updatedSourceSpecies: Record<string, number> = {};
  const transferredSpecies: Record<string, number> = {};

  Object.entries(source.species).forEach(([spec, moles]) => {
    const transferredMoles = moles * transferFraction;
    transferredSpecies[spec] = transferredMoles;
    updatedSourceSpecies[spec] = Math.max(0, moles - transferredMoles);
  });

  const newSource: LiquidState = {
    ...source,
    volumeMl: source.volumeMl - actualTransfer,
    species: updatedSourceSpecies
  };

  // Combine into dest species
  const combinedSpecies: Record<string, number> = { ...dest.species };
  Object.entries(transferredSpecies).forEach(([spec, moles]) => {
    combinedSpecies[spec] = (combinedSpecies[spec] || 0) + moles;
  });

  const combinedVolume = dest.volumeMl + actualTransfer;
  let reactionDetected: DetectedReaction3D | undefined = undefined;

  // Chemical reactions calculation
  // 1. Acid-Base Neutralization
  const molesH = (combinedSpecies['HCl'] || 0) + 2 * (combinedSpecies['H2SO4'] || 0) + (combinedSpecies['HNO3'] || 0);
  const molesOH = (combinedSpecies['NaOH'] || 0) + (combinedSpecies['KOH'] || 0) + (combinedSpecies['NH4OH'] || 0);

  let ph = 7.0;
  let tempRise = 0;

  if (molesH > 0 && molesOH > 0) {
    const neutralized = Math.min(molesH, molesOH);
    // Exothermic neutralization
    tempRise = (neutralized * 57300) / (combinedVolume * 4.184); // Delta T = q / (m*c)

    reactionDetected = {
      title: 'Acid-Base Neutralization',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      netIonic: 'H⁺(aq) + OH⁻(aq) → H₂O(l)',
      reactionType: 'Neutralization',
      enthalpy: 'ΔH° = -57.3 kJ/mol (Exothermic)',
      description: 'Proton transfer between hydronium and hydroxide ions yields water and an aqueous salt.',
      observation: `Thermal heat released (ΔT = +${tempRise.toFixed(1)}°C).`,
      timestamp: Date.now()
    };
  }

  if (molesH > molesOH) {
    const excessH = molesH - molesOH;
    const hConc = excessH / (combinedVolume / 1000);
    ph = Math.max(1.0, -Math.log10(hConc));
  } else if (molesOH > molesH) {
    const excessOH = molesOH - molesH;
    const ohConc = excessOH / (combinedVolume / 1000);
    ph = Math.min(13.5, 14.0 - (-Math.log10(ohConc)));
  } else {
    ph = 7.0;
  }

  // 2. Precipitation: AgNO3 + NaCl or HCl -> AgCl(s)
  let precipitate = dest.precipitate || source.precipitate;
  const molesAg = combinedSpecies['AgNO3'] || 0;
  const molesCl = (combinedSpecies['NaCl'] || 0) + (combinedSpecies['HCl'] || 0);

  if (molesAg > 0 && molesCl > 0 && !precipitate) {
    precipitate = {
      name: 'Silver Chloride',
      formula: 'AgCl(s)↓',
      color: '#ffffff',
      amountGrams: Math.min(molesAg, molesCl) * 143.32
    };
    reactionDetected = {
      title: 'Precipitation of Silver Chloride',
      equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
      netIonic: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓',
      reactionType: 'Precipitation (K_sp = 1.77 × 10⁻¹⁰)',
      description: 'Silver and chloride ions combine to form an insoluble curdy white precipitate.',
      observation: 'Instantaneous formation of a dense, white precipitate suspension.',
      timestamp: Date.now()
    };
  }

  // 3. Precipitation: Pb(NO3)2 + KI -> PbI2(s) (Golden Rain)
  const molesPb = combinedSpecies['Pb_NO3_2'] || 0;
  const molesI = combinedSpecies['KI'] || 0;

  if (molesPb > 0 && molesI > 0 && (!precipitate || precipitate.formula !== 'PbI₂(s)↓')) {
    precipitate = {
      name: 'Lead(II) Iodide',
      formula: 'PbI₂(s)↓',
      color: '#eab308',
      amountGrams: Math.min(molesPb, molesI / 2) * 461.01
    };
    reactionDetected = {
      title: 'Precipitation of Lead(II) Iodide (Golden Rain)',
      equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
      netIonic: 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)↓',
      reactionType: 'Precipitation (K_sp = 9.8 × 10⁻⁹)',
      description: 'Aqueous lead and iodide ions precipitate as sparkling golden-yellow crystals.',
      observation: 'Immediate formation of brilliant golden-yellow crystalline precipitate.',
      timestamp: Date.now()
    };
  }

  // 4. Precipitation: CuSO4 + NaOH -> Cu(OH)2(s)
  const molesCu = combinedSpecies['CuSO4'] || 0;
  if (molesCu > 0 && molesOH > 0 && (!precipitate || precipitate.formula !== 'Cu(OH)₂(s)↓')) {
    precipitate = {
      name: 'Copper(II) Hydroxide',
      formula: 'Cu(OH)₂(s)↓',
      color: '#38bdf8',
      amountGrams: Math.min(molesCu, molesOH / 2) * 97.56
    };
    reactionDetected = {
      title: 'Precipitation of Copper(II) Hydroxide',
      equation: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
      netIonic: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓',
      reactionType: 'Precipitation (K_sp = 2.2 × 10⁻²⁰)',
      description: 'Copper(II) and hydroxide ions produce a gelatinous light blue precipitate.',
      observation: 'Formation of sky-blue flocculent gel precipitate.',
      timestamp: Date.now()
    };
  }

  // 5. Redox: KMnO4 + FeSO4 in Acid -> Mn2+ + Fe3+
  const molesMnO4 = combinedSpecies['KMnO4'] || 0;
  const molesFe = combinedSpecies['FeSO4'] || 0;
  if (molesMnO4 > 0 && molesFe > 0 && molesH > 0) {
    reactionDetected = {
      title: 'Permanganate Redox Oxidation of Fe²⁺',
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      netIonic: 'MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O',
      reactionType: 'Redox (E°_cell = +0.74 V)',
      description: 'Deep purple permanganate ion is reduced to colorless Mn²⁺ by Fe²⁺ in acidic medium.',
      observation: 'Purple color decolorizes immediately upon contact with ferrous ions.',
      timestamp: Date.now()
    };
  }

  // Indicator color detection
  const hasPhenolphthalein = combinedSpecies['Phenolphthalein'] !== undefined || dest.indicator === 'phenolphthalein' || source.indicator === 'phenolphthalein';

  let liquidColor = '#e0f2fe'; // standard clear aqueous

  if (precipitate) {
    liquidColor = precipitate.color;
  } else if (hasPhenolphthalein && ph >= 8.2) {
    liquidColor = '#f472b6'; // vibrant pink indicator color
  } else if (combinedSpecies['CuSO4'] && combinedSpecies['CuSO4'] > 0.0001) {
    liquidColor = '#0284c7'; // deep copper blue
  } else if (combinedSpecies['KMnO4'] && combinedSpecies['KMnO4'] > 0.00005) {
    liquidColor = '#6b21a8'; // intense permanganate purple
  } else if (combinedSpecies['FeSO4'] && combinedSpecies['FeSO4'] > 0.0001) {
    liquidColor = '#86efac'; // pale green
  }

  const newDest: LiquidState = {
    ...dest,
    volumeMl: combinedVolume,
    color: liquidColor,
    ph: Number(ph.toFixed(2)),
    temperatureC: Number(Math.min(100, (dest.temperatureC + source.temperatureC) / 2 + tempRise).toFixed(1)),
    species: combinedSpecies,
    precipitate: precipitate,
    indicator: hasPhenolphthalein ? 'phenolphthalein' : dest.indicator
  };

  return { newDest, newSource, reaction: reactionDetected };
}

