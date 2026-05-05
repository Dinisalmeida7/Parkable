import AsyncStorage from '@react-native-async-storage/async-storage';

export const defaultFavorites = ['park-cidade-porto', 'park-parque-nacoes'];

const STORAGE_KEY = '@parkable/favorites';

const safeParse = (value, fallback) => {
	try {
		return value ? JSON.parse(value) : fallback;
	} catch (error) {
		return fallback;
	}
};

export const getFavorites = async () => {
	try {
		const stored = await AsyncStorage.getItem(STORAGE_KEY);
		if (stored) {
			return safeParse(stored, [...defaultFavorites]);
		}
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFavorites));
		return [...defaultFavorites];
	} catch (error) {
		return [...defaultFavorites];
	}
};

export const setFavorites = async (favorites) => {
	const normalized = Array.from(new Set(favorites));
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
	return normalized;
};

export const isFavorite = async (parkId) => {
	const favorites = await getFavorites();
	return favorites.includes(parkId);
};

export const addFavorite = async (parkId) => {
	const favorites = await getFavorites();
	if (favorites.includes(parkId)) {
		return favorites;
	}
	const next = [...favorites, parkId];
	return setFavorites(next);
};

export const removeFavorite = async (parkId) => {
	const favorites = await getFavorites();
	const next = favorites.filter((id) => id !== parkId);
	return setFavorites(next);
};

export const toggleFavorite = async (parkId) => {
	const favorites = await getFavorites();
	return favorites.includes(parkId)
		? removeFavorite(parkId)
		: addFavorite(parkId);
};
