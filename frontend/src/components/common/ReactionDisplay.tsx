import React from 'react';
import { ReactionData } from '../../types/lab';
import { CheckCircle2, Atom, Sparkles, BookOpen, Calculator, Flame } from 'lucide-react';

interface Props {
  reaction: ReactionData;
  isCompleted: boolean;
}

export const ReactionDisplay: React.FC<Props> = ({ reaction, isCompleted }) => {
  return (
    <div id="reaction-section" className="mt-8 transition-all duration-500">
      <div className={`rounded-2xl border ${isCompleted ? 'bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 border-emerald-300 shadow-xl shadow-emerald-500/5' : 'bg-white border-slate-200 shadow-md'} p-6 md:p-8`}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-800 text-slate-100'}`}>
              <Atom size={24} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Chemical Reaction Verified
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={13} /> Completed
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{reaction.title}</h2>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
              {reaction.reactionType}
            </span>
          </div>
        </div>

        {/* Balanced Chemical Equation - High Impact Display */}
        <div className="my-6 p-6 bg-slate-900 rounded-xl text-white shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-2">
            <Sparkles size={14} /> Overall Balanced Chemical Equation
          </div>
          <div className="text-xl md:text-2xl lg:text-3xl font-mono font-bold tracking-wide text-white py-2 overflow-x-auto whitespace-nowrap">
            {reaction.equation}
          </div>
          
          {reaction.netIonic && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Net Ionic Equation:</span>
                <span className="text-base font-mono text-emerald-300 font-bold">{reaction.netIonic}</span>
              </div>
              {reaction.enthalpy && (
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block flex items-center gap-1 md:justify-end">
                    <Flame size={12} className="text-rose-400" /> Thermodynamics:
                  </span>
                  <span className="text-sm font-mono text-amber-300 font-semibold">{reaction.enthalpy}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description & Key Takeaway */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <BookOpen size={16} className="text-blue-600" /> Molecular Mechanism & Overview
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{reaction.description}</p>
          </div>
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5">
            <div className="text-xs font-extrabold uppercase text-blue-700 tracking-wider mb-2">
              Laboratory Takeaway
            </div>
            <p className="text-sm font-semibold text-blue-900 leading-snug">{reaction.keyTakeaway}</p>
          </div>
        </div>

        {/* Step-by-Step Chemistry & Observations Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
            <span>🔬</span> Step-by-Step Chemical Progression
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                  <th className="py-3 px-4 w-1/4">Experimental Stage</th>
                  <th className="py-3 px-4 w-1/3">Physical Observation</th>
                  <th className="py-3 px-4">Chemical & Atomic Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reaction.stepsExplanation.map((step, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 text-xs">{step.step}</td>
                    <td className="py-3 px-4 text-slate-700 text-xs">{step.observation}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs leading-relaxed">{step.chemicalReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stoichiometry & Analytical Quantities */}
        {reaction.stoichiometry && reaction.stoichiometry.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
              <Calculator size={15} className="text-indigo-600" /> Stoichiometric Parameters & Constants
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {reaction.stoichiometry.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="text-[11px] font-semibold text-slate-500 truncate" title={item.label}>
                    {item.label}
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1 font-mono">
                    {item.value} <span className="text-xs font-normal text-slate-500">{item.unit || ''}</span>
                  </div>
                  {item.explanation && (
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={item.explanation}>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

