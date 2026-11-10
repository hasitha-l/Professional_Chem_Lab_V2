import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  TestTube2,
  Flame,
  Droplet,
  Beaker,
  Zap,
  Library,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { useLabProgress } from '../context/LabProgressContext';
import { EXPERIMENTS_DATA } from '../data/experimentsData';

const ICON_MAP: Record<string, React.ElementType> = {
  Droplet,
  Flame,
  FlaskConical,
  TestTube2,
  Zap,
  Beaker
};

export default function Home() {
  const navigate = useNavigate();
  const { completedLabs, completedCount, totalLabsCount, resetAllProgress } = useLabProgress();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const experimentsList = Object.values(EXPERIMENTS_DATA);
  const completionPercentage = Math.round((completedCount / totalLabsCount) * 100);

  const filteredExperiments = experimentsList.filter(exp => {
    const isDone = completedLabs.includes(exp.id);
    if (filter === 'completed') return isDone;
    if (filter === 'pending') return !isDone;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-600/30">
              <FlaskConical size={20} />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">Pro Chemistry Laboratory</h1>
              <p className="text-[11px] text-slate-400">Interactive 3D/2D Virtual Experimentation Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
              <span className="text-slate-400">Progress:</span>
              <span className="font-bold text-emerald-400 font-mono">{completedCount} / {totalLabsCount}</span>
              <span className="text-slate-500">({completionPercentage}%)</span>
            </div>

            {completedCount > 0 && (
              <button
                onClick={resetAllProgress}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Reset completed labs history"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section & Overall Progress Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 mb-10 shadow-xl border border-slate-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles size={14} className="text-amber-300" /> All 10 Laboratory Modules Active
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                Virtual Chemistry Laboratory
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Perform all 10 core chemistry experiments in an interactive visual laboratory environment. Adjust apparatus, run real chemical processes, and inspect complete verified reaction equations, net ionic formulations, and molecular mechanisms upon completion.
              </p>
            </div>

            {/* Progress Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 min-w-[280px] w-full lg:w-auto shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Curriculum Progress</span>
                <span className="text-sm font-mono font-extrabold text-emerald-400">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-slate-600">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Completed: <strong className="text-white font-mono">{completedCount}</strong></span>
                <span>Remaining: <strong className="text-white font-mono">{totalLabsCount - completedCount}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Sandbox CTA Bar */}
        <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-300 transition-all">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex-shrink-0">
              <Library size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Open Chemistry Sandbox Mode</h3>
              <p className="text-sm text-slate-500">
                Freely drag glassware, reagents, indicators, and equipment to test custom combinations.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/sandbox')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-sm whitespace-nowrap flex items-center gap-2"
          >
            <span>Launch Sandbox</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Experiments Section Header & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Laboratory Modules (10)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select any lab to operate apparatus and reveal its chemical reaction</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All (10)
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'completed' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending ({totalLabsCount - completedCount})
            </button>
          </div>
        </div>

        {/* 10 Experiments Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((exp, index) => {
            const Icon = ICON_MAP[exp.iconName] || FlaskConical;
            const isCompleted = completedLabs.includes(exp.id);

            return (
              <div
                key={exp.id}
                onClick={() => navigate(`/experiment/${exp.id}`)}
                className={`bg-white rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-300 shadow-sm hover:shadow-md hover:border-emerald-400 bg-gradient-to-b from-white to-emerald-50/20'
                    : 'border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5'
                }`}
              >
                {/* Top Badge Row */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-105 ${exp.color}`}>
                      <Icon size={24} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        LAB #{Object.keys(EXPERIMENTS_DATA).indexOf(exp.id) + 1}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Category */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {exp.category}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {exp.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {exp.desc}
                  </p>
                </div>

                {/* Bottom Reaction Preview Pill & CTA */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-mono text-slate-500 truncate mb-3" title={exp.reactionData.equation}>
                    <span className="font-semibold text-slate-700">Rxn: </span>
                    {exp.reactionData.equation}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">{exp.duration} • {exp.difficulty}</span>
                    <span className={`flex items-center gap-1 ${isCompleted ? 'text-emerald-600 font-bold' : 'text-blue-600 font-bold group-hover:translate-x-1 transition-transform'}`}>
                      <span>{isCompleted ? 'Review Reaction' : 'Start Experiment'}</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
