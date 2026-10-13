import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  assessmentCompleted: boolean;
  setAssessmentCompleted: (v: boolean) => void;
  selectedCareer: string;
  setSelectedCareer: (c: string) => void;
  weeklyHours: number;
  setWeeklyHours: (h: number) => void;
  aiPanelOpen: boolean;
  setAiPanelOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('UI/UX Designer');
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <AppContext.Provider value={{
      isLoggedIn,
      login: () => setIsLoggedIn(true),
      logout: () => setIsLoggedIn(false),
      assessmentCompleted,
      setAssessmentCompleted,
      selectedCareer,
      setSelectedCareer,
      weeklyHours,
      setWeeklyHours,
      aiPanelOpen,
      setAiPanelOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
