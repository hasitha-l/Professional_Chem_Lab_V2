import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Droplet, Play, Pause, RotateCcw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { LabHeader } from '../../components/common/LabHeader';
import { ReactionDisplay } from '../../components/common/ReactionDisplay';
import { useLabProgress } from '../../context/LabProgressContext';

export default function AcidBaseTitrationLab() {
  const labData = EXPERIMENTS_DATA['titration'];
  const { markLabCompleted, isLabCompleted } = useLabProgress();

  // State
  const [volumeNaOH, setVolumeNaOH] = useState<number>(0);
  const [indicatorAdded, setIndicatorAdded] = useState<boolean>(false);
  const [stirrerActive, setStirrerActive] = useState<boolean>(true);
  const [dripRate, setDripRate] = useState<number>(0); // 0 = off, 1 = slow, 2 = fast
  const [chartData, setChartData] = useState<Array<{ volume: number; pH: number }>>([
    { volume: 0, pH: 1.00 }
  ]);
  const [stepNote, setStepNote] = useState<string>('Step 1: Add 2-3 drops of Phenolphthalein indicator to the conical flask containing 25.0 mL of 0.100 M HCl.');

  const intervalRef = useRef<number | null>(null);
  const isDone = isLabCompleted('titration');

  // Chemistry formula for strong acid - strong base titration pH calculation
  const calculatePH = (vAdded: number): number => {
    const vAcid = 25.0; // mL
    const cAcid = 0.100; // M
    const cBase = 0.100; // M
    const totalVolume = vAcid + vAdded; // mL

    const molesAcid = (vAcid * cAcid) / 1000;
    const molesBase = (vAdded * cBase) / 1000;

    if (vAdded === 0) return 1.00;

    if (molesBase < molesAcid) {
      // Excess acid
      const remainingMolesAcid = molesAcid - molesBase;
      const hConc = remainingMolesAcid / (totalVolume / 1000);
      return Math.max(1.00, Number((-Math.log10(hConc)).toFixed(2)));
    } else if (Math.abs(molesBase - molesAcid) < 0.000005) {
      // Equivalence point
      return 7.00;
    } else {
      // Excess base
      const excessMolesBase = molesBase - molesAcid;
      const ohConc = excessMolesBase / (totalVolume / 1000);
      const pOH = -Math.log10(ohConc);
      return Math.min(13.00, Number((14.00 - pOH).toFixed(2)));
    }
  };

  const currentPH = calculatePH(volumeNaOH);

  // Dynamic color determination based on pH & indicator
  const getFlaskLiquidColor = (): { bg: string; border: string; glow: string } => {
    if (!indicatorAdded) {
      return { bg: 'rgba(235, 245, 255, 0.35)', border: 'rgba(180, 210, 240, 0.6)', glow: 'none' };
    }
    if (currentPH < 8.2) {
      // Colorless acidic form
      if (volumeNaOH >= 24.0 && volumeNaOH < 24.9) {
        // Transient pink swirls near endpoint
        return { bg: 'rgba(255, 220, 235, 0.45)', border: 'rgba(255, 180, 210, 0.7)', glow: '0 0 10px rgba(255, 150, 200, 0.2)' };
      }
      return { bg: 'rgba(240, 248, 255, 0.4)', border: 'rgba(200, 225, 250, 0.6)', glow: 'none' };
    } else if (currentPH >= 8.2 && currentPH <= 9.5) {
      // Ideal faint pink equivalence point
      return { bg: 'rgba(255, 182, 193, 0.75)', border: 'rgba(255, 105, 180, 0.85)', glow: '0 0 20px rgba(255, 105, 180, 0.5)' };
    } else {
      // Over-titrated dark magenta
      return { bg: 'rgba(219, 39, 119, 0.85)', border: 'rgba(157, 23, 77, 0.95)', glow: '0 0 25px rgba(219, 39, 119, 0.6)' };
    }
  };

  // Titration drip loop
  useEffect(() => {
    if (dripRate > 0) {
      const increment = dripRate === 1 ? 0.1 : 0.4;
      intervalRef.current = window.setInterval(() => {
        setVolumeNaOH(prev => {
          const next = Math.min(50.0, Number((prev + increment).toFixed(2)));
          const nextPH = calculatePH(next);
          setChartData(cData => {
            if (cData.length === 0 || Math.abs(cData[cData.length - 1].volume - next) >= 0.2 || next === 25.0) {
              return [...cData, { volume: next, pH: nextPH }];
            }
            return cData;
          });

          if (next >= 24.8 && next <= 25.4 && indicatorAdded) {
            markLabCompleted('titration');
            setStepNote('Success! Endpoint reached at V = 25.00 mL. Persistent faint pink color observed. Reaction details displayed below.');
          } else if (next > 25.5) {
            setStepNote('Over-titrated: Excess NaOH has turned the solution dark magenta. Equivalence was at 25.00 mL.');
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
  }, [dripRate, indicatorAdded]);

  // Single Drop
  const handleSingleDrop = () => {
    if (volumeNaOH >= 50.0) return;
    const next = Math.min(50.0, Number((volumeNaOH + 0.05).toFixed(2)));
    setVolumeNaOH(next);
    const nextPH = calculatePH(next);
    setChartData(cData => [...cData, { volume: next, pH: nextPH }]);

    if (next >= 24.8 && next <= 25.4 && indicatorAdded) {
      markLabCompleted('titration');
      setStepNote('Success! Endpoint reached at V = 25.00 mL. Faint pink indicator observed. Reaction displayed below.');
    }
  };

  const handleAddIndicator = () => {
    setIndicatorAdded(true);
    setStepNote('Indicator added! 2 drops of Phenolphthalein in flask. Now open the burette stopcock to titrate NaOH into HCl.');
  };

  const handleReset = () => {
    setVolumeNaOH(0);
    setIndicatorAdded(false);
    setDripRate(0);
    setChartData([{ volume: 0, pH: 1.00 }]);
    setStepNote('Apparatus reset. Add phenolphthalein indicator to begin.');
  };

  const handleQuickComplete = () => {
    setIndicatorAdded(true);
    setDripRate(0);
    setVolumeNaOH(25.00);
    setChartData([
      { volume: 0, pH: 1.00 },
      { volume: 10, pH: 1.37 },
      { volume: 20, pH: 1.95 },
      { volume: 24, pH: 2.69 },
      { volume: 24.8, pH: 3.40 },
      { volume: 25.0, pH: 7.00 },
      { volume: 25.2, pH: 10.60 }
    ]);
    markLabCompleted('titration');
    setStepNote('Quick-Run complete! Perfect stoichiometric equivalence reached at 25.00 mL. Full reaction details below.');
  };

  const liquidColor = getFlaskLiquidColor();
  const buretteRemainingHeight = Math.max(0, 100 - (volumeNaOH / 50) * 100);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <LabHeader
        currentLabId="titration"
        onReset={handleReset}
        onQuickComplete={handleQuickComplete}
        isCompleted={isDone}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Lab Overview Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <span>Experiment #1</span>
                <span>•</span>
                <span>Quantitative Volumetric Analysis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{labData.title}</h1>
              <p className="text-slate-600 text-sm mt-1">{labData.desc}</p>
            </div>
            <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs">
              <Info size={18} className="text-blue-600 flex-shrink-0" />
              <span className="text-blue-900 font-medium">
                Goal: Accurately titrate 0.100 M NaOH into 25.0 mL of 0.100 M HCl to find the equivalence volume (25.0 mL) and observe the faint pink endpoint.
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Note */}
        <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 transition-all ${
          isDone ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-amber-50 text-amber-900 border border-amber-200'
        }`}>
          {isDone ? <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" /> : <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />}
          <span className="font-semibold">{stepNote}</span>
        </div>

        {/* Interactive Lab Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual Apparatus: Retort Stand, Graduated Burette, Erlenmeyer Flask */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            {/* Laboratory Tile Wall Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Top Apparatus Status Readout */}
            <div className="relative z-10 flex items-center justify-between bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-xs font-mono font-bold text-slate-300">BURETTE DISPENSING:</span>
                <span className="text-sm font-mono font-extrabold text-blue-400">{volumeNaOH.toFixed(2)} mL</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">DIGITAL pH:</span>
                <span className={`text-base font-mono font-extrabold px-2.5 py-0.5 rounded ${
                  currentPH < 7 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  currentPH === 7 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  'bg-blue-950 text-blue-300 border border-blue-800'
                }`}>
                  {currentPH.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Central Graphical Apparatus Visualization */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-4">
              <div className="relative w-64 h-[420px] flex flex-col items-center">
                {/* Heavy Cast Iron Retort Stand Base & Rod */}
                <div className="absolute bottom-4 left-10 w-2.5 h-[390px] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 rounded-full shadow-lg"></div>
                <div className="absolute bottom-2 left-4 w-40 h-5 bg-gradient-to-t from-slate-700 to-slate-500 rounded-md shadow-2xl border-t border-slate-400"></div>

                {/* Retort Clamps holding burette */}
                <div className="absolute top-16 left-11 w-14 h-3 bg-slate-500 rounded-r-sm shadow"></div>
                <div className="absolute top-36 left-11 w-14 h-3 bg-slate-500 rounded-r-sm shadow"></div>

                {/* Glass Burette Tube */}
                <div className="absolute top-2 left-24 w-8 h-56 bg-slate-200/20 rounded-t border-2 border-white/40 shadow-inner flex flex-col justify-end overflow-hidden backdrop-blur-sm">
                  {/* Graduations */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 text-[8px] font-mono text-slate-300 pointer-events-none select-none">
                    <div className="flex justify-between border-b border-white/30"><span>0</span>-</div>
                    <div className="flex justify-between border-b border-white/20"><span>10</span>-</div>
                    <div className="flex justify-between border-b border-white/20"><span>20</span>-</div>
                    <div className="flex justify-between border-b border-white/20"><span>30</span>-</div>
                    <div className="flex justify-between border-b border-white/20"><span>40</span>-</div>
                    <div className="flex justify-between border-b border-white/30"><span>50</span>-</div>
                  </div>
                  {/* Liquid inside burette */}
                  <div
                    className="w-full bg-gradient-to-b from-blue-300/60 to-blue-400/80 transition-all duration-150 border-t-2 border-blue-200/90"
                    style={{ height: `${buretteRemainingHeight}%` }}
                  ></div>
                </div>

                {/* Burette Stopcock & Nozzle */}
                <div className="absolute top-[230px] left-[102px] z-20 flex flex-col items-center">
                  <div className="w-4 h-5 bg-slate-400/50 border border-white/40"></div>
                  {/* Stopcock rotating valve */}
                  <button
                    onClick={() => setDripRate(r => (r === 0 ? 1 : 0))}
                    className={`w-9 h-3 rounded transition-transform cursor-pointer shadow-md ${
                      dripRate > 0 ? 'bg-emerald-500 rotate-90 shadow-emerald-500/50' : 'bg-rose-500 rotate-0 shadow-rose-500/50'
                    }`}
                    title="Click valve to toggle dispensing"
                  ></button>
                  <div className="w-1.5 h-6 bg-slate-300/40 border-x border-white/50"></div>

                  {/* Falling Drops Animation */}
                  {dripRate > 0 && (
                    <div className="relative h-12 w-2 flex flex-col items-center">
                      <div className="w-1.5 h-2 bg-blue-300 rounded-full animate-bounce shadow-sm shadow-blue-400"></div>
                      <div className="w-1.5 h-2 bg-blue-200 rounded-full animate-ping opacity-75 mt-2"></div>
                    </div>
                  )}
                </div>

                {/* Erlenmeyer Flask */}
                <div className="absolute bottom-10 left-[76px] w-28 h-36 flex flex-col items-center">
                  {/* Flask Neck */}
                  <div className="w-8 h-10 border-x-2 border-white/60 bg-white/10 rounded-t backdrop-blur-sm relative">
                    {/* Immersed pH Sensor Electrode Probe */}
                    <div className="absolute top-0 right-1 w-1.5 h-24 bg-gradient-to-b from-amber-400 via-slate-300 to-cyan-300 rounded-full shadow-md z-30"></div>
                  </div>
                  {/* Conical Flask Body */}
                  <div
                    className="w-28 h-24 border-2 border-white/60 rounded-b-2xl relative overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-300"
                    style={{
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                      boxShadow: liquidColor.glow
                    }}
                  >
                    {/* Solution in Flask */}
                    <div
                      className="absolute bottom-0 w-full transition-all duration-300 flex items-center justify-center"
                      style={{
                        height: `${Math.min(95, 45 + (volumeNaOH / 50) * 45)}%`,
                        backgroundColor: liquidColor.bg,
                        borderColor: liquidColor.border
                      }}
                    >
                      {/* Spinning Magnetic Stirrer Bar */}
                      {stirrerActive && (
                        <div className="absolute bottom-2 w-7 h-1.5 bg-white/90 rounded-full shadow-sm animate-spin"></div>
                      )}
                      {/* Dynamic swirling vortex ripples */}
                      {stirrerActive && (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.15)_100%)] animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  {/* Magnetic Stirrer Base Plate */}
                  <div className="w-32 h-6 bg-slate-700 rounded-lg shadow-xl border-t border-slate-500 mt-0 flex items-center justify-between px-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${stirrerActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
                      <span className="text-[9px] font-mono text-slate-300">STIRRER</span>
                    </div>
                    <span className="text-[9px] font-mono text-blue-300 font-bold">500 RPM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Lab Apparatus Quick Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddIndicator}
                  disabled={indicatorAdded}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    indicatorAdded
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 cursor-default'
                      : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30'
                  }`}
                >
                  <Droplet size={14} />
                  <span>{indicatorAdded ? 'Phenolphthalein Added ✓' : 'Add Phenolphthalein'}</span>
                </button>

                <button
                  onClick={() => setStirrerActive(!stirrerActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    stirrerActive
                      ? 'bg-slate-700 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Stirrer {stirrerActive ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Stopcock Drip Rate Selector */}
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={handleSingleDrop}
                  className="px-2 py-1 text-xs font-bold rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Deliver precisely 1 drop (0.05 mL)"
                >
                  +1 Drop
                </button>
                <button
                  onClick={() => setDripRate(dripRate === 1 ? 0 : 1)}
                  className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                    dripRate === 1 ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {dripRate === 1 ? <Pause size={12} /> : <Play size={12} />} Slow Drip
                </button>
                <button
                  onClick={() => setDripRate(dripRate === 2 ? 0 : 2)}
                  className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                    dripRate === 2 ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
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

          {/* Right Panel: Real-time Recharts Titration Curve & Laboratory Notebook */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Titration Curve */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Real-Time pH Titration Curve</h3>
                  <p className="text-[11px] text-slate-500">pH vs Volume of 0.100 M NaOH Added (mL)</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  V_eq = 25.0 mL
                </span>
              </div>

              {/* Chart */}
              <div className="h-60 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="volume"
                      domain={[0, 50]}
                      type="number"
                      label={{ value: 'V_NaOH (mL)', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 14]}
                      ticks={[0, 2, 4, 6, 7, 8, 10, 12, 14]}
                      label={{ value: 'pH', angle: -90, position: 'insideLeft', offset: 25, fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: number) => [`${val}`, 'pH']}
                      labelFormatter={(label) => `V(NaOH): ${label} mL`}
                    />
                    <ReferenceLine x={25} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Equivalence', fill: '#ef4444', fontSize: 10 }} />
                    <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="pH"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Equivalence Summary Badge */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center font-mono">
                <div>
                  <span className="text-slate-500 block">Equivalence Point:</span>
                  <span className="font-bold text-slate-800">25.00 mL (pH 7.00)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Indicator Transition:</span>
                  <span className="font-bold text-pink-600">Colorless → Pale Pink</span>
                </div>
              </div>
            </div>

            {/* Laboratory Instructions & Checklist */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span>📋</span> Titration Operating Checklist
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className={`flex items-start gap-2 ${indicatorAdded ? 'text-emerald-700 font-semibold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    indicatorAdded ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>1</span>
                  <span>Add 2–3 drops of phenolphthalein indicator to the analyte flask.</span>
                </li>
                <li className={`flex items-start gap-2 ${volumeNaOH > 0 ? 'text-emerald-700 font-semibold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    volumeNaOH > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>2</span>
                  <span>Begin titrating NaOH titrant using the slow drip or single drop controls.</span>
                </li>
                <li className={`flex items-start gap-2 ${isDone ? 'text-emerald-700 font-semibold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>3</span>
                  <span>Stop at 25.00 mL when the very first persistent pale pink color appears.</span>
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

