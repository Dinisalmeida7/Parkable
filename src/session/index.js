import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  onboarded: '@parkable/onboarded',
  authenticated: '@parkable/authenticated',
  profile: '@parkable/profile',
  needs: '@parkable/needs',
};

const SessionContext = createContext({
  isBooted: false,
  isOnboarded: false,
  isAuthenticated: false,
  profile: null,
  needs: [],
  setOnboarded: async () => {},
  setAuthenticated: async () => {},
  setNeeds: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }) {
  const [isBooted, setIsBooted] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [needs, setNeedsState] = useState([]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const [storedOnboarded, storedAuth, storedProfile, storedNeeds] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.onboarded),
            AsyncStorage.getItem(STORAGE_KEYS.authenticated),
            AsyncStorage.getItem(STORAGE_KEYS.profile),
            AsyncStorage.getItem(STORAGE_KEYS.needs),
          ]);

        setIsOnboarded(storedOnboarded === 'true');
        setIsAuthenticated(storedAuth === 'true');
        setProfile(storedProfile ? JSON.parse(storedProfile) : null);
        setNeedsState(storedNeeds ? JSON.parse(storedNeeds) : []);
      } catch (error) {
        setIsOnboarded(false);
        setIsAuthenticated(false);
        setProfile(null);
        setNeedsState([]);
      } finally {
        setIsBooted(true);
      }
    };

    loadSession();
  }, []);

  const setOnboarded = async (value) => {
    setIsOnboarded(value);
    await AsyncStorage.setItem(STORAGE_KEYS.onboarded, value ? 'true' : 'false');
  };

  const setAuthenticated = async (value, nextProfile = null) => {
    setIsAuthenticated(value);
    await AsyncStorage.setItem(STORAGE_KEYS.authenticated, value ? 'true' : 'false');
    if (nextProfile) {
      setProfile(nextProfile);
      await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile));
    }
  };

  const setNeeds = async (selectedNeeds) => {
    setNeedsState(selectedNeeds);
    await AsyncStorage.setItem(STORAGE_KEYS.needs, JSON.stringify(selectedNeeds));
  };

  const signOut = async () => {
    setIsAuthenticated(false);
    await AsyncStorage.setItem(STORAGE_KEYS.authenticated, 'false');
  };

  const value = useMemo(
    () => ({
      isBooted,
      isOnboarded,
      isAuthenticated,
      profile,
      needs,
      setOnboarded,
      setAuthenticated,
      setNeeds,
      signOut,
    }),
    [isBooted, isOnboarded, isAuthenticated, profile, needs]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

export { STORAGE_KEYS };
