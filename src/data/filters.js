const toRadians = (value) => (value * Math.PI) / 180;

const haversineDistanceKm = (from, to) => {
  if (!from || !to) {
    return null;
  }

  const earthRadius = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const originLat = toRadians(from.lat);
  const targetLat = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(originLat) * Math.cos(targetLat) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

export const NEEDS = [
  { key: 'mobility', labelKey: 'labels.needs.mobility' },
  { key: 'visual', labelKey: 'labels.needs.visual' },
  { key: 'auditory', labelKey: 'labels.needs.auditory' },
  { key: 'cognitive', labelKey: 'labels.needs.cognitive' },
];

export const EQUIPMENT = [
  { key: 'ramps', labelKey: 'labels.equipment.ramps' },
  { key: 'tactileFloor', labelKey: 'labels.equipment.tactileFloor' },
  { key: 'accessibleToilets', labelKey: 'labels.equipment.accessibleToilets' },
  { key: 'sensoryZone', labelKey: 'labels.equipment.sensoryZone' },
  { key: 'audioGuides', labelKey: 'labels.equipment.audioGuides' },
  { key: 'accessibleParking', labelKey: 'labels.equipment.accessibleParking' },
];

export const filterByNeeds = (parksList, needsKeys = []) => {
  if (!needsKeys.length) {
    return parksList;
  }

  return parksList.filter((park) =>
    needsKeys.every((needKey) => park.needsSupported?.[needKey])
  );
};

export const filterByEquipment = (parksList, equipmentKeys = []) => {
  if (!equipmentKeys.length) {
    return parksList;
  }

  return parksList.filter((park) =>
    equipmentKeys.every((equipmentKey) => park.features?.[equipmentKey])
  );
};

export const searchByName = (parksList, query = '') => {
  if (!query.trim()) {
    return parksList;
  }

  const normalized = query.trim().toLowerCase();
  return parksList.filter((park) => park.name.toLowerCase().includes(normalized));
};

export const sortByAccessibility = (parksList) =>
  [...parksList].sort((a, b) => b.accessibilityScore - a.accessibilityScore);

export const sortByDistance = (parksList, userLocation) =>
  [...parksList].sort((a, b) => {
    const distanceA = haversineDistanceKm(userLocation, a.coords) ?? Number.MAX_VALUE;
    const distanceB = haversineDistanceKm(userLocation, b.coords) ?? Number.MAX_VALUE;

    return distanceA - distanceB;
  });
