import React, { useState } from 'react';
import { Flame, Snowflake, Filter, Sparkles, CheckCircle2, RotateCcw, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function OrganicSynthesisLab() {
  const labData = EXPERIMENTS_DATA['organic'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  // Synthesis Stages: 1: Reflux, 2: Crystallization, 3: Filtration, 4: Purity Test
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [refluxBoiling, setRefluxBoiling] = useState<boolean>(false);
  const [crystalsFormed, setCrystalsFormed] = useState<boolean>(false);
  const [vacuumFiltered, setVacuumFiltered] = useState<boolean>(false);
  const [purityTested, setPurityTested] = useState<boolean>(false);

  const isDone = isLabCompleted('organic');

  const handleRunReflux = () => {
    setRefluxBoiling(true);
    setTimeout(() => {
      setRefluxBoiling(false);
      setCurrentStage(2);
    }, 2000);
  };

  const handleCrystallize = () => {
    setCrystalsFormed(true);
    setTimeout(() => {
      setCurrentStage(3);
    }, 1500);
  };

  const handleFilter = () => {
    setVacuumFiltered(true);
    setTimeout(() => {
      setCurrentStage(4);
    }, 1500);
  };

  const handleTestPurity = () => {
    setPurityTested(true);
    markLabCompleted('organic');
  };

  const handleReset = () => {
    setCurrentStage(1);
    setRefluxBoiling(false);
    setCrystalsFormed(false);
    setVacuumFiltered(false);
    setPurityTested(false);
  };

  const handleQuickComplete = () => {
    setRefluxBoiling(false);
    setCrystalsFormed(true);
    setVacuumFiltered(true);
    setPurityTested(true);
    setCurrentStage(4);
    markLabCompleted('organic');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="organic"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                <span>Experiment #10</span>
                <span>•</span>
                <span>Organic Synthesis & Medicinal Chemistry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-indigo-600 flex-shrink-0" />
              <span className="text-indigo-900 font-medium">
                Synthesize Acetylsalicylic Acid (Aspirin) via acid-catalyzed esterification, recrystallize in ice, filter, and verify purity with FeCl₃.
              </span>
            </div>
          </div>
        </div>

        {/* Synthesis Stepper Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { stage: 1, title: '1. Reflux Setup', done: currentStage > 1 },
            { stage: 2, title: '2. Ice Crystallization', done: currentStage > 2 },
            { stage: 3, title: '3. Vacuum Filtration', done: currentStage > 3 },
            { stage: 4, title: '4. FeCl₃ Purity Assay', done: purityTested }
          ].map(s => (
            <button
              key={s.stage}
              onClick={() => setCurrentStage(s.stage)}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentStage === s.stage
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                  : s.done
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{s.title}</span>
                {s.done && <CheckCircle2 size={14} className="text-emerald-500" />}
              </div>
            </button>
          ))}
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Stage-Dependent Laboratory Apparatus */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Readout bar */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/90 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">ACTIVE WORKSTATION:</span>
                <span className="text-xs font-mono font-extrabold text-indigo-300">
                  {currentStage === 1 ? 'LIEBIG REFLUX CONDENSER' : currentStage === 2 ? 'ICE BATH RECRYSTALLIZATION' : currentStage === 3 ? 'BÜCHNER SUCTION FILTRATION' : 'FERRIC CHLORIDE COLORIMETRIC ASSAY'}
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                STAGE {currentStage} OF 4
              </span>
            </div>

            {/* Graphical Apparatus for Current Stage */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              {/* STAGE 1: Reflux Condenser & Round Bottom Flask */}
              {currentStage === 1 && (
                <div className="relative w-64 h-[360px] flex flex-col items-center justify-end">
                  {/* Vertical Liebig Condenser Jacket */}
                  <div className="w-10 h-48 border-2 border-white/60 bg-white/10 rounded-t shadow-lg flex flex-col items-center justify-center relative backdrop-blur-xs">
                    {/* Inner condensation tube */}
                    <div className="w-4 h-full border-x border-white/50 bg-white/5"></div>
                    {/* Water hoses */}
                    <div className="absolute top-4 -right-10 w-10 h-2 bg-cyan-400/80 rounded-r text-[8px] font-mono text-slate-900 px-1 font-bold">
                      Water Out
                    </div>
                    <div className="absolute bottom-4 -left-10 w-10 h-2 bg-blue-400/80 rounded-l text-[8px] font-mono text-slate-900 px-1 font-bold">
                      Water In
                    </div>
                  </div>

                  {/* Round Bottom Flask */}
                  <div className="relative w-28 h-28 -mt-2 rounded-full border-2 border-white/70 bg-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-end overflow-hidden">
                    <div
                      className="w-full bg-amber-200/50 transition-all duration-300 flex items-center justify-center relative"
                      style={{ height: '55%' }}
                    >
                      {refluxBoiling && (
                        <div className="absolute inset-0 flex items-center justify-around opacity-80">
                          <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                          <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Heating Mantle Base */}
                  <div className="w-40 h-10 bg-slate-700 rounded-b-2xl shadow-2xl border-t border-slate-500 flex items-center justify-between px-3 mt-0">
                    <span className="text-[9px] font-mono text-slate-300">HEATING MANTLE</span>
                    <span className="text-[9px] font-mono text-amber-300 font-bold">85°C</span>
                  </div>
                </div>
              )}

              {/* STAGE 2: Ice Bath Crystallization */}
              {currentStage === 2 && (
                <div className="relative w-72 h-[340px] flex flex-col items-center justify-end">
                  {/* Ice Bath Container */}
                  <div className="w-64 h-36 border-2 border-cyan-400/40 rounded-b-2xl bg-cyan-950/40 backdrop-blur-sm shadow-xl flex items-center justify-center relative">
                    <span className="text-xs font-mono text-cyan-200 absolute top-2 font-bold">
                      ❄ Ice Slurry Bath (0°C)
                    </span>
                  </div>

                  {/* Flask Plunged into Ice */}
                  <div className="absolute bottom-6 w-36 h-48 flex flex-col items-center z-20">
                    <div className="w-10 h-14 border-x-2 border-white/60 bg-white/10 rounded-t backdrop-blur-sm"></div>
                    <div
                      className="w-36 h-34 border-2 border-white/70 rounded-b-3xl relative overflow-hidden backdrop-blur-md shadow-2xl flex flex-col justify-end"
                      style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)' }}
                    >
                      <div className="w-full h-3/4 bg-blue-100/30 flex flex-col justify-end p-2 relative">
                        {crystalsFormed && (
                          <div className="w-full h-12 bg-white/95 rounded-b-2xl border-t-2 border-slate-200 shadow-md flex items-center justify-center animate-pulse">
                            <span className="text-[9px] font-mono font-bold text-slate-800">
                              Aspirin Crystals ❄
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: Büchner Funnel Vacuum Filtration */}
              {currentStage === 3 && (
                <div className="relative w-64 h-[360px] flex flex-col items-center justify-end">
                  {/* Porcelain Büchner Funnel */}
                  <div className="w-32 h-16 bg-slate-100 border-2 border-slate-300 rounded-t-lg shadow-md flex flex-col items-center justify-center relative">
                    <span className="text-[9px] font-mono text-slate-600 font-bold">PORCELAIN FUNNEL</span>
                    {vacuumFiltered && (
                      <div className="w-24 h-3 bg-white rounded shadow border border-slate-200 mt-1"></div>
                    )}
                  </div>
                  {/* Rubber Cone Stopper */}
                  <div className="w-12 h-4 bg-slate-700"></div>

                  {/* Thick-walled Büchner Filter Flask */}
                  <div className="relative w-36 h-44 border-2 border-white/60 rounded-b-2xl bg-white/10 backdrop-blur-md shadow-2xl flex flex-col justify-end overflow-hidden">
                    {/* Vacuum hose port */}
                    <div className="absolute top-4 -right-2 w-8 h-3 bg-slate-400 rounded-r border border-white/50"></div>
                    {/* Mother liquor filtrate */}
                    <div
                      className="w-full bg-slate-200/20 border-t border-white/40 transition-all duration-700"
                      style={{ height: vacuumFiltered ? '50%' : '15%' }}
                    ></div>
                  </div>
                </div>
              )}

              {/* STAGE 4: FeCl3 Purity Test (Side-by-side test tubes) */}
              {currentStage === 4 && (
                <div className="relative w-80 h-[340px] flex items-end justify-around pb-6">
                  {/* Test Tube 1: Salicylic Acid Control (Turns Deep Purple) */}
                  <div className="w-16 h-52 flex flex-col items-center">
                    <div className="w-16 h-48 bg-white/10 border-2 border-white/40 rounded-b-full relative overflow-hidden backdrop-blur-sm shadow-xl flex flex-col justify-end">
                      <div
                        className={`w-full transition-all duration-700 ${
                          purityTested ? 'bg-purple-900/90 shadow-lg shadow-purple-900/50' : 'bg-slate-200/30'
                        }`}
                        style={{ height: '65%' }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 font-bold mt-2 text-center">
                      Control (Salicylic Acid)
                    </span>
                    <span className="text-[9px] font-mono text-purple-300">
                      {purityTested ? 'PURPLE (+)' : 'FeCl₃'}
                    </span>
                  </div>

                  {/* Test Tube 2: Synthesized Aspirin (Stays Pale Yellow) */}
                  <div className="w-16 h-52 flex flex-col items-center">
                    <div className="w-16 h-48 bg-white/10 border-2 border-white/40 rounded-b-full relative overflow-hidden backdrop-blur-sm shadow-xl flex flex-col justify-end">
                      <div
                        className={`w-full transition-all duration-700 ${
                          purityTested ? 'bg-yellow-300/70 shadow-lg shadow-yellow-300/40' : 'bg-slate-200/30'
                        }`}
                        style={{ height: '65%' }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 font-bold mt-2 text-center">
                      Pure Aspirin Product
                    </span>
                    <span className="text-[9px] font-mono text-emerald-300 font-bold">
                      {purityTested ? 'YELLOW (- Pure!)' : 'FeCl₃'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                {currentStage === 1 && (
                  <button
                    onClick={handleRunReflux}
                    disabled={refluxBoiling}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow"
                  >
                    {refluxBoiling ? 'Refluxing at 85°C...' : 'Heat under Reflux (15 min)'}
                  </button>
                )}

                {currentStage === 2 && (
                  <button
                    onClick={handleCrystallize}
                    disabled={crystalsFormed}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow"
                  >
                    {crystalsFormed ? 'Crystals Precipitated ✓' : 'Add Chilled H₂O & Crystallize'}
                  </button>
                )}

                {currentStage === 3 && (
                  <button
                    onClick={handleFilter}
                    disabled={vacuumFiltered}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow"
                  >
                    {vacuumFiltered ? 'Vacuum Filtration Complete ✓' : 'Engage Vacuum Pump & Filter'}
                  </button>
                )}

                {currentStage === 4 && (
                  <button
                    onClick={handleTestPurity}
                    disabled={purityTested}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow"
                  >
                    {purityTested ? 'Purity Assay Complete ✓' : 'Add FeCl₃ & Run Purity Assay'}
                  </button>
                )}
              </div>

              <div className="text-xs font-mono text-slate-400">
                Synthesis Progress: {currentStage}/4
              </div>
            </div>
          </div>

          {/* Right Panel: Synthesis Metrics & Chemical Information */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span>⚗️</span> Experimental Yield & Recovery
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Salicylic Acid Input:</span>
                  <span className="font-mono font-bold text-slate-800">2.00 g (14.5 mmol)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Theoretical Yield:</span>
                  <span className="font-mono font-bold text-slate-800">2.61 g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Actual Recovered Mass:</span>
                  <span className="font-mono font-bold text-slate-800">{vacuumFiltered ? '2.28 g' : '--'}</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-600 font-bold text-sm">
                  <span>Percent Yield:</span>
                  <span>{vacuumFiltered ? '87.4%' : '--'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>🔬</span> Ferric Chloride Purity Assay Logic
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950">
                  <span className="font-bold block text-purple-900 mb-1">Positive Phenol Test (Purple):</span>
                  Salicylic acid contains an unreacted phenolic -OH group that forms an octahedral hexasalicylate iron(III) complex [Fe(salicylate)₆]³⁻ with deep purple absorption (λ = 530 nm).
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                  <span className="font-bold block text-emerald-900 mb-1">Negative Test (Yellow, Pure Aspirin):</span>
                  In acetylsalicylic acid, the phenolic group has been fully esterified into an acetate ester (-OCOCH₃), preventing coordination with Fe³⁺. The solution stays pale yellow!
                </div>
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

