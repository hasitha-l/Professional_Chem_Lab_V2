import { ExperimentInfo } from '../types/lab';

export const EXPERIMENTS_DATA: Record<string, ExperimentInfo> = {
  'titration': {
    id: 'titration',
    title: 'Acid-Base Titration',
    shortTitle: 'Acid-Base Titration',
    desc: 'Standardization of 0.100 M HCl solution using 0.100 M NaOH with phenolphthalein indicator',
    category: 'Analytical Chemistry',
    difficulty: 'Beginner',
    duration: '15 mins',
    iconName: 'Droplet',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    reactionData: {
      title: 'Neutralization of Hydrochloric Acid by Sodium Hydroxide',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      netIonic: 'H⁺(aq) + OH⁻(aq) → H₂O(l)',
      reactionType: 'Strong Acid - Strong Base Neutralization (Arrhenius / Brønsted-Lowry)',
      enthalpy: 'ΔH° = -57.3 kJ/mol (Exothermic)',
      thermodynamics: 'Spontaneous (ΔG° < 0, driven by large negative enthalpy of water formation)',
      description: 'During titration, aqueous hydronium ions from hydrochloric acid are systematically neutralized by hydroxide ions from sodium hydroxide. At the equivalence point (pH 7.00), stoichiometric amounts of acid and base have reacted to form neutral sodium chloride and water. Phenolphthalein transitions from colorless to a faint, persistent pastel pink (pH 8.2–10.0), marking the experimental endpoint.',
      keyTakeaway: 'The stoichiometric equivalence point occurs at V(NaOH) = 25.00 mL. At this precise volume, moles of H⁺ equal moles of OH⁻, yielding a standardized HCl molarity of exactly 0.1000 M.',
      stepsExplanation: [
        {
          step: 'Initial Acid Solution (V = 0 mL NaOH)',
          observation: 'Clear, colorless solution with pH 1.00',
          chemicalReason: 'Complete dissociation of 0.100 M strong acid: [H⁺] = 0.100 M, pH = -log(0.100) = 1.00.'
        },
        {
          step: 'Pre-Equivalence Buffer/Depletion (0 < V < 24.5 mL)',
          observation: 'Slow, steady rise in pH from 1.00 to 2.80; drops create momentary pink swirls that rapidly vanish upon stirring',
          chemicalReason: 'Excess H⁺ remains unneutralized; local pockets of high OH⁻ temporarily trigger phenolphthalein deprotonation, but rapid mixing neutralizes it.'
        },
        {
          step: 'Equivalence Point (V = 25.00 mL NaOH)',
          observation: 'Sudden steep pH jump through 7.00 to 8.20+; entire solution turns faint persistent light pink for > 30 seconds',
          chemicalReason: 'Equimolar neutralization: n(HCl) = n(NaOH). The indicator converts from colorless lactone form to pink quinoid dianion (In²⁻).'
        },
        {
          step: 'Post-Equivalence (V > 25.5 mL)',
          observation: 'Solution turns vibrant dark magenta/purple; pH plateaus above 12.0',
          chemicalReason: 'Excess unreacted OH⁻ dominates the solution: [OH⁻] = (V_excess * M_base) / V_total.'
        }
      ],
      stoichiometry: [
        { label: 'Standard Acid Volume (HCl)', value: '25.00', unit: 'mL' },
        { label: 'Titrant Concentration (NaOH)', value: '0.1000', unit: 'M' },
        { label: 'Equivalence Volume V_eq', value: '25.00', unit: 'mL' },
        { label: 'Moles of NaOH Delivered', value: '2.50 × 10⁻³', unit: 'mol' },
        { label: 'Calculated Molarity of HCl', value: '0.1000', unit: 'M' },
        { label: 'Indicator Color Transition', value: 'Colorless → Faint Pink (pH 8.2 - 10.0)' }
      ]
    }
  },

  'flame-test': {
    id: 'flame-test',
    title: 'Flame Tests & Atomic Emission',
    shortTitle: 'Flame Tests',
    desc: 'Identification of metal cations by characteristic electronic excitation and atomic emission spectra',
    category: 'Inorganic Chemistry & Spectroscopy',
    difficulty: 'Beginner',
    duration: '12 mins',
    iconName: 'Flame',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    reactionData: {
      title: 'Thermal Dissociation, Electronic Excitation & Atomic Emission',
      equation: 'M⁺(s) + e⁻ + Heat (Δ) → M*(g) → M(g) + hν (Photon Emission)',
      netIonic: 'Na*(3p¹) → Na(3s¹) + hν (λ = 589 nm), Cu²⁺ + 2e⁻ + Δ → Cu* → Cu + hν (λ = 510 nm)',
      reactionType: 'Atomic Optical Emission Spectroscopy (Thermal Electronic Transition)',
      thermodynamics: 'Non-equilibrium photoemission: E_photon = h·c / λ = ΔE_orbitals',
      description: 'When metal salts are introduced into the high-temperature non-luminous zone of a Bunsen flame (~1500°C), thermal energy atomizes and vaporizes the ions into gaseous atoms. Valence electrons absorb discrete quanta of energy and are promoted to higher unoccupied atomic orbitals. Upon returning to lower electronic ground states, the relaxation releases discrete photons with wavelengths corresponding exactly to the quantum energy gap (ΔE = hc/λ), producing identifiable signature flame colors and spectral lines.',
      keyTakeaway: 'Flame colors are element-specific fingerprint transitions. For example, Sodium emits doublet D-lines at 589.0 nm and 589.6 nm, while Copper produces vivid emerald green/cyan emissions from transitions between 3d and 4s/4p manifolds.',
      stepsExplanation: [
        {
          step: 'Hydrochloric Acid Cleaning & Loop Burn-off',
          observation: 'Nichrome loop glows faint red without coloring the blue burner flame',
          chemicalReason: 'Concentrated HCl converts surface metal contaminants into volatile metal chlorides that boil off cleanly.'
        },
        {
          step: 'Sodium Ion Test (Na⁺ in NaCl)',
          observation: 'Intense blinding golden-yellow flame with prominent yellow spectral line at 589 nm',
          chemicalReason: 'The 3p → 3s electronic transition in neutral sodium atoms emits high-intensity yellow photons.'
        },
        {
          step: 'Copper Ion Test (Cu²⁺ in CuCl₂)',
          observation: 'Luminous emerald blue-green flame with cyan and green spectral lines at 510–535 nm',
          chemicalReason: 'Excitations in gaseous Cu(I) and CuCl molecular bands radiate in the 500–550 nm optical window.'
        },
        {
          step: 'Strontium Ion Test (Sr²⁺ in SrCl₂)',
          observation: 'Brilliant deep crimson-scarlet flame with prominent red lines at 650–680 nm',
          chemicalReason: 'Electronic transitions in strontium atoms and SrOH radicals emit strongly in the long-wavelength red spectrum.'
        },
        {
          step: 'Potassium Ion Test (K⁺ in KCl)',
          observation: 'Delicate pale lilac/violet flame observable at 766 nm (viewed with cobalt glass to filter trace Na)',
          chemicalReason: 'Potassium 4p → 4s orbital transitions emit at 766.5 nm and 769.9 nm (near-infrared/deep violet edge).'
        },
        {
          step: 'Barium Ion Test (Ba²⁺ in BaCl₂)',
          observation: 'Characteristic pale apple/lime green flame at 553 nm',
          chemicalReason: 'Barium monoxide (BaO) and excited barium atoms produce visible green spectral emission bands.'
        }
      ],
      stoichiometry: [
        { label: 'Sodium (Na) Primary Emission', value: '589.0', unit: 'nm', explanation: 'Golden Yellow (3p → 3s)' },
        { label: 'Copper (Cu) Primary Emission', value: '510.5', unit: 'nm', explanation: 'Emerald Blue-Green' },
        { label: 'Strontium (Sr) Primary Emission', value: '650.4', unit: 'nm', explanation: 'Deep Crimson Red' },
        { label: 'Potassium (K) Primary Emission', value: '766.5', unit: 'nm', explanation: 'Lilac / Violet' },
        { label: 'Barium (Ba) Primary Emission', value: '553.6', unit: 'nm', explanation: 'Apple Green' },
        { label: 'Planck Constant (h)', value: '6.626 × 10⁻³⁴', unit: 'J·s' }
      ]
    }
  },

  'redox': {
    id: 'redox',
    title: 'Redox Titration (Permanganometry)',
    shortTitle: 'Redox Titration',
    desc: 'Quantitative determination of Iron(II) using standardized Potassium Permanganate (KMnO₄) in acidic medium',
    category: 'Analytical & Redox Chemistry',
    difficulty: 'Intermediate',
    duration: '18 mins',
    iconName: 'FlaskConical',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    reactionData: {
      title: 'Permanganate Oxidation of Ferrous Ions in Acidic Medium',
      equation: '2KMnO₄(aq) + 10FeSO₄(aq) + 8H₂SO₄(aq) → 2MnSO₄(aq) + 5Fe₂(SO₄)₃(aq) + K₂SO₄(aq) + 8H₂O(l)',
      netIonic: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      reactionType: 'Oxidation-Reduction (Self-Indicating Permanganometric Titration)',
      enthalpy: 'E°_cell = +0.74 V (ΔG° = -nFE° = -357 kJ/mol, Highly Spontaneous)',
      thermodynamics: 'Strongly favorable with large equilibrium constant K_eq > 10⁶⁰',
      description: 'Potassium permanganate acts as both an exceptionally strong oxidizing agent (Mn in +7 oxidation state) and its own internal indicator. In an acidic solution (provided by H₂SO₄), deep purple MnO₄⁻ oxidizes pale green Fe²⁺ to yellow-orange Fe³⁺ while being reduced to essentially colorless Mn²⁺ (+2 state). As long as Fe²⁺ is present, the purple color instantaneously disappears upon mixing. The moment the last trace of Fe²⁺ is oxidized, a single extra drop of 0.0200 M KMnO₄ imparts a permanent faint pink color to the flask, signaling the equivalence endpoint.',
      keyTakeaway: 'The stoichiometric ratio is 1 mol MnO₄⁻ : 5 mol Fe²⁺. Determining the exact volume of KMnO₄ consumed allows direct determination of the Fe²⁺ content in the analyte with high precision.',
      stepsExplanation: [
        {
          step: 'Acidification of Fe²⁺ Analyte',
          observation: 'Clear pale-green FeSO₄ solution mixed with dilute H₂SO₄',
          chemicalReason: 'Sufficient H⁺ is mandatory to ensure reduction proceeds completely to Mn²⁺ rather than brown MnO₂ solid (which occurs in neutral/basic conditions).'
        },
        {
          step: 'Titrant Addition (V < 25.0 mL KMnO₄)',
          observation: 'Deep purple KMnO₄ drops fall from the burette but decolorize instantly upon contact with the swirling liquid',
          chemicalReason: 'Rapid electron transfer: MnO₄⁻ is reduced to colorless Mn²⁺ while Fe²⁺ is oxidized to Fe³⁺.'
        },
        {
          step: 'Endpoint Detection (V = 25.00 mL KMnO₄)',
          observation: 'A single excess drop imparts a faint, persistent pastel pink tint lasting over 30 seconds',
          chemicalReason: 'All Fe²⁺ has been consumed. The unreduced MnO₄⁻ ion possesses an extremely high molar absorptivity (ε ~ 2400 M⁻¹cm⁻¹), making even 10⁻⁵ M unreacted permanganate visibly pink.'
        }
      ],
      stoichiometry: [
        { label: 'Reduction Half-Reaction', value: 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O (E° = +1.51 V)' },
        { label: 'Oxidation Half-Reaction', value: 'Fe²⁺ → Fe³⁺ + e⁻ (E° = -0.77 V)' },
        { label: 'Overall Cell Potential (E°)', value: '+0.74', unit: 'V' },
        { label: 'Stoichiometric Ratio (MnO₄⁻ : Fe²⁺)', value: '1 : 5' },
        { label: 'KMnO₄ Molarity', value: '0.0200', unit: 'M' },
        { label: 'Endpoint Volume V(KMnO₄)', value: '25.00', unit: 'mL' },
        { label: 'Moles of Fe²⁺ Determined', value: '2.50 × 10⁻³', unit: 'mol' }
      ]
    }
  },

  'precipitation': {
    id: 'precipitation',
    title: 'Precipitation Reactions & Solubility',
    shortTitle: 'Precipitation Reactions',
    desc: 'Investigation of aqueous double-replacement reactions, solubility rules, and precipitate formation',
    category: 'Inorganic & Solution Chemistry',
    difficulty: 'Beginner',
    duration: '15 mins',
    iconName: 'TestTube2',
    color: 'bg-green-50 text-green-600 border-green-200',
    reactionData: {
      title: 'Aqueous Double-Replacement Precipitation Reactions',
      equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
      netIonic: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓ [Curdy White Precipitate]',
      reactionType: 'Precipitation / Double Displacement (Metathesis)',
      enthalpy: 'ΔH° = -65.7 kJ/mol; K_sp(AgCl) = 1.77 × 10⁻¹⁰',
      thermodynamics: 'Driven by lattice energy formation of insoluble ionic crystal surpassing hydration enthalpies',
      description: 'When two aqueous electrolyte solutions are mixed, mutual electrostatic attraction between specific cation-anion pairs can overcome solvent stabilization. When the ion product Q exceeds the solubility product constant K_sp, rapid nucleation occurs, producing an insoluble solid suspension (precipitate). Spectator ions remain fully dissociated in the aqueous supernatant.',
      keyTakeaway: 'Precipitation follows universal solubility rules: all nitrates (NO₃⁻) and alkali metal salts are soluble, while silver halides (AgCl, AgBr, AgI) and lead halides (PbI₂) possess tiny K_sp values and precipitate instantaneously.',
      stepsExplanation: [
        {
          step: 'Reaction 1: Silver Nitrate + Sodium Chloride',
          observation: 'Instantaneous formation of thick curdy white precipitate AgCl(s) that darkens in light',
          chemicalReason: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓; K_sp = 1.77 × 10⁻¹⁰.'
        },
        {
          step: 'Reaction 2: Lead(II) Nitrate + Potassium Iodide',
          observation: 'Immediate formation of brilliant golden-yellow crystalline precipitate PbI₂(s) (Golden Rain)',
          chemicalReason: 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)↓; K_sp = 9.8 × 10⁻⁹.'
        },
        {
          step: 'Reaction 3: Copper(II) Sulfate + Sodium Hydroxide',
          observation: 'Formation of gelatinous light sky-blue precipitate Cu(OH)₂(s)',
          chemicalReason: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓; K_sp = 2.2 × 10⁻²⁰.'
        },
        {
          step: 'Reaction 4: Iron(III) Chloride + Sodium Hydroxide',
          observation: 'Formation of dense reddish-brown rust-colored flocculent precipitate Fe(OH)₃(s)',
          chemicalReason: 'Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)↓; K_sp = 2.8 × 10⁻³⁹.'
        }
      ],
      stoichiometry: [
        { label: 'AgCl Solubility Product K_sp', value: '1.77 × 10⁻¹⁰', explanation: 'White precipitate' },
        { label: 'PbI₂ Solubility Product K_sp', value: '9.80 × 10⁻⁹', explanation: 'Golden yellow' },
        { label: 'Cu(OH)₂ Solubility Product K_sp', value: '2.20 × 10⁻²⁰', explanation: 'Sky blue gelatinous' },
        { label: 'Fe(OH)₃ Solubility Product K_sp', value: '2.79 × 10⁻³⁹', explanation: 'Reddish brown flocculent' }
      ]
    }
  },

  'electro': {
    id: 'electro',
    title: 'Electrochemistry (Daniell Galvanic Cell)',
    shortTitle: 'Galvanic Cell',
    desc: 'Construction of a Zn-Cu galvanic cell to generate electrical voltage via spontaneous redox electron transfer',
    category: 'Physical & Electrochemistry',
    difficulty: 'Intermediate',
    duration: '20 mins',
    iconName: 'Zap',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    reactionData: {
      title: 'Spontaneous Chemical-to-Electrical Energy Conversion in the Daniell Cell',
      equation: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)',
      netIonic: 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
      reactionType: 'Electrochemical Galvanic (Voltaic) Cell Redox Reaction',
      enthalpy: 'E°_cell = +1.100 V | ΔG° = -nFE° = -212.3 kJ/mol',
      thermodynamics: 'Highly spontaneous; electrons flow through external circuit from lower reduction potential (Zn) to higher (Cu)',
      description: 'The classic Daniell cell physically separates the oxidation and reduction half-reactions into two half-cells connected by an external circuit and an internal salt bridge. At the zinc anode, metallic zinc is oxidized, releasing electrons that travel through external wires to the voltmeter. At the copper cathode, aqueous Cu²⁺ ions receive these electrons and deposit as copper metal. The KNO₃ salt bridge maintains electrical neutrality by migrating K⁺ ions into the copper cathode and NO₃⁻ ions into the zinc anode.',
      keyTakeaway: 'The standard electromotive force (EMF) is E°_cell = E°_cathode - E°_anode = +0.34 V - (-0.76 V) = +1.10 V. The live cell voltage obeys the Nernst Equation: E = 1.10 V - (0.0592 / 2) · log([Zn²⁺] / [Cu²⁺]).',
      stepsExplanation: [
        {
          step: 'Half-Cell Setup (Zinc Anode & Copper Cathode)',
          observation: 'Zinc strip immersed in 1.0 M ZnSO₄; Copper strip immersed in deep blue 1.0 M CuSO₄',
          chemicalReason: 'Establishes standard states (1.0 M activities) for both redox couples.'
        },
        {
          step: 'Insertion of KNO₃ Salt Bridge',
          observation: 'Voltmeter circuit completes, instantly reading 1.10 V; current begins flowing',
          chemicalReason: 'Closes the internal ionic circuit, preventing charge accumulation that would otherwise halt electron flow in microseconds.'
        },
        {
          step: 'Electron & Ion Migration',
          observation: 'Continuous stable reading of 1.10 V; slow brightening of copper strip and dissolution of zinc strip',
          chemicalReason: 'Continuous oxidation of Zn(s) → Zn²⁺ + 2e⁻ and simultaneous reduction of Cu²⁺ + 2e⁻ → Cu(s).'
        },
        {
          step: 'Concentration Perturbation (Nernst Effect)',
          observation: 'Decreasing [Zn²⁺] or increasing [Cu²⁺] increases cell voltage above 1.10 V; reversing it lowers voltage',
          chemicalReason: 'Governed by Nernst equation: E = E° - (RT/nF)ln(Q). Decreasing the reaction quotient Q = [Zn²⁺]/[Cu²⁺] shifts thermodynamics forward.'
        }
      ],
      stoichiometry: [
        { label: 'Anode Oxidation Half-Reaction', value: 'Zn(s) → Zn²⁺(aq) + 2e⁻ (E° = +0.763 V)' },
        { label: 'Cathode Reduction Half-Reaction', value: 'Cu²⁺(aq) + 2e⁻ → Cu(s) (E° = +0.337 V)' },
        { label: 'Standard Cell Potential E°_cell', value: '+1.100', unit: 'V' },
        { label: 'Faraday Constant (F)', value: '96485', unit: 'C/mol e⁻' },
        { label: 'Electrons Transferred (n)', value: '2', unit: 'mol e⁻' },
        { label: 'Standard Gibbs Free Energy ΔG°', value: '-212.3', unit: 'kJ/mol' }
      ]
    }
  },

  'kinetics': {
    id: 'kinetics',
    title: 'Chemical Kinetics & Iodine Clock',
    shortTitle: 'Chemical Kinetics',
    desc: 'Determination of reaction rate laws, order of reaction, and activation energy using the persulfate-iodide clock reaction',
    category: 'Physical Chemistry',
    difficulty: 'Intermediate',
    duration: '20 mins',
    iconName: 'Beaker',
    color: 'bg-red-50 text-red-600 border-red-200',
    reactionData: {
      title: 'Persulfate-Iodide Clock Reaction with Starch Indicator',
      equation: 'S₂O₈²⁻(aq) + 2I⁻(aq) → 2SO₄²⁻(aq) + I₂(aq) [Rate-Determining Slow Step]',
      netIonic: 'I₂(aq) + 2S₂O₃²⁻(aq) → 2I⁻(aq) + S₄O₆²⁻(aq) [Instantaneous Fast Clock Scavenging]',
      reactionType: 'Chemical Kinetics / Coupled Consecutive Redox Clock Reaction',
      thermodynamics: 'Rate Law: Rate = k · [S₂O₈²⁻]¹ · [I⁻]¹ (Second order overall)',
      description: 'The iodine clock reaction couples a slow, rate-determining reaction (oxidation of iodide by persulfate) with an ultra-fast sacrificial scavenging reaction (reduction of generated iodine back to iodide by thiosulfate). While thiosulfate ions remain in solution, free molecular iodine cannot accumulate. The instant the fixed aliquot of thiosulfate is fully consumed, uninhibited free iodine coordinates with the starch indicator, triggering a dramatic, instantaneous color switch from crystal clear to dark midnight blue-black.',
      keyTakeaway: 'The time delay Δt until the color transition is inversely proportional to the initial reaction rate (Rate ∝ 1/Δt). Doubling [S₂O₈²⁻] or [I⁻] doubles the rate, confirming first-order kinetics with respect to both reactants.',
      stepsExplanation: [
        {
          step: 'Mixture Preparation',
          observation: 'Colorless solutions of KI, starch, and Na₂S₂O₃ are mixed with K₂S₂O₈; timer starts',
          chemicalReason: 'Persulfate begins oxidizing iodide to generate I₂ at a steady rate governed by k[S₂O₈²⁻][I⁻].'
        },
        {
          step: 'Induction / Clock Period (t = 0 to t_endpoint)',
          observation: 'Solution remains completely transparent and clear despite continuous reaction',
          chemicalReason: 'Any I₂ generated is instantaneously scavenged by S₂O₃²⁻ via: I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻.'
        },
        {
          step: 'Sudden Blue-Black Color Switch (t = t_endpoint)',
          observation: 'Entire solution turns deep midnight blue-black in less than 0.2 seconds',
          chemicalReason: 'All thiosulfate is exhausted. Free I₂ accumulates and coordinates inside the amylose helical core of starch to form the intense blue triiodide-amylose complex.'
        },
        {
          step: 'Temperature & Catalyst Dependence',
          observation: 'Heating increases reaction rate (shorter delay); Fe²⁺ acts as a catalyst slashing delay time',
          chemicalReason: 'Follows Arrhenius equation: k = A·e^(-Ea/RT). Temperature increases molecular collisions exceeding Ea; Fe²⁺ provides an alternate multi-step redox pathway with lower Ea.'
        }
      ],
      stoichiometry: [
        { label: 'Overall Reaction Order', value: '2nd Order', explanation: '1st order in S₂O₈²⁻, 1st order in I⁻' },
        { label: 'Rate Law Equation', value: 'Rate = k [S₂O₈²⁻] [I⁻]' },
        { label: 'Rate Constant k at 25°C', value: '1.25 × 10⁻²', unit: 'M⁻¹s⁻¹' },
        { label: 'Activation Energy (Ea)', value: '52.4', unit: 'kJ/mol' },
        { label: 'Complex Formed', value: '[I₃⁻ · Amylose]', explanation: 'Intense midnight blue-black' }
      ]
    }
  },

  'equilibrium': {
    id: 'equilibrium',
    title: 'Chemical Equilibrium & Le Chatelier',
    shortTitle: 'Chemical Equilibrium',
    desc: 'Dynamic equilibrium shifts in the cobalt(II) chloro-complex system under concentration and thermal perturbations',
    category: 'Inorganic & Physical Chemistry',
    difficulty: 'Intermediate',
    duration: '15 mins',
    iconName: 'FlaskConical',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    reactionData: {
      title: 'Cobalt(II) Hexaaqua / Tetrachloro Complex Equilibrium',
      equation: '[Co(H₂O)₆]²⁺(aq) [Pink] + 4Cl⁻(aq) + Heat ⇌ [CoCl₄]²⁻(aq) [Deep Blue] + 6H₂O(l)',
      netIonic: '[Co(H₂O)₆]²⁺ (Octahedral, Pink) + 4Cl⁻ ⇌ [CoCl₄]²⁻ (Tetrahedral, Blue) + 6H₂O',
      reactionType: 'Coordination Complex Reversible Equilibrium (Ligand Substitution)',
      enthalpy: 'ΔH° = +50.0 kJ/mol (Endothermic in forward direction)',
      thermodynamics: 'At equilibrium, rates of forward and reverse ligand substitutions are equal (ΔG = 0)',
      description: 'The cobalt(II) system features two distinct coordination geometries with contrasting spectroscopic properties: octahedral [Co(H₂O)₆]²⁺ is soft pastel pink (symmetry-forbidden d-d transitions), whereas tetrahedral [CoCl₄]²⁻ is an intense royal blue (lack of inversion center allows intense dipole-allowed d-d transitions). Perturbing the system by changing chloride ion concentration, water content, temperature, or precipitating chloride allows direct visual verification of Le Chatelier\'s Principle.',
      keyTakeaway: 'Le Chatelier\'s Principle predicts: adding Cl⁻ or heating shifts equilibrium towards blue [CoCl₄]²⁻ (consuming added reactant and absorbing thermal energy). Adding H₂O or cooling shifts equilibrium towards pink [Co(H₂O)₆]²⁺.',
      stepsExplanation: [
        {
          step: 'Reference State',
          observation: 'Solution exhibits a violet/purple blend of both pink and blue species at room temperature',
          chemicalReason: 'Equilibrium quotient Q equals the equilibrium constant K_c; both species coexist.'
        },
        {
          step: 'Stress 1: Addition of Concentrated HCl (↑ [Cl⁻])',
          observation: 'Solution rapidly shifts to intense royal blue',
          chemicalReason: 'Q = [[CoCl₄]²⁻]/([[Co(H₂O)₆]²⁺][Cl⁻]⁴) < K_c. The system responds by shifting right to consume excess chloride.'
        },
        {
          step: 'Stress 2: Addition of Distilled Water (↑ [H₂O])',
          observation: 'Solution shifts back to soft rose-pink',
          chemicalReason: 'Dilution shifts equilibrium to the left side with fewer dissolved solute particles (5 species on left vs 7 on right).'
        },
        {
          step: 'Stress 3: Heating in Hot Water Bath (80°C)',
          observation: 'Solution turns brilliant deep royal blue upon warming',
          chemicalReason: 'The forward reaction is endothermic (ΔH > 0). According to Van \'t Hoff equation, increasing T increases K_c, driving conversion to blue tetrahedral [CoCl₄]²⁻.'
        },
        {
          step: 'Stress 4: Cooling in Ice Bath (0°C)',
          observation: 'Solution turns vivid pastel pink upon chilling',
          chemicalReason: 'Decreasing temperature favors the exothermic reverse direction, reforming pink octahedral [Co(H₂O)₆]²⁺.'
        },
        {
          step: 'Stress 5: Addition of AgNO₃',
          observation: 'White AgCl precipitate forms, and remaining solution turns completely pink',
          chemicalReason: 'Ag⁺ precipitates Cl⁻ as AgCl(s), drastically dropping [Cl⁻]. Equilibrium shifts left to regenerate Cl⁻.'
        }
      ],
      stoichiometry: [
        { label: 'Octahedral Species', value: '[Co(H₂O)₆]²⁺', explanation: 'Pink, coordination number 6' },
        { label: 'Tetrahedral Species', value: '[CoCl₄]²⁻', explanation: 'Deep Blue, coordination number 4' },
        { label: 'Reaction Enthalpy ΔH°', value: '+50.0', unit: 'kJ/mol', explanation: 'Endothermic forward' },
        { label: 'Equilibrium Constant Expression', value: 'Kc = [[CoCl₄]²⁻] / ([[Co(H₂O)₆]²⁺] · [Cl⁻]⁴)' }
      ]
    }
  },

  'calorimetry': {
    id: 'calorimetry',
    title: 'Calorimetry & Neutralization Heat',
    shortTitle: 'Calorimetry',
    desc: 'Measurement of the enthalpy of neutralization (ΔH_neut) using a coffee-cup solution calorimeter',
    category: 'Thermodynamics & Physical Chemistry',
    difficulty: 'Intermediate',
    duration: '16 mins',
    iconName: 'Flame',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    reactionData: {
      title: 'Thermochemical Enthalpy of Neutralization in Solution Calorimetry',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + Heat (q_rxn)',
      netIonic: 'H⁺(aq) + OH⁻(aq) → H₂O(l) [ΔH°_neut = -57.3 kJ/mol]',
      reactionType: 'Solution Calorimetry / Exothermic Neutralization',
      enthalpy: 'ΔH°_neut = -57.1 kJ/mol (Exothermic, heat released to surroundings)',
      thermodynamics: 'ΔH_rxn = -q_calorimeter / n_limiting = -(m · c_p · ΔT + C_cal · ΔT) / n',
      description: 'A constant-pressure Styrofoam cup calorimeter provides an adiabatic boundary for measuring enthalpy changes in aqueous reactions. When 50.0 mL of 1.00 M HCl and 50.0 mL of 1.00 M NaOH are mixed, the proton transfer reaction releases bond-formation enthalpy, heating the aqueous solution. By logging temperature over time from initial baseline T_initial = 22.0°C to peak T_final = 28.7°C (ΔT = +6.7°C), the total heat released q is computed and normalized per mole of water formed.',
      keyTakeaway: 'The experimental enthalpy of neutralization is ΔH_neut = -56.5 kJ/mol, within 1.5% of the theoretical literature value of -57.32 kJ/mol for strong acid-strong base neutralization in water.',
      stepsExplanation: [
        {
          step: 'Initial Thermal Equilibrating',
          observation: '50.0 mL HCl and 50.0 mL NaOH both stabilized at exactly 22.0°C',
          chemicalReason: 'Ensures zero initial heat exchange prior to chemical reaction mixing.'
        },
        {
          step: 'Mixing & Calorimeter Sealing',
          observation: 'Solutions combined inside insulated vessel; lid closed and motorized stirrer started',
          chemicalReason: 'Rapid mixing ensures instantaneous reaction while minimizing ambient heat loss through convection.'
        },
        {
          step: 'Exothermic Temperature Rise (0 to 60 seconds)',
          observation: 'Digital thermometer records rapid temperature rise from 22.0°C up to maximum 28.7°C (ΔT = +6.7°C)',
          chemicalReason: 'Formation of O-H covalent bonds in liquid water releases 57.3 kJ/mol of energy into the 100.0 g solution.'
        },
        {
          step: 'Enthalpy Calculation',
          observation: 'Calculated heat q = m·c·ΔT = 100 g · 4.184 J/g°C · 6.7°C = 2803 J; ΔH = -2803 J / 0.050 mol = -56.1 kJ/mol',
          chemicalReason: 'q_reaction = -q_solution; since reaction was performed at constant atmospheric pressure, ΔH = q_p.'
        }
      ],
      stoichiometry: [
        { label: 'Volume of 1.00 M HCl', value: '50.0', unit: 'mL' },
        { label: 'Volume of 1.00 M NaOH', value: '50.0', unit: 'mL' },
        { label: 'Total Mass of Solution (m)', value: '100.0', unit: 'g' },
        { label: 'Specific Heat Capacity (c_p)', value: '4.184', unit: 'J/(g·°C)' },
        { label: 'Observed Temperature Rise (ΔT)', value: '+6.70', unit: '°C' },
        { label: 'Total Heat Released (q_rxn)', value: '2.803', unit: 'kJ' },
        { label: 'Moles of Water Formed (n)', value: '0.0500', unit: 'mol' },
        { label: 'Experimental ΔH_neut', value: '-56.06', unit: 'kJ/mol' },
        { label: 'Literature Value ΔH°_neut', value: '-57.32', unit: 'kJ/mol' }
      ]
    }
  },

  'gas-laws': {
    id: 'gas-laws',
    title: 'Gas Laws & Kinetic Theory',
    shortTitle: 'Gas Laws',
    desc: 'Verification of Boyle\'s Law (P-V), Charles\'s Law (V-T), and the Ideal Gas Equation of State',
    category: 'Physical Chemistry & Thermodynamics',
    difficulty: 'Beginner',
    duration: '14 mins',
    iconName: 'Beaker',
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    reactionData: {
      title: 'Ideal Gas Law & Kinetic Molecular Theory of Gases',
      equation: 'P · V = n · R · T (Ideal Gas Equation of State)',
      netIonic: 'Boyle: P₁V₁ = P₂V₂ (T const) | Charles: V₁/T₁ = V₂/T₂ (P const) | Gay-Lussac: P₁/T₁ = P₂/T₂ (V const)',
      reactionType: 'Thermodynamic Gas Phase Physical Transformation',
      thermodynamics: 'Kinetic Theory: P = (1/3)·(N·m·v_rms² / V); Root-mean-square speed v_rms = √(3RT/M)',
      description: 'Gaseous macroscopic properties (Pressure, Volume, Temperature, and Molar quantity) arise directly from the continuous, random elastic collisions of gas molecules against vessel walls. Under Boyle\'s Law (isothermal conditions), compressing the piston halves the volume, doubling molecular collision frequency and thus doubling measured pressure. Under Charles\'s Law (isobaric conditions), heating accelerates molecular velocities, forcing the piston outward to maintain constant pressure.',
      keyTakeaway: 'The Ideal Gas Constant R = 0.08206 L·atm/(mol·K) = 8.314 J/(mol·K) accurately unifies all empirical gas laws. Real gases approach ideal behavior at low pressures and high temperatures.',
      stepsExplanation: [
        {
          step: 'Boyle\'s Law Verification (Constant T = 298 K, n = 0.10 mol)',
          observation: 'Decreasing cylinder volume from 4.0 L to 2.0 L causes pressure gauge to climb from 0.61 atm to 1.22 atm',
          chemicalReason: 'P ∝ 1/V. Halving container volume doubles particle collision frequency per unit area of the cylinder wall.'
        },
        {
          step: 'Charles\'s Law Verification (Constant P = 1.00 atm, n = 0.10 mol)',
          observation: 'Heating gas from 200 K to 400 K expands the piston from 1.64 L to 3.28 L',
          chemicalReason: 'V ∝ T. Thermal energy increases root-mean-square velocity v_rms; to keep pressure constant against external atmospheric force, the volume must expand proportionally.'
        },
        {
          step: 'Gay-Lussac\'s Law Verification (Constant V = 2.45 L)',
          observation: 'Heating gas causes pressure gauge needle to swing upward linearly with absolute temperature',
          chemicalReason: 'P ∝ T. Increased molecular kinetic energy imparts greater momentum per collision to the rigid walls.'
        }
      ],
      stoichiometry: [
        { label: 'Ideal Gas Constant (R)', value: '0.08206', unit: 'L·atm/(mol·K)' },
        { label: 'Gas Constant SI (R)', value: '8.314', unit: 'J/(mol·K)' },
        { label: 'Standard Molar Volume at STP', value: '22.414', unit: 'L/mol' },
        { label: 'Boyle\'s Product (P · V)', value: 'Constant (at fixed T, n)' },
        { label: 'Charles\'s Ratio (V / T)', value: 'Constant (at fixed P, n)' }
      ]
    }
  },

  'organic': {
    id: 'organic',
    title: 'Organic Synthesis of Aspirin',
    shortTitle: 'Aspirin Synthesis',
    desc: 'Esterification of salicylic acid with acetic anhydride using acid catalysis, crystallization, and FeCl₃ purity testing',
    category: 'Organic Chemistry & Synthesis',
    difficulty: 'Advanced',
    duration: '22 mins',
    iconName: 'TestTube2',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    reactionData: {
      title: 'Nucleophilic Acyl Substitution: Synthesis of Acetylsalicylic Acid (Aspirin)',
      equation: 'C₇H₆O₃ (Salicylic Acid) + C₄H₆O₃ (Acetic Anhydride) → C₉H₈O₄ (Aspirin) + CH₃COOH (Acetic Acid)',
      netIonic: 'Ar-OH (Phenol) + (CH₃CO)₂O ─[H₂SO₄ / 85°C]→ Ar-OCOCH₃ (Ester) + CH₃COOH',
      reactionType: 'Esterification / Acid-Catalyzed Nucleophilic Acyl Substitution',
      enthalpy: 'Exothermic; High atom economy (75.0% incorporated into target molecule)',
      thermodynamics: 'Driven by protonation of carbonyl oxygen and loss of acetate leaving group',
      description: 'The synthesis of acetylsalicylic acid converts the potentially stomach-irritating phenolic hydroxyl (-OH) group of salicylic acid into an acetyl ester. Concentrated sulfuric acid protonates the carbonyl oxygen of acetic anhydride, activating it toward nucleophilic attack by the phenolic hydroxyl oxygen. Following proton transfers and expulsion of acetic acid, crude aspirin is formed. Addition of cold water hydrolyzes unreacted acetic anhydride, and chilling in an ice bath precipitates sparkling white needles of acetylsalicylic acid. Purity is validated using iron(III) chloride.',
      keyTakeaway: 'Pure aspirin yields a negative ferric chloride test (retains yellow reagent color), whereas unreacted salicylic acid contains a free phenolic -OH group that forms an intense violet [Fe(salicylate)₆]³⁻ complex.',
      stepsExplanation: [
        {
          step: 'Stage 1: Reflux Reaction Setup',
          observation: '2.0 g salicylic acid + 5.0 mL acetic anhydride + 5 drops H₂SO₄ heated at 85°C for 15 minutes',
          chemicalReason: 'Acid catalyst H⁺ protonates carbonyl oxygen of acetic anhydride; phenolic oxygen attacks to form tetrahedral intermediate.'
        },
        {
          step: 'Stage 2: Quenching & Ice Crystallization',
          observation: 'Addition of 20 mL chilled deionized water in an ice bath causes dense white crystalline needles to precipitate out',
          chemicalReason: 'Water hydrolyzes excess acetic anhydride into water-soluble acetic acid. Aspirin has low solubility in cold water (K_sp low at 0°C), triggering rapid crystallization.'
        },
        {
          step: 'Stage 3: Vacuum Filtration (Büchner Funnel)',
          observation: 'Slurry poured into Büchner funnel under aspirator vacuum; sparkling pure white aspirin cake collected on filter paper',
          chemicalReason: 'Removes mother liquor containing acetic acid, sulfuric acid, and soluble impurities.'
        },
        {
          step: 'Stage 4: Iron(III) Chloride Purity Assay',
          observation: 'Control Salicylic Acid + FeCl₃ turns intense dark purple; Synthesized Aspirin + FeCl₃ remains pale yellow',
          chemicalReason: 'Ferric ions coordinate with free phenolic -OH groups to form intense purple [Fe(salicylate)₆]³⁻ complex (λ_max = 530 nm). Pure aspirin has its phenolic group esterified, giving a negative (yellow) test.'
        }
      ],
      stoichiometry: [
        { label: 'Salicylic Acid Molar Mass (C₇H₆O₃)', value: '138.12', unit: 'g/mol' },
        { label: 'Acetic Anhydride Molar Mass (C₄H₆O₃)', value: '102.09', unit: 'g/mol' },
        { label: 'Aspirin Product Molar Mass (C₉H₈O₄)', value: '180.16', unit: 'g/mol' },
        { label: 'Starting Mass of Salicylic Acid', value: '2.00', unit: 'g' },
        { label: 'Theoretical Yield of Aspirin', value: '2.61', unit: 'g' },
        { label: 'Actual Recovered Dry Mass', value: '2.28', unit: 'g' },
        { label: 'Experimental Percent Yield', value: '87.4', unit: '%' },
        { label: 'Melting Point of Pure Aspirin', value: '135 - 136', unit: '°C' }
      ]
    }
  }
};

