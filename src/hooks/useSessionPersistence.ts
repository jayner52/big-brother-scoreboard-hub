import { useState, useEffect, useCallback } from 'react';

interface SessionState {
  lastActivePool?: string;
  lastActiveTab?: string;
  lastScrollPosition?: { [key: string]: number };
  userPreferences?: {
    sortBy?: string;
    filterBy?: string;
    viewMode?: 'grid' | 'list';
  };
  toastPreferences?: {
    showSuccessToasts?: boolean;
    showProgressIndicators?: boolean;
  };
}

const SESSION_KEY = 'poolside-picks-session';

export function useSessionPersistence() {
  const [sessionState, setSessionState] = useState<SessionState>({});

  // Load session state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        setSessionState(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load session state:', error);
    }
  }, []);

  // Save session state whenever it changes
  const saveSessionState = useCallback((newState: Partial<SessionState>) => {
    try {
      const updated = { ...sessionState, ...newState };
      setSessionState(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save session state:', error);
    }
  }, [sessionState]);

  // Specific helper functions
  const setLastActivePool = useCallback((poolId: string) => {
    saveSessionState({ lastActivePool: poolId });
  }, [saveSessionState]);

  const setLastActiveTab = useCallback((tab: string) => {
    saveSessionState({ lastActiveTab: tab });
  }, [saveSessionState]);

  const setScrollPosition = useCallback((key: string, position: number) => {
    saveSessionState({
      lastScrollPosition: {
        ...sessionState.lastScrollPosition,
        [key]: position
      }
    });
  }, [saveSessionState, sessionState.lastScrollPosition]);

  const setUserPreferences = useCallback((preferences: Partial<SessionState['userPreferences']>) => {
    saveSessionState({
      userPreferences: {
        ...sessionState.userPreferences,
        ...preferences
      }
    });
  }, [saveSessionState, sessionState.userPreferences]);

  const getScrollPosition = useCallback((key: string): number => {
    return sessionState.lastScrollPosition?.[key] || 0;
  }, [sessionState.lastScrollPosition]);

  return {
    sessionState,
    setLastActivePool,
    setLastActiveTab,
    setScrollPosition,
    getScrollPosition,
    setUserPreferences,
    saveSessionState
  };
}