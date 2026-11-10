import React, { useState } from 'react';
import { Flame, Sparkles, CheckCircle2, RotateCcw, Eye, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

interface SaltOption {
  id: string;
  name: string;
  formula: string;
  cation: string;
  colorName: string;
  wavelength: string;
  flameColor: string;
  flameGlow: string;
  spectralLine: string;
  spectralPosition: number; // % across visible 400-750 nm spectrum
}

const SALTS: SaltOption[] = [
  {
    id: 'na',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    cation: 'Na⁺',
    colorName: 'Golden Yellow',
    wavelength: '589.0 nm',
    flameColor: '#fbbf24',
    flameGlow: 'rgba(251, 191, 36, 0.85)',
    spectralLine: '#f59e0b',
    spectralPosition: 54
  },
  {
    id: 'cu',
    name: 'Copper(II) Chloride',
    formula: 'CuCl₂',
    cation: 'Cu²⁺',
    colorName: 'Emerald Blue-Green',
    wavelength: '510.5 nm',
    flameColor: '#10b981',
    flameGlow: 'rgba(16, 185, 129, 0.85)',
    spectralLine: '#059669',
    spectralPosition: 31
  },
  {
    id: 'sr',
    name: 'Strontium Chloride',
    formula: 'SrCl₂',
    cation: 'Sr²⁺',
    colorName: 'Crimson Scarlet',
    wavelength: '650.4 nm',
    flameColor: '#ef4444',
    flameGlow: 'rgba(239, 68, 68, 0.85)',
    spectralLine: '#dc2626',
    spectralPosition: 71
  },
  {
    id: 'k',
    name: 'Potassium Chloride',
    formula: 'KCl',
    cation: 'K⁺',
    colorName: 'Lilac / Pale Violet',
    wavelength: '766.5 nm',
    flameColor: '#c084fc',
    flameGlow: 'rgba(192, 132, 252, 0.85)',
    spectralLine: '#9333ea',
    spectralPosition: 92
  },
  {
    id: 'ba',
    name: 'Barium Chloride',
    formula: 'BaCl₂',
    cation: 'Ba²⁺',
    colorName: 'Apple / Lime Green',
    wavelength: '553.6 nm',
    flameColor: '#84cc16',
    flameGlow: 'rgba(132, 204, 22, 0.85)',
    spectralLine: '#65a30d',
    spectralPosition: 44
  },
  {
    id: 'ca',
    name: 'Calcium Chloride',
    formula: 'CaCl₂',
    cation: 'Ca²⁺',
    colorName: 'Brick Red / Orange',
    wavelength: '622.0 nm',
    flameColor: '#f97316',
    flameGlow: 'rgba(249, 115, 22, 0.85)',
    spectralLine: '#ea580c',
    spectralPosition: 63
  }
];

export default function FlameTestLab() {
  const labData = EXPERIMENTS_DATA['flame-test'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  const [activeSalt, setActiveSalt] = useState<SaltOption | null>(null);
  const [wireInFlame, setWireInFlame] = useState<boolean>(false);
  const [airVentOpen, setAirVentOpen] = useState<boolean>(true);
  const [useCobaltGlass, setUseCobaltGlass] = useState<boolean>(false);
  const [testedSalts, setTestedSalts] = useState<string[]>([]);
  const [wireClean, setWireClean] = useState<boolean>(true);

  const isDone = isLabCompleted('flame-test');

  const handleDipInSalt = (salt: SaltOption) => {
    setActiveSalt(salt);
    setWireClean(false);
  };

  const handleCleanWire = () => {
    setActiveSalt(null);
    setWireClean(true);
    setWireInFlame(false);
  };

  const handleInsertLoop = () => {
    setWireInFlame(true);
    if (activeSalt && !testedSalts.includes(activeSalt.id)) {
      const next = [...testedSalts, activeSalt.id];
      setTestedSalts(next);
      if (next.length >= 3) {
        markLabCompleted('flame-test');
      }
    }
  };

  const handleReset = () => {
    setActiveSalt(null);
    setWireInFlame(false);
    setTestedSalts([]);
    setWireClean(true);
    setAirVentOpen(true);
    setUseCobaltGlass(false);
  };

  const handleQuickComplete = () => {
    setActiveSalt(SALTS[0]);
    setWireInFlame(true);
    setTestedSalts(SALTS.map(s => s.id));
    markLabCompleted('flame-test');
  };

  // Flame appearance calculation
  const getFlameVisuals = () => {
    if (!airVentOpen) {
      // Safety yellow flame
      return {
        outerColor: '#fbbf24',
        innerColor: '#fef08a',
        glow: 'rgba(251, 191, 36, 0.5)',
        scale: 'scale-y-110'
      };
    }

    if (wireInFlame && activeSalt) {
      // Emission color
      const baseColor = useCobaltGlass && activeSalt.id === 'k' ? '#a855f7' : activeSalt.flameColor;
      return {
        outerColor: baseColor,
        innerColor: '#fef9c3',
        glow: activeSalt.flameGlow,
        scale: 'scale-125'
      };
    }

    // Standard hot non-luminous blue flame
    return {
      outerColor: '#38bdf8',
      innerColor: '#0284c7',
      glow: 'rgba(56, 189, 248, 0.5)',
      scale: 'scale-100'
    };
  };

  const flame = getFlameVisuals();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="flame-test"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                <span>Experiment #2</span>
                <span>•</span>
                <span>Inorganic Spectroscopy & Qualitative Analysis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-orange-50/80 border border-orange-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-orange-600 flex-shrink-0" />
              <span className="text-orange-900 font-medium">
                Test metal salts in the hot Bunsen flame to identify their characteristic electronic emission colors and spectral wavelengths.
              </span>
            </div>
          </div>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Bunsen Burner & Animated Flame Apparatus */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            {/* Dark optical laboratory ambiance */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

            {/* Top Apparatus Bar */}
            <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                <span className="text-xs font-mono font-bold text-slate-300">BURNER STATE:</span>
                <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                  airVentOpen ? 'bg-blue-900/60 text-cyan-300 border border-cyan-800' : 'bg-amber-900/60 text-amber-300 border border-amber-800'
                }`}>
                  {airVentOpen ? 'HOT BLUE FLAME (~1500°C)' : 'COOL SAFETY FLAME (~600°C)'}
                </span>
              </div>

              {activeSalt && wireInFlame && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">EMITTING:</span>
                  <span className="text-xs font-mono font-extrabold text-amber-300">
                    {activeSalt.cation} ({activeSalt.wavelength})
                  </span>
                </div>
              )}
            </div>

            {/* Central Bunsen Burner & Flame Centerpiece */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-6">
              <div className="relative w-80 h-[360px] flex flex-col items-center justify-end">
                {/* Flame Render */}
                <div className="relative flex flex-col items-center justify-end mb-16 transition-all duration-300">
                  {/* Outer Flame Cone */}
                  <div
                    className={`w-16 h-36 rounded-full transition-all duration-300 blur-sm ${flame.scale}`}
                    style={{
                      background: `radial-gradient(ellipse at bottom, ${flame.innerColor} 0%, ${flame.outerColor} 70%, transparent 100%)`,
                      boxShadow: `0 0 45px ${flame.glow}, 0 -10px 30px ${flame.outerColor}`
                    }}
                  ></div>

                  {/* Inner Hot Core Cone */}
                  <div className="absolute bottom-0 w-8 h-20 bg-gradient-to-t from-cyan-200 via-sky-400 to-transparent rounded-full opacity-80"></div>

                  {/* Spark Particles when metal salt is heated */}
                  {wireInFlame && activeSalt && (
                    <div className="absolute inset-0 pointer-events-none flex justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute -top-4"></div>
                      <div className="w-1 h-1 rounded-full bg-amber-200 animate-pulse absolute -top-8 left-4"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping absolute -top-6 right-3"></div>
                    </div>
                  )}

                  {/* Cobalt Blue Glass Filter Effect */}
                  {useCobaltGlass && (
                    <div className="absolute -inset-10 bg-indigo-900/40 backdrop-blur-xs rounded-2xl border border-indigo-500/30 flex items-start justify-end p-2 pointer-events-none">
                      <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded">
                        Cobalt Glass Active
                      </span>
                    </div>
                  )}
                </div>

                {/* Nichrome Wire Loop Assembly */}
                <div
                  className={`absolute transition-all duration-500 z-30 flex items-center cursor-pointer ${
                    wireInFlame ? 'bottom-32 left-1/2 transform -translate-x-1/2' : 'bottom-16 right-4 rotate-12'
                  }`}
                  onClick={() => (wireInFlame ? setWireInFlame(false) : handleInsertLoop())}
                  title="Click to insert or remove wire loop from flame"
                >
                  {/* Glass/Insulated Handle */}
                  <div className="w-24 h-3 bg-gradient-to-r from-amber-800 to-amber-700 rounded-l shadow-md border-y border-amber-900"></div>
                  {/* Nichrome Rod */}
                  <div className="w-20 h-1 bg-gradient-to-r from-slate-400 to-slate-200 shadow"></div>
                  {/* Circular Wire Loop tip */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      wireClean
                        ? 'border-slate-300 bg-transparent'
                        : activeSalt
                        ? 'border-amber-400 bg-amber-400/40 shadow-sm shadow-amber-400'
                        : 'border-slate-400'
                    }`}
                  ></div>
                </div>

                {/* Bunsen Burner Hardware */}
                <div className="relative flex flex-col items-center">
                  {/* Burner Chimney / Barrel */}
                  <div className="w-7 h-28 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t border-t border-slate-300 shadow-md"></div>

                  {/* Air Intake Collar */}
                  <div className="w-9 h-6 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 flex items-center justify-center border-y border-amber-900 shadow">
                    <button
                      onClick={() => setAirVentOpen(!airVentOpen)}
                      className="w-3 h-3 bg-slate-900 rounded-full border border-amber-400"
                      title="Toggle air hole collar (yellow safety vs blue flame)"
                    ></button>
                  </div>

                  {/* Gas Inlet & Tubing */}
                  <div className="w-12 h-4 bg-slate-500 flex items-center">
                    <div className="w-16 h-2 bg-amber-600 rounded-l -translate-x-8"></div>
                  </div>

                  {/* Heavy Cast Iron Base */}
                  <div className="w-36 h-6 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 rounded-b-xl shadow-2xl border-t border-slate-600"></div>
                </div>
              </div>
            </div>

            {/* Optical Spectroscope Real-Time Spectrum Bar */}
            <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Eye size={14} className="text-cyan-400" /> OPTICAL EMISSION SPECTROSCOPE (400 - 750 nm)
                </span>
                {activeSalt && wireInFlame && (
                  <span className="text-amber-400 font-bold">
                    Peak: {activeSalt.wavelength}
                  </span>
                )}
              </div>
              <div className="relative h-6 w-full rounded bg-gradient-to-r from-indigo-900 via-blue-900 via-green-900 via-yellow-900 to-red-900 border border-slate-700 overflow-hidden">
                {/* Wavelength Grid lines */}
                <div className="absolute inset-0 flex justify-between px-2 text-[8px] font-mono text-white/40 pointer-events-none select-none items-center">
                  <span>400nm</span>
                  <span>500nm</span>
                  <span>600nm</span>
                  <span>700nm</span>
                </div>

                {/* Distinct Bright Emission Spectral Line */}
                {wireInFlame && activeSalt && (
                  <div
                    className="absolute top-0 bottom-0 w-1.5 shadow-lg transition-all duration-300"
                    style={{
                      left: `${activeSalt.spectralPosition}%`,
                      backgroundColor: activeSalt.spectralLine,
                      boxShadow: `0 0 12px ${activeSalt.spectralLine}`
                    }}
                  ></div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCleanWire}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Clean Loop (6M HCl)
                </button>
                <button
                  onClick={() => setUseCobaltGlass(!useCobaltGlass)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    useCobaltGlass
                      ? 'bg-indigo-900/60 text-indigo-300 border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Use blue cobalt glass filter to absorb yellow sodium emission"
                >
                  Cobalt Glass {useCobaltGlass ? 'ON' : 'OFF'}
                </button>
              </div>

              <button
                onClick={() => (wireInFlame ? setWireInFlame(false) : handleInsertLoop())}
                disabled={!activeSalt && !wireClean}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                  wireInFlame
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30'
                }`}
              >
                {wireInFlame ? 'Remove Wire from Flame' : 'Place Wire in Flame'}
              </button>
            </div>
          </div>

          {/* Right Panel: Reagent Salts Selection & Observations */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Salts Selection Shelf */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Metal Salt Reagent Shelf</h3>
                  <p className="text-[11px] text-slate-500">Select a salt to load the nichrome loop</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  {testedSalts.length}/6 Tested
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {SALTS.map(salt => {
                  const isSelected = activeSalt?.id === salt.id;
                  const isTested = testedSalts.includes(salt.id);
                  return (
                    <button
                      key={salt.id}
                      onClick={() => handleDipInSalt(salt)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{salt.formula}</span>
                        {isTested && <CheckCircle2 size={14} className="text-emerald-500" />}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{salt.name}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: salt.flameColor }}
                        ></div>
                        <span className="text-[10px] font-semibold text-slate-700">{salt.colorName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Results Log */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>📋</span> Spectroscopy Observation Log
              </h3>
              <div className="space-y-2 text-xs">
                {SALTS.map(s => {
                  const done = testedSalts.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        done ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold">{s.formula} ({s.cation})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{done ? s.colorName : 'Pending'}</span>
                        <span className="font-mono text-[10px]">{done ? s.wavelength : '--'}</span>
                      </div>
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

