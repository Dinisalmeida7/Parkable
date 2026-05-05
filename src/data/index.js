import { parks } from './parks';
import {
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite,
  setFavorites,
  toggleFavorite,
} from './favorites';
import { addRating, getRatings, getRatingsForPark, removeRating, setRatings } from './ratings';
import { addHistoryEntry, clearHistory, getHistory, setHistory } from './history';
import {
  NEEDS,
  EQUIPMENT,
  filterByNeeds,
  filterByEquipment,
  searchByName,
  sortByAccessibility,
  sortByDistance,
} from './filters';

export const getParks = () => parks;

export const getParkById = (parkId) => parks.find((park) => park.id === parkId);

export const applyParkFilters = ({
  parksList,
  needs = [],
  equipment = [],
  query = '',
  sort = 'accessibility',
  userLocation = null,
}) => {
  let result = [...parksList];

  result = searchByName(result, query);
  result = filterByNeeds(result, needs);
  result = filterByEquipment(result, equipment);

  if (sort === 'distance') {
    result = sortByDistance(result, userLocation);
  } else {
    result = sortByAccessibility(result);
  }

  return result;
};

export { NEEDS, EQUIPMENT };
export {
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite,
  setFavorites,
  toggleFavorite,
  addRating,
  getRatings,
  getRatingsForPark,
  removeRating,
  setRatings,
  addHistoryEntry,
  clearHistory,
  getHistory,
  setHistory,
};
