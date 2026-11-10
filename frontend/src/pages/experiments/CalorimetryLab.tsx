import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Thermometer, Play, RotateCcw, Droplet, Flame, CheckCircle2, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function CalorimetryLab() {
  const labData = EXPERIMENTS_DATA['calorimetry'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  // State
  const [hclAdded, setHclAdded] = useState<boolean>(false);
  const [naohAdded, setNaohAdded] = useState<boolean>(false);
  const [lidSealed, setLidSealed] = useState<boolean>(false);
  const [stirrerActive, setStirrerActive] = useState<boolean>(false);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [currentTemp, setCurrentTemp] = useState<number>(22.0);
  const [chartData, setChartData] = useState<Array<{ time: number; temp: number }>>([
    { time: 0, temp: 22.0 }
  ]);

  const timerRef = useRef<number | null>(null);
  const isDone = isLabCompleted('calorimetry');

  const peakTemp = 28.7;
  const deltaT = currentTemp - 22.0;
  const heatReleasedKJ = Number(((100.0 * 4.184 * deltaT) / 1000).toFixed(2));
  const experimentalDeltaH = deltaT > 0 ? Number((-(heatReleasedKJ / 0.050)).toFixed(1)) : 0;

  useEffect(() => {
    if (isLogging) {
      timerRef.current = window.setInterval(() => {
        setChartData(prev => {
          const lastTime = prev[prev.length - 1].time;
          const nextTime = lastTime + 2;

          let nextTemp = currentTemp;
          if (nextTime <= 40) {
            // Rapid rise to peak
            nextTemp = Number((22.0 + (peakTemp - 22.0) * (1 - Math.exp(-nextTime / 10))).toFixed(2));
          } else {
            // Very slow ambient cooling
            nextTemp = Number((peakTemp - (nextTime - 40) * 0.015).toFixed(2));
          }

          setCurrentTemp(nextTemp);

          if (nextTime >= 35 && !isDone) {
            markLabCompleted('calorimetry');
          }

          if (nextTime >= 60) {
            setIsLogging(false);
          }

          return [...prev, { time: nextTime, temp: nextTemp }];
        });
      }, 300);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLogging, currentTemp]);

  const handleMixAndStart = () => {
    setHclAdded(true);
    setNaohAdded(true);
    setLidSealed(true);
    setStirrerActive(true);
    setIsLogging(true);
  };

  const handleReset = () => {
    setHclAdded(false);
    setNaohAdded(false);
    setLidSealed(false);
    setStirrerActive(false);
    setIsLogging(false);
    setCurrentTemp(22.0);
    setChartData([{ time: 0, temp: 22.0 }]);
  };

  const handleQuickComplete = () => {
    setHclAdded(true);
    setNaohAdded(true);
    setLidSealed(true);
    setStirrerActive(true);
    setIsLogging(false);
    setCurrentTemp(28.7);
    setChartData([
      { time: 0, temp: 22.0 },
      { time: 10, temp: 24.8 },
      { time: 20, temp: 27.2 },
      { time: 30, temp: 28.5 },
      { time: 40, temp: 28.7 },
      { time: 50, temp: 28.6 },
      { time: 60, temp: 28.5 }
    ]);
    markLabCompleted('calorimetry');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="calorimetry"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                <span>Experiment #8</span>
                <span>•</span>
                <span>Chemical Thermodynamics & Solution Calorimetry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-rose-50/80 border border-rose-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-rose-600 flex-shrink-0" />
              <span className="text-rose-900 font-medium">
                Combine 50.0 mL 1.0 M HCl and 50.0 mL 1.0 M NaOH inside the insulated calorimeter to log the exothermic temperature rise and calculate ΔH_neut.
              </span>
            </div>
          </div>
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Insulated Coffee Cup Calorimeter Cross-Section */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fb7185_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Readout bar */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/90 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 shadow-inner">
              <div className="flex items-center gap-2">
                <Thermometer size={18} className="text-rose-400" />
                <span className="text-xs font-mono font-bold text-slate-300">PRECISION CALORIMETER PROBE:</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-extrabold text-rose-400 tracking-wider">
                  {currentTemp.toFixed(1)} <span className="text-sm text-rose-200">°C</span>
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  ΔT: +{deltaT.toFixed(1)} °C
                </span>
              </div>
            </div>

            {/* Central Graphical Calorimeter Cross-Section */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <div className="relative w-80 h-[360px] flex flex-col items-center justify-end">
                {/* Outer Glass Beaker Housing */}
                <div className="relative w-64 h-56 border-2 border-white/50 rounded-b-2xl bg-white/5 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-end overflow-hidden">
                  {/* Expanded Polystyrene (Styrofoam) Insulating Double Cup */}
                  <div className="w-52 h-48 border-4 border-slate-200 bg-slate-100 rounded-b-xl shadow-inner flex flex-col justify-end overflow-hidden relative">
                    {/* Liquid Reaction Mixture */}
                    {(hclAdded || naohAdded) && (
                      <div
                        className="w-full bg-gradient-to-t from-blue-200/80 to-blue-100/60 border-t-2 border-blue-300 transition-all duration-700 flex flex-col items-center justify-end relative"
                        style={{ height: hclAdded && naohAdded ? '75%' : '40%' }}
                      >
                        {/* Motorized Stirrer Paddle */}
                        {stirrerActive && (
                          <div className="absolute bottom-2 w-12 h-2 bg-slate-500 rounded-full animate-spin"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Insulated Lid & Probe Assembly */}
                <div
                  className={`absolute transition-all duration-500 z-30 flex flex-col items-center ${
                    lidSealed ? 'top-10' : '-top-12 opacity-80'
                  }`}
                >
                  {/* Thermometer Probe Rod penetrating through lid */}
                  <div className="w-2 h-56 bg-gradient-to-b from-red-600 via-slate-300 to-amber-300 rounded-full shadow-lg border border-white/40 relative">
                    <div className="absolute bottom-2 inset-x-0 h-8 bg-red-500 rounded-full"></div>
                  </div>
                  {/* Cork Lid */}
                  <div className="w-56 h-7 bg-amber-800 rounded-lg shadow-xl border-2 border-amber-900 mt-[-100px] flex items-center justify-between px-4">
                    <span className="text-[9px] font-mono text-amber-200">SEALED INSULATING LID</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMixAndStart}
                  disabled={isLogging || (hclAdded && naohAdded)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    hclAdded && naohAdded
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                  }`}
                >
                  <Flame size={14} />
                  <span>Mix HCl + NaOH & Seal</span>
                </button>

                <button
                  onClick={() => setStirrerActive(!stirrerActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    stirrerActive ? 'bg-slate-700 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Stirrer {stirrerActive ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400">
                q = m · c · ΔT
              </div>
            </div>
          </div>

          {/* Right Panel: Real-time Thermogram & Thermodynamic Calculations */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Thermogram Line Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Calorimetric Thermogram</h3>
                  <p className="text-[11px] text-slate-500">Temperature (°C) vs Elapsed Time (s)</p>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Peak: 28.7°C
                </span>
              </div>

              <div className="h-52 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" domain={[0, 60]} type="number" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                    <YAxis domain={[20, 32]} ticks={[20, 22, 24, 26, 28, 30, 32]} label={{ value: 'T (°C)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 11 }} />
                    <Tooltip formatter={(val) => [`${val} °C`, 'Temp']} labelFormatter={(l) => `Time: ${l} s`} />
                    <Line type="monotone" dataKey="temp" stroke="#e11d48" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Energy Calculation Box */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Heat Released (q):</span>
                  <span className="font-bold text-slate-900">{heatReleasedKJ} kJ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Moles H₂O Formed (n):</span>
                  <span className="font-bold text-slate-900">0.0500 mol</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200 text-sm">
                  <span>ΔH_neutralization:</span>
                  <span>{experimentalDeltaH} kJ/mol</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>📋</span> Calorimetry Protocol
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2 text-emerald-700 font-semibold">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 bg-emerald-500 text-white">1</span>
                  <span>Verify initial solution temperatures are equal at 22.0°C.</span>
                </li>
                <li className={`flex items-start gap-2 ${hclAdded ? 'text-emerald-700 font-semibold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    hclAdded ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>2</span>
                  <span>Combine acid and base inside the calorimeter and immediately seal lid.</span>
                </li>
                <li className={`flex items-start gap-2 ${isDone ? 'text-emerald-700 font-semibold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>3</span>
                  <span>Stir continuously until maximum temperature peak (28.7°C) is logged.</span>
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

