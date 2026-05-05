import AsyncStorage from '@react-native-async-storage/async-storage';

export const defaultHistory = [
  {
    parkId: 'park-cidade-porto',
    viewedAt: '2026-04-25T10:30:00Z',
  },
  {
    parkId: 'park-parque-nacoes',
    viewedAt: '2026-04-28T18:10:00Z',
  },
];

const STORAGE_KEY = '@parkable/history';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const getHistory = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return safeParse(stored, [...defaultHistory]);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHistory));
    return [...defaultHistory];
  } catch (error) {
    return [...defaultHistory];
  }
};

export const setHistory = async (history) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
};

export const addHistoryEntry = async (parkId, viewedAt = null) => {
  const history = await getHistory();
  const entry = {
    parkId,
    viewedAt: viewedAt || new Date().toISOString(),
  };
  const next = [entry, ...history];
  return setHistory(next);
};

export const clearHistory = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
  return [];
};
