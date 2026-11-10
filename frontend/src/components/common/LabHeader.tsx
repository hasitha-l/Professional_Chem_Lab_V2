import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, ChevronDown, Check, Sparkles, FlaskConical } from 'lucide-react';
import { EXPERIMENTS_DATA } from '../../data/experimentsData';
import { useLabProgress } from '../../context/LabProgressContext';

interface Props {
  currentLabId: string;
  onReset: () => void;
  onQuickComplete?: () => void;
  isCompleted: boolean;
}

export const LabHeader: React.FC<Props> = ({ currentLabId, onReset, onQuickComplete, isCompleted }) => {
  const navigate = useNavigate();
  const { completedLabs, totalLabsCount } = useLabProgress();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentLab = EXPERIMENTS_DATA[currentLabId];
  const completedCount = completedLabs.length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Navigation and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium"
            title="Return to Dashboard"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Labs</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          {/* Experiment Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-left transition-all border border-slate-700/60"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Lab #{Object.keys(EXPERIMENTS_DATA).indexOf(currentLabId) + 1} of 10
                </span>
                <span className="text-sm font-bold text-white max-w-[150px] sm:max-w-[240px] truncate">
                  {currentLab?.shortTitle || 'Experiment'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-2 max-h-[80vh] overflow-y-auto">
                  <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-bold">
                    <span>SELECT LABORATORY EXPERIMENT</span>
                    <span className="text-emerald-400">{completedCount}/{totalLabsCount} Done</span>
                  </div>
                  {Object.values(EXPERIMENTS_DATA).map((exp, index) => {
                    const isCurrent = exp.id === currentLabId;
                    const isDone = completedLabs.includes(exp.id);
                    return (
                      <button
                        key={exp.id}
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(`/experiment/${exp.id}`);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                          isCurrent
                            ? 'bg-blue-600/20 text-blue-300 font-bold border-l-4 border-blue-500'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-xs font-mono text-slate-500 w-5">{index + 1}.</span>
                          <span className="truncate">{exp.shortTitle}</span>
                        </div>
                        {isDone ? (
                          <Check size={16} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-500 flex-shrink-0">Pending</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center / Right: Status and Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Progress pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs text-slate-300">
            <FlaskConical size={14} className="text-blue-400" />
            <span>Progress:</span>
            <span className="font-bold text-emerald-400">{completedCount} / {totalLabsCount}</span>
          </div>

          {/* Quick complete / Demo action */}
          {onQuickComplete && !isCompleted && (
            <button
              onClick={onQuickComplete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-all shadow-sm shadow-indigo-500/20"
              title="Perform instant chemical run to inspect reaction"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span className="hidden sm:inline">Auto-Complete</span>
            </button>
          )}

          {/* Completed badge */}
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold animate-pulse">
              <CheckCircle2 size={14} />
              <span>Experiment Completed</span>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700"
            title="Reset apparatus to initial state"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset Lab</span>
          </button>
        </div>
      </div>
    </header>
  );
};

