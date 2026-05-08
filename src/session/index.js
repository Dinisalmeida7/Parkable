import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setFavorites } from '../data/favorites';

const STORAGE_KEYS = {
  onboarded: '@parkable/onboarded',
  authenticated: '@parkable/authenticated',
  profile: '@parkable/profile',
  needs: '@parkable/needs',
};

const RESET_STORAGE_ON_DEV_BOOT = __DEV__;

const SessionContext = createContext({
  isBooted: false,
  isOnboarded: false,
  isAuthenticated: false,
  profile: null,
  needs: [],
  setOnboarded: async () => {},
  setAuthenticated: async () => {},
  setNeeds: async () => {},
  registerLocalUser: async () => {},
  loginSavedUser: async () => {},
  signOut: async () => {},
});

const SAVED_LOCAL_ACCOUNT = {
  profile: {
    name: 'Dinis Almeida',
  },
  needs: ['mobility', 'auditory'],
  favorites: ['park-cidade-porto'],
};

const resetParkableStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const parkableKeys = keys.filter((key) => key.startsWith('@parkable/'));
  if (parkableKeys.length) {
    await AsyncStorage.multiRemove(parkableKeys);
  }
};

export function SessionProvider({ children }) {
  const [isBooted, setIsBooted] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [needs, setNeedsState] = useState([]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        if (RESET_STORAGE_ON_DEV_BOOT) {
          await resetParkableStorage();
        }

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

  const registerLocalUser = async ({ name, needs: selectedNeeds = [], colorBlindness = null }) => {
    const nextProfile = {
      name: name?.trim() || 'Utilizador ParkAble',
      colorBlindness,
    };
    setIsAuthenticated(true);
    setIsOnboarded(true);
    setProfile(nextProfile);
    setNeedsState(selectedNeeds);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.authenticated, 'true'),
      AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true'),
      AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile)),
      AsyncStorage.setItem(STORAGE_KEYS.needs, JSON.stringify(selectedNeeds)),
      setFavorites([]),
    ]);
  };

  const loginSavedUser = async () => {
    setIsAuthenticated(true);
    setIsOnboarded(true);
    setProfile(SAVED_LOCAL_ACCOUNT.profile);
    setNeedsState(SAVED_LOCAL_ACCOUNT.needs);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.authenticated, 'true'),
      AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true'),
      AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(SAVED_LOCAL_ACCOUNT.profile)),
      AsyncStorage.setItem(STORAGE_KEYS.needs, JSON.stringify(SAVED_LOCAL_ACCOUNT.needs)),
      setFavorites(SAVED_LOCAL_ACCOUNT.favorites),
    ]);
  };

  const signOut = async () => {
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setProfile(null);
    setNeedsState([]);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.authenticated, 'false'),
      AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'false'),
      AsyncStorage.removeItem(STORAGE_KEYS.profile),
      AsyncStorage.removeItem(STORAGE_KEYS.needs),
    ]);
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
      registerLocalUser,
      loginSavedUser,
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
