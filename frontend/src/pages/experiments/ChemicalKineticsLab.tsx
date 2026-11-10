import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Sliders, Zap, CheckCircle2, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function ChemicalKineticsLab() {
  const labData = EXPERIMENTS_DATA['kinetics'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  // Reaction Parameters
  const [concI, setConcI] = useState<number>(0.10); // M
  const [concPersulfate, setConcPersulfate] = useState<number>(0.04); // M
  const [temperature, setTemperature] = useState<number>(25); // °C
  const [useCatalyst, setUseCatalyst] = useState<boolean>(false);

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isFlashed, setIsFlashed] = useState<boolean>(false);
  const [trialHistory, setTrialHistory] = useState<Array<{ trial: string; rate: number; time: number }>>([]);

  const isDone = isLabCompleted('kinetics');
  const timerRef = useRef<number | null>(null);

  // Time to flash calculation based on Arrhenius & 2nd order kinetics:
  // Rate = k * [S2O8^2-] * [I-]
  // k(T) = A * exp(-Ea / RT), Ea = 52 kJ/mol
  const calculateDelaySeconds = (): number => {
    const R = 8.314; // J/(mol*K)
    const T = temperature + 273.15; // K
    const Ea = useCatalyst ? 32000 : 52000; // J/mol
    const A = useCatalyst ? 5.0e4 : 1.8e7;
    const k = A * Math.exp(-Ea / (R * T));
    const rate = k * concPersulfate * concI;
    // Fixed amount of thiosulfate scavenged
    const deltaThiosulfate = 0.002;
    const time = Math.max(1.2, Number((deltaThiosulfate / rate).toFixed(1)));
    return Math.min(60, time);
  };

  const delayTarget = calculateDelaySeconds();

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
          const next = Number((prev + 0.1).toFixed(1));
          if (next >= delayTarget) {
            setIsFlashed(true);
            setIsRunning(false);
            markLabCompleted('kinetics');
            // Log trial
            setTrialHistory(th => [
              ...th,
              {
                trial: `Run ${th.length + 1} (${temperature}°C)`,
                rate: Number(((1 / next) * 100).toFixed(2)),
                time: next
              }
            ]);
          }
          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, delayTarget, temperature]);

  const handleStart = () => {
    setIsFlashed(false);
    setElapsedTime(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFlashed(false);
    setElapsedTime(0);
  };

  const handleQuickComplete = () => {
    setIsRunning(false);
    setIsFlashed(true);
    setElapsedTime(delayTarget);
    setTrialHistory([
      { trial: 'Run 1 (25°C)', rate: 12.5, time: 8.0 },
      { trial: 'Run 2 (40°C)', rate: 28.6, time: 3.5 }
    ]);
    markLabCompleted('kinetics');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="kinetics"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                <span>Experiment #6</span>
                <span>•</span>
                <span>Reaction Kinetics & Activation Energy</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-red-50/80 border border-red-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-red-600 flex-shrink-0" />
              <span className="text-red-900 font-medium">
                Mix persulfate, iodide, and thiosulfate with starch indicator. Observe the sudden blue-black color flash and measure reaction rate vs temperature and concentration.
              </span>
            </div>
          </div>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual Apparatus: Flask with Sudden Color Transition */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f87171_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Top Precision Timer Display */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/90 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 shadow-inner">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-red-400" />
                <span className="text-xs font-mono font-bold text-slate-300">DIGITAL STOPWATCH:</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-extrabold text-red-400 tracking-wider">
                  {elapsedTime.toFixed(1)} <span className="text-sm text-red-200">s</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  / Target: ~{delayTarget.toFixed(1)} s
                </span>
              </div>
            </div>

            {/* Central Graphical Reaction Flask */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <div className="relative w-72 h-[340px] flex flex-col items-center justify-end">
                {/* Erlenmeyer Flask Outline */}
                <div className="relative w-44 h-56 flex flex-col items-center">
                  {/* Flask Neck */}
                  <div className="w-12 h-14 border-x-2 border-white/60 bg-white/10 rounded-t backdrop-blur-sm"></div>

                  {/* Conical Flask Lower Body */}
                  <div
                    className="w-44 h-42 border-2 border-white/60 rounded-b-3xl relative overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-300"
                    style={{
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                      boxShadow: isFlashed ? '0 0 35px rgba(30, 58, 138, 0.9)' : 'none'
                    }}
                  >
                    {/* Solution Inside Flask */}
                    <div
                      className={`absolute bottom-0 w-full transition-all duration-300 flex items-center justify-center ${
                        isFlashed
                          ? 'bg-blue-950 border-t-2 border-blue-600 shadow-2xl'
                          : 'bg-white/20 border-t border-white/40'
                      }`}
                      style={{ height: '70%' }}
                    >
                      {/* Spinning Stir Bar */}
                      {isRunning && (
                        <div className="absolute bottom-2 w-8 h-2 bg-white/90 rounded-full shadow-sm animate-spin"></div>
                      )}

                      {/* Chemical Transition Pulse */}
                      {isFlashed && (
                        <div className="absolute inset-0 bg-blue-900/60 animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Magnetic Stirrer Base */}
                  <div className="w-48 h-8 bg-slate-700 rounded-lg shadow-2xl border-t border-slate-500 flex items-center justify-between px-3 mt-0">
                    <span className="text-[10px] font-mono text-slate-300">HEATED STIRRER</span>
                    <span className="text-[10px] font-mono text-red-300 font-bold">{temperature}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStart}
                  disabled={isRunning}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isRunning
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                  }`}
                >
                  <Play size={14} />
                  <span>{isFlashed ? 'Re-Run Clock' : 'Start Clock Reaction'}</span>
                </button>

                <button
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={!isRunning && elapsedTime === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">
                  STATUS: {isFlashed ? 'FLASH COMPLETE (I₃⁻·Starch)' : isRunning ? 'SCAVENGING (CLEAR)' : 'READY'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Kinetics Parameters & Rate Chart */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Parameters Controls */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Sliders size={16} className="text-red-600" /> Kinetics Variables
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-semibold text-slate-700">
                    <span>[I⁻] Iodide Concentration:</span>
                    <span className="font-mono text-blue-600 font-bold">{concI.toFixed(2)} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.04"
                    max="0.20"
                    step="0.02"
                    value={concI}
                    disabled={isRunning}
                    onChange={(e) => setConcI(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold text-slate-700">
                    <span>[S₂O₈²⁻] Persulfate Concentration:</span>
                    <span className="font-mono text-purple-600 font-bold">{concPersulfate.toFixed(2)} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.10"
                    step="0.01"
                    value={concPersulfate}
                    disabled={isRunning}
                    onChange={(e) => setConcPersulfate(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold text-slate-700">
                    <span>Reaction Temperature:</span>
                    <span className="font-mono text-red-600 font-bold">{temperature} °C</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="5"
                    value={temperature}
                    disabled={isRunning}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Zap size={15} className="text-amber-500" />
                    <span className="font-semibold text-slate-700">Add Fe²⁺ Redox Catalyst:</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useCatalyst}
                    disabled={isRunning}
                    onChange={(e) => setUseCatalyst(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Reaction Rate History Bar Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Relative Reaction Rate (100 / Δt)</h3>
                <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  Rate ∝ 1/Δt
                </span>
              </div>

              <div className="h-44 w-full mt-3">
                {trialHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trialHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="trial" textAnchor="end" fontSize={10} />
                      <YAxis label={{ value: 'Rate (s⁻¹)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10 }} />
                      <Tooltip formatter={(val) => [`${val} s⁻¹`, 'Rate']} />
                      <Bar dataKey="rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Run trials to plot comparative reaction rates
                  </div>
                )}
              </div>

              <div className="mt-2 text-[11px] text-slate-500 text-center font-mono">
                Rate Law: Rate = k · [S₂O₈²⁻]¹ · [I⁻]¹ (Second Order Overall)
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

