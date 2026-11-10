import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Droplet, Play, Pause, RotateCcw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function RedoxTitrationLab() {
  const labData = EXPERIMENTS_DATA['redox'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  const [volumeKMnO4, setVolumeKMnO4] = useState<number>(0);
  const [stirrerActive, setStirrerActive] = useState<boolean>(true);
  const [acidAdded, setAcidAdded] = useState<boolean>(true);
  const [dripRate, setDripRate] = useState<number>(0);
  const [chartData, setChartData] = useState<Array<{ volume: number; potential: number }>>([
    { volume: 0, potential: 0.68 }
  ]);
  const [statusMessage, setStatusMessage] = useState<string>('Standardized 0.0200 M KMnO₄ in burette. Analyte flask contains 25.0 mL FeSO₄ and dilute H₂SO₄.');

  const intervalRef = useRef<number | null>(null);
  const isDone = isLabCompleted('redox');

  // Potential calculation based on Nernst equation for Fe3+/Fe2+ and MnO4-/Mn2+
  const calculatePotential = (v: number): number => {
    if (v <= 0) return 0.68;
    if (v < 24.8) {
      // Governed by Fe3+/Fe2+ couple (E° = +0.77V)
      const ratio = v / (25.0 - v);
      return Number((0.77 + 0.0592 * Math.log10(Math.max(0.01, ratio))).toFixed(2));
    } else if (v >= 24.8 && v <= 25.2) {
      // Equivalence steep transition
      return 1.39;
    } else {
      // Governed by MnO4-/Mn2+ couple (E° = +1.51V)
      const excess = v - 25.0;
      return Number(Math.min(1.51, 1.45 + 0.02 * Math.log10(excess + 0.1)).toFixed(2));
    }
  };

  const currentPotential = calculatePotential(volumeKMnO4);

  // Flask color: pale green (initial) -> pale yellow (Fe3+ forming) -> permanent pale pink at 25.0 mL -> deep purple if over-titrated
  const getFlaskColor = () => {
    if (volumeKMnO4 < 24.8) {
      // Slight yellowing as Fe3+ accumulates
      return {
        bg: 'rgba(240, 248, 230, 0.45)',
        border: 'rgba(180, 210, 160, 0.6)',
        glow: 'none'
      };
    } else if (volumeKMnO4 >= 24.8 && volumeKMnO4 <= 25.4) {
      // Equivalence point: faint persistent pink
      return {
        bg: 'rgba(255, 192, 203, 0.75)',
        border: 'rgba(244, 114, 182, 0.9)',
        glow: '0 0 20px rgba(244, 114, 182, 0.5)'
      };
    } else {
      // Over-titrated deep purple
      return {
        bg: 'rgba(107, 33, 168, 0.85)',
        border: 'rgba(88, 28, 135, 0.95)',
        glow: '0 0 25px rgba(107, 33, 168, 0.6)'
      };
    }
  };

  useEffect(() => {
    if (dripRate > 0) {
      const increment = dripRate === 1 ? 0.1 : 0.4;
      intervalRef.current = window.setInterval(() => {
        setVolumeKMnO4(prev => {
          const next = Math.min(50.0, Number((prev + increment).toFixed(2)));
          const pot = calculatePotential(next);
          setChartData(cData => {
            if (cData.length === 0 || Math.abs(cData[cData.length - 1].volume - next) >= 0.2 || next === 25.0) {
              return [...cData, { volume: next, potential: pot }];
            }
            return cData;
          });

          if (next >= 24.8 && next <= 25.4) {
            markLabCompleted('redox');
            setStatusMessage('Endpoint reached! Permanent faint pink color achieved at 25.00 mL. All Fe²⁺ oxidized to Fe³⁺.');
          } else if (next > 25.5) {
            setStatusMessage('Over-titrated: Excess unreduced KMnO₄ has colored the flask dark purple. Equivalence was 25.00 mL.');
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [dripRate]);

  const handleSingleDrop = () => {
    if (volumeKMnO4 >= 50.0) return;
    const next = Math.min(50.0, Number((volumeKMnO4 + 0.05).toFixed(2)));
    setVolumeKMnO4(next);
    const pot = calculatePotential(next);
    setChartData(cData => [...cData, { volume: next, potential: pot }]);

    if (next >= 24.8 && next <= 25.4) {
      markLabCompleted('redox');
      setStatusMessage('Endpoint reached! Faint pink color persists for 30 seconds.');
    }
  };

  const handleReset = () => {
    setVolumeKMnO4(0);
    setDripRate(0);
    setChartData([{ volume: 0, potential: 0.68 }]);
    setStatusMessage('Burette and flask reset to initial state.');
  };

  const handleQuickComplete = () => {
    setDripRate(0);
    setVolumeKMnO4(25.00);
    setChartData([
      { volume: 0, potential: 0.68 },
      { volume: 10, potential: 0.75 },
      { volume: 20, potential: 0.81 },
      { volume: 24.5, potential: 0.89 },
      { volume: 25.0, potential: 1.39 },
      { volume: 25.5, potential: 1.48 }
    ]);
    markLabCompleted('redox');
    setStatusMessage('Auto-titration complete. Equivalence reached at 25.00 mL.');
  };

  const flaskColor = getFlaskColor();
  const buretteRemainingHeight = Math.max(0, 100 - (volumeKMnO4 / 50) * 100);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="redox"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                <span>Experiment #3</span>
                <span>•</span>
                <span>Quantitative Redox Analysis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-purple-50/80 border border-purple-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-purple-600 flex-shrink-0" />
              <span className="text-purple-900 font-medium">
                Self-indicating titration: Deep purple KMnO₄ decolorizes in the flask until the stoichiometric endpoint (25.0 mL), where one drop gives a persistent pink color.
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Note */}
        <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 transition-all ${
          isDone ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-purple-50 text-purple-900 border border-purple-200'
        }`}>
          {isDone ? <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" /> : <AlertCircle size={20} className="text-purple-600 flex-shrink-0" />}
          <span className="font-semibold">{statusMessage}</span>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual Apparatus */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Readout bar */}
            <div className="relative z-10 flex items-center justify-between bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">KMnO₄ TITRANT:</span>
                <span className="text-sm font-mono font-extrabold text-purple-400">{volumeKMnO4.toFixed(2)} mL</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">CELL POTENTIAL:</span>
                <span className="text-sm font-mono font-extrabold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                  +{currentPotential.toFixed(2)} V
                </span>
              </div>
            </div>

            {/* Center Graphic */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-4">
              <div className="relative w-64 h-[420px] flex flex-col items-center">
                {/* Stand */}
                <div className="absolute bottom-4 left-10 w-2.5 h-[390px] bg-gradient-to-r from-slate-600 to-slate-700 rounded-full shadow-lg"></div>
                <div className="absolute bottom-2 left-4 w-40 h-5 bg-gradient-to-t from-slate-700 to-slate-500 rounded-md shadow-2xl"></div>

                {/* Clamps */}
                <div className="absolute top-16 left-11 w-14 h-3 bg-slate-500 rounded-r-sm"></div>
                <div className="absolute top-36 left-11 w-14 h-3 bg-slate-500 rounded-r-sm"></div>

                {/* Deep Purple KMnO4 Burette */}
                <div className="absolute top-2 left-24 w-8 h-56 bg-slate-200/20 rounded-t border-2 border-white/40 shadow-inner flex flex-col justify-end overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 text-[8px] font-mono text-purple-200 pointer-events-none select-none">
                    <div className="flex justify-between border-b border-purple-400/40"><span>0</span>-</div>
                    <div className="flex justify-between border-b border-purple-400/30"><span>10</span>-</div>
                    <div className="flex justify-between border-b border-purple-400/30"><span>20</span>-</div>
                    <div className="flex justify-between border-b border-purple-400/30"><span>30</span>-</div>
                    <div className="flex justify-between border-b border-purple-400/30"><span>40</span>-</div>
                    <div className="flex justify-between border-b border-purple-400/40"><span>50</span>-</div>
                  </div>
                  {/* Purple liquid column */}
                  <div
                    className="w-full bg-gradient-to-b from-purple-800 to-purple-950 transition-all duration-150 border-t-2 border-purple-400"
                    style={{ height: `${buretteRemainingHeight}%` }}
                  ></div>
                </div>

                {/* Stopcock */}
                <div className="absolute top-[230px] left-[102px] z-20 flex flex-col items-center">
                  <div className="w-4 h-5 bg-slate-400/50 border border-white/40"></div>
                  <button
                    onClick={() => setDripRate(r => (r === 0 ? 1 : 0))}
                    className={`w-9 h-3 rounded transition-transform cursor-pointer shadow-md ${
                      dripRate > 0 ? 'bg-purple-500 rotate-90 shadow-purple-500/50' : 'bg-slate-600 rotate-0'
                    }`}
                  ></button>
                  <div className="w-1.5 h-6 bg-slate-300/40 border-x border-white/50"></div>

                  {/* Falling Purple Drops */}
                  {dripRate > 0 && (
                    <div className="relative h-12 w-2 flex flex-col items-center">
                      <div className="w-1.5 h-2 bg-purple-700 rounded-full animate-bounce shadow"></div>
                      <div className="w-1.5 h-2 bg-purple-600 rounded-full animate-ping opacity-75 mt-2"></div>
                    </div>
                  )}
                </div>

                {/* Flask */}
                <div className="absolute bottom-10 left-[76px] w-28 h-36 flex flex-col items-center">
                  <div className="w-8 h-10 border-x-2 border-white/60 bg-white/10 rounded-t backdrop-blur-sm relative">
                    {/* Platinum electrode */}
                    <div className="absolute top-0 right-1 w-1.5 h-24 bg-gradient-to-b from-slate-400 to-amber-300 rounded-full shadow z-30"></div>
                  </div>
                  <div
                    className="w-28 h-24 border-2 border-white/60 rounded-b-2xl relative overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-300"
                    style={{
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                      boxShadow: flaskColor.glow
                    }}
                  >
                    <div
                      className="absolute bottom-0 w-full transition-all duration-300 flex items-center justify-center"
                      style={{
                        height: `${Math.min(95, 45 + (volumeKMnO4 / 50) * 45)}%`,
                        backgroundColor: flaskColor.bg,
                        borderColor: flaskColor.border
                      }}
                    >
                      {stirrerActive && (
                        <div className="absolute bottom-2 w-7 h-1.5 bg-white/90 rounded-full shadow animate-spin"></div>
                      )}
                    </div>
                  </div>

                  <div className="w-32 h-6 bg-slate-700 rounded-lg shadow-xl border-t border-slate-500 flex items-center justify-between px-3">
                    <span className="text-[9px] font-mono text-slate-300">MAGNETIC STIRRER</span>
                    <span className="text-[9px] font-mono text-purple-300 font-bold">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStirrerActive(!stirrerActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    stirrerActive ? 'bg-slate-700 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Stirrer {stirrerActive ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={handleSingleDrop}
                  className="px-2 py-1 text-xs font-bold rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  +1 Drop
                </button>
                <button
                  onClick={() => setDripRate(dripRate === 1 ? 0 : 1)}
                  className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                    dripRate === 1 ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {dripRate === 1 ? <Pause size={12} /> : <Play size={12} />} Slow Drip
                </button>
                <button
                  onClick={() => setDripRate(dripRate === 2 ? 0 : 2)}
                  className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                    dripRate === 2 ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {dripRate === 2 ? <Pause size={12} /> : <Play size={12} />} Fast Stream
                </button>
                <button
                  onClick={() => setDripRate(0)}
                  className="px-2 py-1 text-xs font-bold rounded text-rose-400 hover:bg-slate-700"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Recharts Redox Titration Curve & Procedure */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Redox Potential Titration Curve</h3>
                  <p className="text-[11px] text-slate-500">Cell Potential (V) vs Volume of 0.0200 M KMnO₄ (mL)</p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  V_eq = 25.0 mL
                </span>
              </div>

              <div className="h-60 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="volume" domain={[0, 50]} type="number" label={{ value: 'V_KMnO4 (mL)', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                    <YAxis domain={[0.5, 1.6]} ticks={[0.6, 0.8, 1.0, 1.2, 1.4, 1.6]} label={{ value: 'E (V)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 11 }} />
                    <Tooltip formatter={(val: number) => [`+${val} V`, 'Potential']} labelFormatter={(label) => `V(KMnO4): ${label} mL`} />
                    <ReferenceLine x={25} stroke="#a855f7" strokeDasharray="4 4" label={{ value: 'Equivalence', fill: '#a855f7', fontSize: 10 }} />
                    <Line type="monotone" dataKey="potential" stroke="#9333ea" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs flex justify-between items-center font-mono">
                <div>
                  <span className="text-purple-600 block">Stoichiometric Ratio:</span>
                  <span className="font-bold text-purple-950">1 mol MnO₄⁻ : 5 mol Fe²⁺</span>
                </div>
                <div className="text-right">
                  <span className="text-purple-600 block">Endpoint Observation:</span>
                  <span className="font-bold text-purple-900">Permanent Faint Pink</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>📋</span> Permanganometry Procedure
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2 text-emerald-700 font-semibold">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 bg-emerald-500 text-white">1</span>
                  <span>FeSO₄ acidified with 10 mL dilute H₂SO₄ to prevent MnO₂ precipitation.</span>
                </li>
                <li className={`flex items-start gap-2 ${volumeKMnO4 > 0 ? 'text-emerald-700 font-semibold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    volumeKMnO4 > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>2</span>
                  <span>Titrate 0.0200 M KMnO₄ slowly while swirling continuously.</span>
                </li>
                <li className={`flex items-start gap-2 ${isDone ? 'text-emerald-700 font-semibold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>3</span>
                  <span>Detect the self-indicating endpoint at 25.00 mL when light pink persists.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reaction Section Displayed Below Experiment Workbench */}
        <ReactionDisplay reaction={labData.reactionData} isCompleted={isDone} />
      </main>
    </div>
  );
}

