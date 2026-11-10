import React, { useState } from 'react';
import { Gauge, Flame, Snowflake, Sliders, CheckCircle2, RotateCcw, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function GasLawsLab() {
  const labData = EXPERIMENTS_DATA['gas-laws'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  const [mode, setMode] = useState<'boyle' | 'charles'>('boyle');
  const [volume, setVolume] = useState<number>(2.45); // L
  const [temperature, setTemperature] = useState<number>(298); // K (25°C)
  const [moles, setMoles] = useState<number>(0.10); // mol
  const [testedTrials, setTestedTrials] = useState<number>(0);

  const isDone = isLabCompleted('gas-laws');
  const R = 0.08206; // L*atm/(mol*K)

  // Ideal Gas Law: P = nRT / V
  const pressure = Number(((moles * R * temperature) / volume).toFixed(2));

  // Handle Boyle adjustment (changing volume at constant T)
  const handleVolumeChange = (newV: number) => {
    setVolume(newV);
    const count = testedTrials + 1;
    setTestedTrials(count);
    if (count >= 3) {
      markLabCompleted('gas-laws');
    }
  };

  // Handle Charles adjustment (changing temperature, expanding volume at constant P=1.00 atm)
  const handleTempChange = (newT: number) => {
    setTemperature(newT);
    if (mode === 'charles') {
      // V = nRT / P (P = 1.00 atm)
      const newV = Number(((moles * R * newT) / 1.00).toFixed(2));
      setVolume(newV);
    }
    const count = testedTrials + 1;
    setTestedTrials(count);
    if (count >= 3) {
      markLabCompleted('gas-laws');
    }
  };

  const handleReset = () => {
    setVolume(2.45);
    setTemperature(298);
    setTestedTrials(0);
  };

  const handleQuickComplete = () => {
    setVolume(1.20);
    setTemperature(350);
    setTestedTrials(4);
    markLabCompleted('gas-laws');
  };

  // Generate chart data based on active mode
  const getChartData = () => {
    if (mode === 'boyle') {
      // P vs V isotherm
      const points = [];
      for (let v = 1.0; v <= 5.0; v += 0.5) {
        points.push({
          x: v,
          p: Number(((moles * R * temperature) / v).toFixed(2))
        });
      }
      return points;
    } else {
      // V vs T isobar
      const points = [];
      for (let t = 150; t <= 500; t += 50) {
        points.push({
          x: t,
          v: Number(((moles * R * t) / 1.00).toFixed(2))
        });
      }
      return points;
    }
  };

  // Cylinder visual height: volume range is 0.8 L to 5.0 L
  const pistonHeightPercent = Math.min(90, Math.max(20, (volume / 5.0) * 100));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="gas-laws"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                <span>Experiment #9</span>
                <span>•</span>
                <span>Thermodynamics & Kinetic Molecular Theory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-sky-50/80 border border-sky-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-sky-600 flex-shrink-0" />
              <span className="text-sky-900 font-medium">
                Adjust cylinder piston volume (Boyle's Law) and thermal energy (Charles's Law) to observe particle collisions, pressure response, and the Ideal Gas Law.
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setMode('boyle');
              setTemperature(298);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'boyle'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Boyle\'s Law (Isothermal: P vs V)
          </button>
          <button
            onClick={() => {
              setMode('charles');
              setVolume(2.45);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'charles'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Charles\'s Law (Isobaric: V vs T)
          </button>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Gas Cylinder with Movable Piston & Bouncing Particles */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Readout bar */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/90 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 shadow-inner">
              <div className="flex items-center gap-3">
                <Gauge size={18} className="text-sky-400" />
                <span className="text-xs font-mono font-bold text-slate-300">PRESSURE:</span>
                <span className="text-xl font-mono font-extrabold text-sky-400">{pressure.toFixed(2)} atm</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">VOLUME: </span>
                  <span className="text-emerald-400 font-bold">{volume.toFixed(2)} L</span>
                </div>
                <div>
                  <span className="text-slate-400">TEMP: </span>
                  <span className="text-rose-400 font-bold">{temperature} K</span>
                </div>
              </div>
            </div>

            {/* Central Graphical Gas Cylinder Apparatus */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <div className="relative w-64 h-[360px] flex flex-col items-center justify-end">
                {/* Heavy Cast Base Support */}
                <div className="absolute bottom-0 w-56 h-6 bg-slate-700 rounded-b-xl shadow-2xl border-t border-slate-500"></div>

                {/* Cylinder Glass Wall */}
                <div className="relative w-44 h-72 border-2 border-white/60 rounded-t-lg bg-white/5 backdrop-blur-sm shadow-2xl flex flex-col justify-end overflow-hidden">
                  {/* Calibrated Volume Ticks on Cylinder */}
                  <div className="absolute inset-y-4 left-2 flex flex-col justify-between text-[8px] font-mono text-white/40 pointer-events-none select-none">
                    <span>- 5.0 L</span>
                    <span>- 4.0 L</span>
                    <span>- 3.0 L</span>
                    <span>- 2.0 L</span>
                    <span>- 1.0 L</span>
                  </div>

                  {/* Gas Volume Chamber with Gas Particles */}
                  <div
                    className="w-full bg-sky-950/40 border-t-4 border-slate-300 transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${pistonHeightPercent}%` }}
                  >
                    {/* Movable Airtight Piston Head */}
                    <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-md flex items-center justify-center">
                      <div className="w-4 h-12 bg-slate-400 rounded-t -translate-y-4"></div>
                    </div>

                    {/* Animated Gas Molecule Spheres (Kinetic Motion) */}
                    <div className="absolute inset-0 p-4 flex flex-wrap gap-3 items-center justify-around">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-sm shadow-cyan-400"
                          style={{
                            animation: `bounce ${Math.max(0.2, 1.2 - (temperature / 500) * 0.8)}s infinite alternate ease-in-out`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Thermal Burner Underneath */}
                {temperature > 300 && (
                  <div className="absolute bottom-6 w-16 h-8 flex justify-center items-end">
                    <div className="w-10 h-10 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full blur-xs animate-pulse opacity-80"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">
                  IDEAL GAS LAW: P · V = n · R · T
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Trials Performed: {testedTrials}
              </div>
            </div>
          </div>

          {/* Right Panel: Recharts Gas Law Graphs & Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Sliders Workbench */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Sliders size={16} className="text-sky-600" /> Physical State Variables
              </h3>

              <div className="space-y-4 text-xs">
                {mode === 'boyle' && (
                  <div>
                    <div className="flex justify-between mb-1 font-semibold text-slate-700">
                      <span>Cylinder Volume (V):</span>
                      <span className="font-mono text-emerald-600 font-bold">{volume.toFixed(2)} L</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between mb-1 font-semibold text-slate-700">
                    <span>Absolute Temperature (T):</span>
                    <span className="font-mono text-rose-600 font-bold">{temperature} K ({(temperature - 273.15).toFixed(0)}°C)</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="500"
                    step="10"
                    value={temperature}
                    onChange={(e) => handleTempChange(parseInt(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Recharts Curve */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {mode === 'boyle' ? 'P vs V Isotherm (Boyle)' : 'V vs T Isobar (Charles)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {mode === 'boyle' ? 'Pressure (atm) vs Volume (L)' : 'Volume (L) vs Temperature (K)'}
                  </p>
                </div>
              </div>

              <div className="h-48 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="x" label={{ value: mode === 'boyle' ? 'V (L)' : 'T (K)', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                    <YAxis label={{ value: mode === 'boyle' ? 'P (atm)' : 'V (L)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey={mode === 'boyle' ? 'p' : 'v'}
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 p-2.5 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900 font-mono text-center">
                P · V = {Number((pressure * volume).toFixed(2))} L·atm (Constant)
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

