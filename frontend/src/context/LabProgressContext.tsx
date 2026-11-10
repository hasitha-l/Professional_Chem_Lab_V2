import React, { createContext, useContext, useState, useEffect } from 'react';

interface LabProgressContextType {
  completedLabs: string[];
  markLabCompleted: (id: string) => void;
  markLabIncomplete: (id: string) => void;
  isLabCompleted: (id: string) => boolean;
  resetAllProgress: () => void;
  completedCount: number;
  totalLabsCount: number;
}

const TOTAL_LABS = 10;
const STORAGE_KEY = 'vlab_completed_experiments_v2';

const LabProgressContext = createContext<LabProgressContextType | undefined>(undefined);

export const LabProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedLabs, setCompletedLabs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLabs));
    } catch (e) {
      console.error('Failed to save lab progress to localStorage', e);
    }
  }, [completedLabs]);

  const markLabCompleted = (id: string) => {
    setCompletedLabs(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const markLabIncomplete = (id: string) => {
    setCompletedLabs(prev => prev.filter(labId => labId !== id));
  };

  const isLabCompleted = (id: string) => completedLabs.includes(id);

  const resetAllProgress = () => {
    setCompletedLabs([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <LabProgressContext.Provider
      value={{
        completedLabs,
        markLabCompleted,
        markLabIncomplete,
        isLabCompleted,
        resetAllProgress,
        completedCount: completedLabs.length,
        totalLabsCount: TOTAL_LABS,
      }}
    >
      {children}
    </LabProgressContext.Provider>
  );
};

export const useLabProgress = () => {
  const context = useContext(LabProgressContext);
  if (!context) {
    throw new Error('useLabProgress must be used within a LabProgressProvider');
  }
  return context;
};

