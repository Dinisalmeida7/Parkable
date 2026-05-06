import AsyncStorage from '@react-native-async-storage/async-storage';

export const defaultRatings = [
  {
    id: 'rating-alfama-1',
    parkId: 'park-alfama-view',
    overall: 3.5,
    mobility: 3.0,
    visual: 4.0,
    auditory: 3.0,
    cognitive: 4.0,
    comment: 'Boa vista, mas rampas curtas.',
  },
  {
    id: 'rating-porto-1',
    parkId: 'park-cidade-porto',
    overall: 4.6,
    mobility: 4.8,
    visual: 4.5,
    auditory: 4.2,
    cognitive: 4.7,
    comment: 'Percursos largos e bem sinalizados.',
  },
  {
    id: 'rating-nacoes-1',
    parkId: 'park-parque-nacoes',
    overall: 4.9,
    mobility: 5.0,
    visual: 4.7,
    auditory: 4.8,
    cognitive: 4.9,
    comment: 'Excelente acessibilidade.',
  },
  {
    id: 'rating-pena-1',
    parkId: 'park-pena',
    overall: 2.6,
    mobility: 2.1,
    visual: 2.3,
    auditory: 3.4,
    cognitive: 2.7,
    comment: 'Bonito, mas dificil para mobilidade.',
  },
];

const STORAGE_KEY = '@parkable/ratings';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const normalizeRating = (rating) => ({
  id: rating.id || `rating-${Date.now()}-${Math.round(Math.random() * 1000)}`,
  parkId: rating.parkId,
  overall: rating.overall ?? 0,
  mobility: rating.mobility ?? 0,
  visual: rating.visual ?? 0,
  auditory: rating.auditory ?? 0,
  cognitive: rating.cognitive ?? 0,
  comment: rating.comment || '',
  createdAt: rating.createdAt || new Date().toISOString(),
});

export const getRatings = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return safeParse(stored, [...defaultRatings]);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRatings));
    return [...defaultRatings];
  } catch (error) {
    return [...defaultRatings];
  }
};

export const setRatings = async (ratings) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  return ratings;
};

export const getRatingsForPark = async (parkId) => {
  const ratings = await getRatings();
  return ratings.filter((rating) => rating.parkId === parkId);
};

export const addRating = async (rating) => {
  const ratings = await getRatings();
  const next = [normalizeRating(rating), ...ratings];
  return setRatings(next);
};

export const removeRating = async (ratingId) => {
  const ratings = await getRatings();
  const next = ratings.filter((rating) => rating.id !== ratingId);
  return setRatings(next);
};
