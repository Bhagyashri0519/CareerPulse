import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StudentProfile, UserSkill } from '../types';
import { api } from '../services/api';

interface AppContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  user: User | null;
  setUser: (u: User | null) => void;
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile | null) => void;
  token: string | null;
  isLoading: boolean;
  loginWithAuth: (token: string, user: User, profile?: StudentProfile | null) => void;
  refreshProfile: () => Promise<StudentProfile | null>;
  updateProfileData: (data: Partial<StudentProfile>) => Promise<StudentProfile | null>;
  updateSkillsData: (skills: Array<{ canonicalId: string; level: number; name?: string; category?: string }>) => Promise<UserSkill[] | null>;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cp_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('UI/UX Designer');
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // Restore authenticated session on mount if token is found in localStorage
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('cp_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userRes = await api.get<{ success: boolean; data: User }>('/auth/me');
        if (userRes && userRes.data) {
          setUser(userRes.data);
          setIsLoggedIn(true);
          setToken(storedToken);

          try {
            const profileRes = await api.get<{ success: boolean; data: StudentProfile }>('/profiles/me');
            if (profileRes && profileRes.data) {
              setProfile(profileRes.data);
              if (profileRes.data.weeklyLearningHours) {
                setWeeklyHours(profileRes.data.weeklyLearningHours);
              }
            }
          } catch {
            // Profile fetch optional / offline fallback
          }
        }
      } catch {
        // If token is invalid or expired, clear it
        localStorage.removeItem('cp_token');
        setToken(null);
        setIsLoggedIn(false);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  function loginWithAuth(newToken: string, newUser: User, newProfile?: StudentProfile | null) {
    localStorage.setItem('cp_token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newProfile) {
      setProfile(newProfile);
      if (newProfile.weeklyLearningHours) setWeeklyHours(newProfile.weeklyLearningHours);
    }
    setIsLoggedIn(true);
  }

  function login() {
    // Fallback demo login
    setIsLoggedIn(true);
  }

  function logout() {
    localStorage.removeItem('cp_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setIsLoggedIn(false);
  }

  async function refreshProfile(): Promise<StudentProfile | null> {
    try {
      const res = await api.get<{ success: boolean; data: StudentProfile }>('/profiles/me');
      if (res && res.data) {
        setProfile(res.data);
        if (res.data.weeklyLearningHours) setWeeklyHours(res.data.weeklyLearningHours);
        return res.data;
      }
    } catch (err) {
      console.warn('[AppContext] Could not refresh profile:', err);
    }
    return null;
  }

  async function updateProfileData(data: Partial<StudentProfile>): Promise<StudentProfile | null> {
    const res = await api.put<{ success: boolean; data: StudentProfile }>('/profiles/me', data);
    if (res && res.data) {
      setProfile(res.data);
      if (res.data.weeklyLearningHours) setWeeklyHours(res.data.weeklyLearningHours);
      return res.data;
    }
    return null;
  }

  async function updateSkillsData(
    skills: Array<{ canonicalId: string; level: number; name?: string; category?: string }>,
  ): Promise<UserSkill[] | null> {
    const res = await api.patch<{ success: boolean; data: UserSkill[] }>('/profiles/me/skills', {
      skills,
    });
    if (res && res.data) {
      if (profile) {
        setProfile({ ...profile, skills: res.data });
      }
      return res.data;
    }
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        user,
        setUser,
        profile,
        setProfile,
        token,
        isLoading,
        loginWithAuth,
        refreshProfile,
        updateProfileData,
        updateSkillsData,
        assessmentCompleted,
        setAssessmentCompleted,
        selectedCareer,
        setSelectedCareer,
        weeklyHours,
        setWeeklyHours,
        aiPanelOpen,
        setAiPanelOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
