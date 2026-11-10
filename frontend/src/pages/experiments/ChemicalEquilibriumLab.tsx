import React, { useState } from 'react';
import { Flame, Snowflake, Droplet, CheckCircle2, RotateCcw, Sparkles, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function ChemicalEquilibriumLab() {
  const labData = EXPERIMENTS_DATA['equilibrium'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  // Equilibrium state: 0 = 100% pink [Co(H2O)6]2+, 100 = 100% blue [CoCl4]2-
  const [equilibriumPos, setEquilibriumPos] = useState<number>(45); // baseline purple/violet
  const [temperature, setTemperature] = useState<number>(25); // °C
  const [hasAgClPrecipitate, setHasAgClPrecipitate] = useState<boolean>(false);
  const [testedPerturbations, setTestedPerturbations] = useState<string[]>([]);
  const [lastActionDesc, setLastActionDesc] = useState<string>('System at room temperature equilibrium (violet mixture of pink and blue complexes).');

  const isDone = isLabCompleted('equilibrium');

  const recordPerturbation = (name: string, desc: string, newPos: number, newTemp?: number, precip?: boolean) => {
    setEquilibriumPos(newPos);
    if (newTemp !== undefined) setTemperature(newTemp);
    if (precip !== undefined) setHasAgClPrecipitate(precip);
    setLastActionDesc(desc);

    if (!testedPerturbations.includes(name)) {
      const next = [...testedPerturbations, name];
      setTestedPerturbations(next);
      if (next.length >= 3) {
        markLabCompleted('equilibrium');
      }
    }
  };

  const handleAddHCl = () => {
    recordPerturbation(
      'add_hcl',
      'Added concentrated HCl: Increased [Cl⁻] shifts equilibrium forward to blue [CoCl₄]²⁻.',
      Math.min(95, equilibriumPos + 35)
    );
  };

  const handleAddWater = () => {
    recordPerturbation(
      'add_water',
      'Added distilled H₂O: Dilution shifts equilibrium left to pink [Co(H₂O)₆]²⁺.',
      Math.max(5, equilibriumPos - 35),
      undefined,
      false
    );
  };

  const handleHeat = () => {
    recordPerturbation(
      'heat',
      'Heated to 80°C: Forward reaction is endothermic (ΔH > 0), so heating shifts equilibrium right to deep blue.',
      Math.min(95, equilibriumPos + 40),
      80
    );
  };

  const handleCool = () => {
    recordPerturbation(
      'cool',
      'Cooled in ice bath (0°C): Removal of heat shifts equilibrium in exothermic direction (left to pink).',
      Math.max(5, equilibriumPos - 40),
      0
    );
  };

  const handleAddAgNO3 = () => {
    recordPerturbation(
      'add_agno3',
      'Added AgNO₃: Ag⁺ precipitates Cl⁻ as insoluble AgCl(s), drastically lowering [Cl⁻] and shifting left to pink.',
      10,
      undefined,
      true
    );
  };

  const handleReset = () => {
    setEquilibriumPos(45);
    setTemperature(25);
    setHasAgClPrecipitate(false);
    setTestedPerturbations([]);
    setLastActionDesc('System reset to standard baseline.');
  };

  const handleQuickComplete = () => {
    setEquilibriumPos(85);
    setTemperature(80);
    setTestedPerturbations(['add_hcl', 'heat', 'add_water', 'cool']);
    markLabCompleted('equilibrium');
  };

  // Color interpolation between pink (#f472b6, rgb 244, 114, 182) and blue (#1d4ed8, rgb 29, 78, 216)
  const getSolutionColor = () => {
    const fraction = equilibriumPos / 100;
    const r = Math.round(244 * (1 - fraction) + 29 * fraction);
    const g = Math.round(114 * (1 - fraction) + 78 * fraction);
    const b = Math.round(182 * (1 - fraction) + 216 * fraction);
    return `rgba(${r}, ${g}, ${b}, 0.85)`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="equilibrium"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
                <span>Experiment #7</span>
                <span>•</span>
                <span>Chemical Equilibrium & Le Chatelier\'s Principle</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-teal-50/80 border border-teal-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-teal-600 flex-shrink-0" />
              <span className="text-teal-900 font-medium">
                Perturb the cobalt chloride complex equilibrium using HCl, H₂O, AgNO₃, and temperature changes to observe Le Chatelier color shifts.
              </span>
            </div>
          </div>
        </div>

        {/* Live Note */}
        <div className="p-4 rounded-xl mb-6 bg-slate-900 text-slate-100 border border-slate-700 text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🧪</span>
            <span className="font-medium">{lastActionDesc}</span>
          </div>
          <span className="text-xs font-mono font-bold text-teal-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
            {testedPerturbations.length}/3 Stresses Tested
          </span>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Equilibrium Flask and Temperature Bath */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Readout bar */}
            <div className="relative z-10 flex items-center justify-between bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">DOMINANT SPECIES:</span>
                <span className="text-xs font-mono font-extrabold text-teal-300">
                  {equilibriumPos < 40 ? '[Co(H₂O)₆]²⁺ (Pink Octahedral)' : equilibriumPos > 60 ? '[CoCl₄]²⁻ (Blue Tetrahedral)' : 'Dynamic Violet Mixture'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">BATH TEMP:</span>
                <span className="text-xs font-mono font-bold text-amber-300">{temperature}°C</span>
              </div>
            </div>

            {/* Center Graphical Apparatus */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <div className="relative w-80 h-[360px] flex flex-col items-center justify-end">
                {/* Water Bath Pan */}
                <div className="relative w-64 h-36 border-2 border-slate-400/60 rounded-b-2xl bg-slate-800/50 backdrop-blur-sm shadow-inner flex flex-col justify-end overflow-hidden">
                  {/* Bath Liquid (Steam or Ice cubes) */}
                  <div
                    className={`w-full transition-all duration-500 relative flex items-center justify-center ${
                      temperature > 50 ? 'bg-rose-500/20' : temperature < 10 ? 'bg-cyan-500/20' : 'bg-slate-500/20'
                    }`}
                    style={{ height: '60%' }}
                  >
                    {temperature > 50 && (
                      <div className="absolute top-1 text-[10px] font-mono text-rose-300 animate-pulse">
                        ♨ Boiling Water Bath (80°C)
                      </div>
                    )}
                    {temperature < 10 && (
                      <div className="absolute top-1 text-[10px] font-mono text-cyan-200 animate-pulse">
                        ❄ Ice Slurry Bath (0°C)
                      </div>
                    )}
                  </div>
                </div>

                {/* Central Borosilicate Reaction Flask standing in Bath */}
                <div className="absolute bottom-6 w-36 h-56 flex flex-col items-center z-20">
                  {/* Neck */}
                  <div className="w-10 h-14 border-x-2 border-white/60 bg-white/10 rounded-t backdrop-blur-sm"></div>

                  {/* Flask Body */}
                  <div
                    className="w-36 h-42 border-2 border-white/70 rounded-b-3xl relative overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-700"
                    style={{
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                      boxShadow: `0 0 30px ${getSolutionColor()}`
                    }}
                  >
                    {/* Chemical Solution */}
                    <div
                      className="absolute bottom-0 w-full transition-all duration-700 flex flex-col justify-end items-center"
                      style={{
                        height: '75%',
                        backgroundColor: getSolutionColor()
                      }}
                    >
                      {/* Precipitate white sediment if AgNO3 added */}
                      {hasAgClPrecipitate && (
                        <div className="w-full h-4 bg-white/90 rounded-b-3xl shadow border-t border-slate-300 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equilibrium Dynamic Slider / Indicator Bar */}
            <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
                <span className="text-pink-400 font-bold">100% [Co(H₂O)₆]²⁺ (Pink)</span>
                <span className="text-slate-400">EQUILIBRIUM POSITION</span>
                <span className="text-blue-400 font-bold">100% [CoCl₄]²⁻ (Blue)</span>
              </div>
              <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-blue-600 overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 bottom-0 w-3 bg-white border-2 border-slate-900 rounded-full shadow-md transition-all duration-500 transform -translate-x-1/2"
                  style={{ left: `${equilibriumPos}%` }}
                ></div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAddHCl}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow"
                >
                  + Conc. HCl (↑ Cl⁻)
                </button>
                <button
                  onClick={handleAddWater}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white transition-all shadow"
                >
                  + Distilled H₂O
                </button>
                <button
                  onClick={handleAddAgNO3}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-emerald-300 border border-slate-600 transition-all"
                >
                  + AgNO₃ (Precipitate Cl⁻)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleHeat}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1 shadow"
                >
                  <Flame size={13} /> Heat (80°C)
                </button>
                <button
                  onClick={handleCool}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1 shadow"
                >
                  <Snowflake size={13} /> Chill (0°C)
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Le Chatelier Rules & Test Log */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span>⚖️</span> Le Chatelier Equilibrium Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-pink-50/70 rounded-xl border border-pink-200 text-pink-950">
                  <div className="font-bold">Octahedral Complex: [Co(H₂O)₆]²⁺</div>
                  <div className="text-[11px] text-pink-700 mt-0.5">Color: Soft Pink • Favored by low T, adding H₂O, or removing Cl⁻</div>
                </div>
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-950">
                  <div className="font-bold">Tetrahedral Complex: [CoCl₄]²⁻</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">Color: Deep Royal Blue • Favored by heating (ΔH &gt; 0) or adding Cl⁻</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>📋</span> Stress Perturbations Tested
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'add_hcl', label: 'Addition of HCl', effect: 'Shifts Right (Turns Blue)' },
                  { id: 'add_water', label: 'Addition of Water', effect: 'Shifts Left (Turns Pink)' },
                  { id: 'heat', label: 'Heating in Hot Bath (80°C)', effect: 'Shifts Right (Endothermic, Blue)' },
                  { id: 'cool', label: 'Cooling in Ice Bath (0°C)', effect: 'Shifts Left (Exothermic, Pink)' },
                  { id: 'add_agno3', label: 'Precipitation with AgNO₃', effect: 'Removes Cl⁻ → Shifts Left (Pink)' }
                ].map(item => {
                  const done = testedPerturbations.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        done ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[11px]">{done ? item.effect : 'Pending'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Reaction Section Displayed Below Experiment Workbench */}
        <ReactionDisplay reaction={labData.reactionData} isCompleted={isDone} />
      </main>
    </div>
  );
}
