import React, { useState } from 'react';
import { TestTube2, Droplet, RefreshCw, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

interface ReactionPair {
  id: string;
  name: string;
  solA: { name: string; formula: string; color: string; volume: number };
  solB: { name: string; formula: string; color: string };
  precipitate: {
    name: string;
    formula: string;
    color: string;
    bgColor: string;
    borderColor: string;
    ksp: string;
    description: string;
  };
}

const PAIRS: ReactionPair[] = [
  {
    id: 'agcl',
    name: 'Silver Chloride Formation',
    solA: { name: 'Silver Nitrate (0.1M)', formula: 'AgNO₃', color: 'rgba(240, 248, 255, 0.4)', volume: 3 },
    solB: { name: 'Sodium Chloride (0.1M)', formula: 'NaCl', color: 'rgba(240, 248, 255, 0.4)' },
    precipitate: {
      name: 'Silver Chloride',
      formula: 'AgCl(s)↓',
      color: '#ffffff',
      bgColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      ksp: '1.77 × 10⁻¹⁰',
      description: 'Curdy white dense precipitate'
    }
  },
  {
    id: 'pbi2',
    name: 'Lead(II) Iodide (Golden Rain)',
    solA: { name: 'Lead(II) Nitrate (0.1M)', formula: 'Pb(NO₃)₂', color: 'rgba(240, 248, 255, 0.4)', volume: 3 },
    solB: { name: 'Potassium Iodide (0.1M)', formula: 'KI', color: 'rgba(254, 249, 195, 0.3)' },
    precipitate: {
      name: 'Lead(II) Iodide',
      formula: 'PbI₂(s)↓',
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.95)',
      borderColor: '#ca8a04',
      ksp: '9.80 × 10⁻⁹',
      description: 'Brilliant glistening golden-yellow crystals'
    }
  },
  {
    id: 'cuoh2',
    name: 'Copper(II) Hydroxide Formation',
    solA: { name: 'Copper(II) Sulfate (0.1M)', formula: 'CuSO₄', color: 'rgba(56, 189, 248, 0.45)', volume: 3 },
    solB: { name: 'Sodium Hydroxide (0.1M)', formula: 'NaOH', color: 'rgba(240, 248, 255, 0.4)' },
    precipitate: {
      name: 'Copper(II) Hydroxide',
      formula: 'Cu(OH)₂(s)↓',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.9)',
      borderColor: '#0284c7',
      ksp: '2.20 × 10⁻²⁰',
      description: 'Gelatinous light sky-blue precipitate'
    }
  },
  {
    id: 'feoh3',
    name: 'Iron(III) Hydroxide Formation',
    solA: { name: 'Iron(III) Chloride (0.1M)', formula: 'FeCl₃', color: 'rgba(245, 158, 11, 0.4)', volume: 3 },
    solB: { name: 'Sodium Hydroxide (0.1M)', formula: 'NaOH', color: 'rgba(240, 248, 255, 0.4)' },
    precipitate: {
      name: 'Iron(III) Hydroxide',
      formula: 'Fe(OH)₃(s)↓',
      color: '#9a3412',
      bgColor: 'rgba(154, 52, 18, 0.95)',
      borderColor: '#7c2d12',
      ksp: '2.79 × 10⁻³⁹',
      description: 'Dense rust-brown flocculent precipitate'
    }
  }
];

export default function PrecipitationLab() {
  const labData = EXPERIMENTS_DATA['precipitation'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  // Test tube states: 'empty', 'solA_loaded', 'precipitated', 'centrifuged'
  const [tubeStates, setTubeStates] = useState<Record<string, 'empty' | 'solA_loaded' | 'precipitated' | 'centrifuged'>>({
    agcl: 'empty',
    pbi2: 'empty',
    cuoh2: 'empty',
    feoh3: 'empty'
  });

  const [activeTubeId, setActiveTubeId] = useState<string>('agcl');
  const [isCentrifuging, setIsCentrifuging] = useState<boolean>(false);

  const isDone = isLabCompleted('precipitation');

  const checkCompletion = (newStates: Record<string, string>) => {
    const doneCount = Object.values(newStates).filter(s => s === 'precipitated' || s === 'centrifuged').length;
    if (doneCount >= 3) {
      markLabCompleted('precipitation');
    }
  };

  const handleAddSolA = (id: string) => {
    setTubeStates(prev => {
      const next = { ...prev, [id]: 'solA_loaded' as const };
      return next;
    });
  };

  const handleAddSolB = (id: string) => {
    setTubeStates(prev => {
      const next = { ...prev, [id]: 'precipitated' as const };
      checkCompletion(next);
      return next;
    });
  };

  const handleCentrifuge = () => {
    setIsCentrifuging(true);
    setTimeout(() => {
      setTubeStates(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] === 'precipitated') {
            next[k] = 'centrifuged';
          }
        });
        checkCompletion(next);
        return next;
      });
      setIsCentrifuging(false);
    }, 1500);
  };

  const handleReset = () => {
    setTubeStates({
      agcl: 'empty',
      pbi2: 'empty',
      cuoh2: 'empty',
      feoh3: 'empty'
    });
  };

  const handleQuickComplete = () => {
    setTubeStates({
      agcl: 'precipitated',
      pbi2: 'precipitated',
      cuoh2: 'precipitated',
      feoh3: 'precipitated'
    });
    markLabCompleted('precipitation');
  };

  const activePair = PAIRS.find(p => p.id === activeTubeId) || PAIRS[0];
  const activeState = tubeStates[activeTubeId];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="precipitation"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider mb-1">
                <span>Experiment #4</span>
                <span>•</span>
                <span>Inorganic Solution Chemistry & Solubility Rules</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-green-50/80 border border-green-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-green-600 flex-shrink-0" />
              <span className="text-green-900 font-medium">
                Mix aqueous reagents in test tubes to observe precipitate formation (AgCl, PbI₂, Cu(OH)₂, Fe(OH)₃) and test centrifugation.
              </span>
            </div>
          </div>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Acrylic Test Tube Rack & Tubes */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Readout bar */}
            <div className="relative z-10 flex items-center justify-between bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <TestTube2 size={18} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-300">SELECTED TUBE:</span>
                <span className="text-xs font-mono font-extrabold text-emerald-300">{activePair.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">STATE:</span>
                <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                  {activeState === 'empty' ? 'Empty' : activeState === 'solA_loaded' ? 'Precursor Loaded' : activeState === 'precipitated' ? 'Precipitated' : 'Centrifuged (Pellet)'}
                </span>
              </div>
            </div>

            {/* Center Visual Test Tube Rack */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <div className="relative w-full max-w-lg h-72 flex items-end justify-center gap-6 sm:gap-10 pb-6">
                {/* Acrylic Rack Backplate */}
                <div className="absolute bottom-6 inset-x-4 h-36 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs pointer-events-none"></div>

                {/* Test Tubes 1 to 4 */}
                {PAIRS.map((pair, index) => {
                  const state = tubeStates[pair.id];
                  const isSelected = activeTubeId === pair.id;

                  return (
                    <div
                      key={pair.id}
                      onClick={() => setActiveTubeId(pair.id)}
                      className={`relative w-12 sm:w-14 h-56 flex flex-col items-center justify-end cursor-pointer group transition-transform ${
                        isSelected ? 'scale-105' : 'hover:scale-102 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {/* Tube Lip */}
                      <div className="w-14 sm:w-16 h-2 bg-white/30 rounded-full border border-white/60 mb-0 shadow"></div>

                      {/* Glass Body */}
                      <div className="w-12 sm:w-14 h-52 bg-white/10 border-2 border-white/40 rounded-b-full relative overflow-hidden backdrop-blur-sm shadow-xl flex flex-col justify-end">
                        {/* Meniscus graduations */}
                        <div className="absolute inset-y-6 right-1 flex flex-col justify-between text-[7px] font-mono text-white/30 pointer-events-none">
                          <span>- 10</span>
                          <span>- 5</span>
                          <span>- 2</span>
                        </div>

                        {/* Liquid Content */}
                        {state !== 'empty' && (
                          <div
                            className="w-full transition-all duration-500 relative flex flex-col justify-end"
                            style={{
                              height: state === 'solA_loaded' ? '45%' : '80%',
                              backgroundColor: state === 'solA_loaded' ? pair.solA.color : 'rgba(240, 248, 255, 0.35)'
                            }}
                          >
                            {/* Precipitate Suspension or Settled Pellet */}
                            {(state === 'precipitated' || state === 'centrifuged') && (
                              <div
                                className={`w-full transition-all duration-700 shadow-md ${
                                  state === 'centrifuged'
                                    ? 'h-8 rounded-b-full border-t-2'
                                    : 'h-full animate-pulse'
                                }`}
                                style={{
                                  backgroundColor: pair.precipitate.bgColor,
                                  borderColor: pair.precipitate.borderColor
                                }}
                              >
                                {state === 'precipitated' && (
                                  <div className="w-full h-full flex flex-wrap gap-1 p-1 opacity-70">
                                    <div className="w-1 h-1 rounded-full bg-white animate-ping"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-black/20 animate-pulse ml-auto"></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tube Label */}
                      <div className={`mt-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{index + 1} {pair.precipitate.formula}
                      </div>
                    </div>
                  );
                })}

                {/* Acrylic Rack Base */}
                <div className="absolute bottom-2 inset-x-2 h-6 bg-gradient-to-t from-slate-700 to-slate-600 rounded-lg shadow-2xl border-t border-slate-500 flex items-center justify-around px-4">
                  <span className="text-[9px] font-mono text-slate-300">BOROSILICATE TEST TUBE RACK</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddSolA(activeTubeId)}
                  disabled={activeState !== 'empty'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeState === 'empty'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Droplet size={14} />
                  <span>1. Dispense {activePair.solA.formula}</span>
                </button>

                <button
                  onClick={() => handleAddSolB(activeTubeId)}
                  disabled={activeState !== 'solA_loaded'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeState === 'solA_loaded'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 animate-bounce'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Droplet size={14} />
                  <span>2. Add {activePair.solB.formula} (React!)</span>
                </button>
              </div>

              <button
                onClick={handleCentrifuge}
                disabled={isCentrifuging}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={isCentrifuging ? 'animate-spin' : ''} />
                <span>{isCentrifuging ? 'Centrifuging...' : 'Centrifuge Tubes'}</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Reagent Matrix & Observations */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Active Precipitate Profile */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Selected Reaction Details</h3>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  K_sp = {activePair.precipitate.ksp}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Reactants:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {activePair.solA.name} + {activePair.solB.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Insoluble Product:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: activePair.precipitate.bgColor }}
                    ></div>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {activePair.precipitate.formula}
                    </span>
                    <span className="text-slate-500">({activePair.precipitate.name})</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Physical Appearance:</span>
                  <span className="font-semibold text-slate-700">{activePair.precipitate.description}</span>
                </div>
              </div>
            </div>

            {/* General Solubility Rules Matrix */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>📖</span> Solubility Rules Quick Reference
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex justify-between">
                  <span className="font-bold">Nitrates (NO₃⁻) & Group 1</span>
                  <span>ALL SOLUBLE (No Exceptions)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900 flex justify-between">
                  <span className="font-bold">Halides (Cl⁻, Br⁻, I⁻)</span>
                  <span>Soluble EXCEPT Ag⁺, Pb²⁺, Hg₂²⁺</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-900 flex justify-between">
                  <span className="font-bold">Sulfates (SO₄²⁻)</span>
                  <span>Soluble EXCEPT Ba²⁺, Pb²⁺, Ca²⁺</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-rose-900 flex justify-between">
                  <span className="font-bold">Hydroxides (OH⁻)</span>
                  <span>INSOLUBLE EXCEPT Group 1 & Ba²⁺</span>
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

