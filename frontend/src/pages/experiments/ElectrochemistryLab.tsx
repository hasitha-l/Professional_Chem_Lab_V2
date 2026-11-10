import React, { useState } from 'react';
import { Zap, Play, RotateCcw, CheckCircle2, Sliders, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function ElectrochemistryLab() {
  const labData = EXPERIMENTS_DATA['electro'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  const [saltBridgeInserted, setSaltBridgeInserted] = useState<boolean>(true);
  const [circuitClosed, setCircuitClosed] = useState<boolean>(true);
  const [znConc, setZnConc] = useState<number>(1.00); // M
  const [cuConc, setCuConc] = useState<number>(1.00); // M

  const isDone = isLabCompleted('electro');

  // Nernst Equation: E = E° - (0.0592 / n) * log10([Zn2+] / [Cu2+]), n = 2, E° = 1.100 V
  const calculateVoltage = (): number => {
    if (!saltBridgeInserted || !circuitClosed) return 0.00;
    const q = znConc / cuConc;
    const nernst = 1.100 - (0.0592 / 2) * Math.log10(q);
    return Math.max(0.00, Number(nernst.toFixed(3)));
  };

  const voltage = calculateVoltage();

  const handleToggleSaltBridge = () => {
    const next = !saltBridgeInserted;
    setSaltBridgeInserted(next);
    if (next && circuitClosed) {
      markLabCompleted('electro');
    }
  };

  const handleToggleCircuit = () => {
    const next = !circuitClosed;
    setCircuitClosed(next);
    if (next && saltBridgeInserted) {
      markLabCompleted('electro');
    }
  };

  const handleReset = () => {
    setSaltBridgeInserted(true);
    setCircuitClosed(true);
    setZnConc(1.00);
    setCuConc(1.00);
  };

  const handleQuickComplete = () => {
    setSaltBridgeInserted(true);
    setCircuitClosed(true);
    setZnConc(0.10);
    setCuConc(1.50);
    markLabCompleted('electro');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="electro"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">
                <span>Experiment #5</span>
                <span>•</span>
                <span>Physical Chemistry & Voltaic Cells</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-yellow-50/80 border border-yellow-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-yellow-600 flex-shrink-0" />
              <span className="text-yellow-900 font-medium">
                Assemble the Zn-Cu Daniell Cell, observe spontaneous electron flow from anode to cathode, and verify the Nernst Equation.
              </span>
            </div>
          </div>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Daniell Cell Dual Beaker Apparatus */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Multimeter Top Digital Display */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/90 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 shadow-inner">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${voltage > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
                <span className="text-xs font-mono font-bold text-slate-300">PRECISION DIGITAL MULTIMETER:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-extrabold text-yellow-400 tracking-wider">
                  {voltage > 0 ? `+${voltage.toFixed(3)}` : '0.000'} <span className="text-sm text-yellow-200">V</span>
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  circuitClosed && saltBridgeInserted ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {circuitClosed && saltBridgeInserted ? 'CIRCUIT CLOSED' : 'OPEN CIRCUIT'}
                </span>
              </div>
            </div>

            {/* Central Graphical Electrochemical Cell */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <div className="relative w-full max-w-md h-72 flex items-end justify-center gap-12 pb-6">
                {/* Circuit Wiring with Animated Electrons */}
                <div className="absolute top-4 inset-x-12 h-14 border-t-2 border-x-2 border-amber-400/80 rounded-t-xl pointer-events-none">
                  {voltage > 0 && (
                    <>
                      {/* Flowing electrons (Left to Right) */}
                      <div className="absolute -top-1.5 left-6 w-3 h-3 rounded-full bg-yellow-300 shadow-md shadow-yellow-400 animate-ping"></div>
                      <div className="absolute -top-1 left-1/3 w-2 h-2 rounded-full bg-white shadow animate-pulse"></div>
                      <div className="absolute -top-1.5 right-6 w-3 h-3 rounded-full bg-yellow-300 shadow-md shadow-yellow-400 animate-ping"></div>
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-full text-[9px] font-mono text-yellow-300 font-bold bg-slate-900/90 px-2 py-0.5 rounded border border-yellow-500/40">
                        e⁻ Flow →
                      </div>
                    </>
                  )}
                </div>

                {/* Salt Bridge (U-Tube) bridging both beakers */}
                {saltBridgeInserted && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-32 h-28 border-t-8 border-x-8 border-slate-300/80 bg-cyan-200/20 rounded-t-3xl backdrop-blur-sm z-30 shadow-lg flex items-center justify-center">
                    <span className="text-[9px] font-mono font-extrabold text-cyan-200 bg-slate-900/80 px-1.5 py-0.5 rounded border border-cyan-400/50">
                      KNO₃ Salt Bridge
                    </span>
                  </div>
                )}

                {/* Left Beaker: Zinc Anode & ZnSO4 */}
                <div className="relative w-36 h-48 bg-white/10 border-2 border-white/50 rounded-b-2xl backdrop-blur-md shadow-xl flex flex-col justify-end overflow-hidden">
                  {/* Solution */}
                  <div
                    className="w-full bg-slate-200/25 border-t border-white/40 flex flex-col justify-end relative"
                    style={{ height: '70%' }}
                  >
                    {/* Zinc Electrode Strip */}
                    <div className="absolute bottom-0 left-6 w-6 h-36 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-t shadow-md border-t-2 border-slate-200 z-20 flex flex-col items-center">
                      <span className="text-[8px] font-mono font-extrabold text-slate-800 rotate-90 mt-4">Zn(s)</span>
                    </div>

                    {/* Ion notation */}
                    <div className="p-2 text-[9px] font-mono text-slate-300 text-right">
                      <div>Zn²⁺ ({znConc.toFixed(2)} M)</div>
                      <div className="text-[8px] text-slate-400">ANODE (-)</div>
                    </div>
                  </div>
                </div>

                {/* Right Beaker: Copper Cathode & CuSO4 */}
                <div className="relative w-36 h-48 bg-white/10 border-2 border-white/50 rounded-b-2xl backdrop-blur-md shadow-xl flex flex-col justify-end overflow-hidden">
                  {/* Solution: Deep Sky Blue */}
                  <div
                    className="w-full bg-gradient-to-t from-sky-500/60 to-sky-400/40 border-t-2 border-sky-300/80 flex flex-col justify-end relative"
                    style={{ height: '70%' }}
                  >
                    {/* Copper Electrode Strip */}
                    <div className="absolute bottom-0 right-6 w-6 h-36 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-t shadow-md border-t-2 border-amber-500 z-20 flex flex-col items-center">
                      <span className="text-[8px] font-mono font-extrabold text-amber-200 rotate-90 mt-4">Cu(s)</span>
                    </div>

                    {/* Ion notation */}
                    <div className="p-2 text-[9px] font-mono text-cyan-200 text-left">
                      <div>Cu²⁺ ({cuConc.toFixed(2)} M)</div>
                      <div className="text-[8px] text-cyan-300">CATHODE (+)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSaltBridge}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    saltBridgeInserted
                      ? 'bg-cyan-900/40 text-cyan-300 border-cyan-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  Salt Bridge {saltBridgeInserted ? 'INSERTED ✓' : 'REMOVED ✗'}
                </button>

                <button
                  onClick={handleToggleCircuit}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    circuitClosed
                      ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  Circuit Switch {circuitClosed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Cell: Zn | Zn²⁺ || Cu²⁺ | Cu
              </div>
            </div>
          </div>

          {/* Right Panel: Nernst Equation Workbench & Sliders */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Concentration Sliders */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Sliders size={16} className="text-blue-600" /> Concentration Controls (Nernst)
                </h3>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  E° = 1.100 V
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5 font-semibold text-slate-700">
                    <span>Anode [Zn²⁺] Concentration:</span>
                    <span className="font-mono text-blue-600 font-bold">{znConc.toFixed(2)} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="2.00"
                    step="0.05"
                    value={znConc}
                    onChange={(e) => setZnConc(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0.01 M</span>
                    <span>1.00 M</span>
                    <span>2.00 M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5 font-semibold text-slate-700">
                    <span>Cathode [Cu²⁺] Concentration:</span>
                    <span className="font-mono text-cyan-600 font-bold">{cuConc.toFixed(2)} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="2.00"
                    step="0.05"
                    value={cuConc}
                    onChange={(e) => setCuConc(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0.01 M</span>
                    <span>1.00 M</span>
                    <span>2.00 M</span>
                  </div>
                </div>
              </div>

              {/* Nernst Math Box */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
                <div className="text-slate-500 text-[11px] mb-1">Nernst Calculation:</div>
                <div className="text-slate-800 font-bold">
                  E = 1.100 - (0.0592 / 2) · log₁₀({znConc.toFixed(2)} / {cuConc.toFixed(2)})
                </div>
                <div className="text-emerald-600 font-bold mt-1 text-sm">
                  = +{voltage.toFixed(3)} V
                </div>
              </div>
            </div>

            {/* Electrode Reactions Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>⚡</span> Half-Cell Standard Potentials
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Anode (Oxidation):</span>
                    <span className="font-mono text-blue-600">E° = +0.763 V</span>
                  </div>
                  <div className="font-mono text-slate-600 mt-1">Zn(s) → Zn²⁺(aq) + 2e⁻</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Cathode (Reduction):</span>
                    <span className="font-mono text-cyan-600">E° = +0.337 V</span>
                  </div>
                  <div className="font-mono text-slate-600 mt-1">Cu²⁺(aq) + 2e⁻ → Cu(s)</div>
                </div>

                <div className="p-2.5 bg-yellow-50/80 border border-yellow-200 rounded-lg text-yellow-900 font-semibold text-[11px]">
                  Total Cell EMF: E° = E°(cathode) - E°(anode) = 0.337 - (-0.763) = +1.100 V
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

