import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { applyParkFilters, getParks } from '../data';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';

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

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const parksList = useMemo(() => getParks(), []);
  const topParks = useMemo(
    () => applyParkFilters({ parksList, sort: 'accessibility' }).slice(0, 3),
    [parksList]
  );

  const quickFilters = useMemo(
    () => [
      { key: 'wheelchair', label: t('screens.map.quickWheelchair') },
      { key: 'tactile', label: t('screens.map.quickTactile') },
    ],
    [t]
  );

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          if (isMounted) {
            setLocationDenied(true);
          }
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setLocationDenied(true);
          }
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (isMounted) {
          setUserLocation({
            lat: current.coords.latitude,
            lng: current.coords.longitude,
          });
        }
      } catch (error) {
        if (isMounted) {
          setLocationDenied(true);
        }
      }
    };

    loadLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const region = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
      };
    }

    return {
      latitude: 39.5,
      longitude: -8.0,
      latitudeDelta: 4.8,
      longitudeDelta: 4.8,
    };
  }, [userLocation]);

  const openSearch = () => {
    navigation.navigate('Search');
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={styles.map}
        initialRegion={region}
        key={`${region.latitude}-${region.longitude}`}
      >
        {parksList.map((park) => (
          <Marker
            key={park.id}
            coordinate={{ latitude: park.coords.lat, longitude: park.coords.lng }}
            title={park.name}
            description={park.address}
            onPress={() => navigation.navigate('ParkDetails', { parkId: park.id })}
          />
        ))}
      </MapView>

      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.headerIcon, { color: colors.primary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>ParkAble</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.topOverlay}>
        {locationDenied && (
          <Text style={[styles.locationNote, { color: colors.muted }]}>
            {t('screens.map.locationDenied')}
          </Text>
        )}
        <Pressable
          onPress={openSearch}
          style={({ pressed }) => [
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: colors.muted }]}>🔍</Text>
          <Text style={[styles.searchText, { color: colors.muted }]}>
            {t('screens.map.searchPlaceholder')}
          </Text>
          <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
          <Text style={[styles.searchAction, { color: colors.accent }]}>🎤</Text>
        </Pressable>

        <View style={styles.quickRow}>
          {quickFilters.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.quickChip,
                {
                  backgroundColor: index === 0 ? colors.accent : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: index === 0 ? colors.text : colors.muted,
                  fontWeight: '700',
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}
        pointerEvents="box-none"
      >
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={[styles.sheetTitle, { color: colors.primary }]}>Nearby Parks</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.muted }]}
            >
              {t('screens.map.nearbySubtitle', {
                count: topParks.length,
                radius: userLocation ? '2' : '-'
              })}
            </Text>
          </View>
          <Pressable onPress={openSearch}>
            <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
          </Pressable>
        </View>
        <FlatList
          data={topParks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
          renderItem={({ item }) => {
            const distance = userLocation
              ? haversineDistanceKm(userLocation, item.coords)
              : null;
            return (
              <Pressable
                onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
                style={({ pressed }) => [
                  styles.parkCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                <View style={styles.cardImage}>
                  <View style={[styles.ratingPill, { backgroundColor: colors.card }]}>
                    <Text style={{ color: colors.accent, fontWeight: '700' }}>★</Text>
                    <Text style={{ marginLeft: 4, color: colors.text, fontWeight: '700' }}>
                      {item.communitySummary?.rating?.toFixed(1) ?? item.accessibilityScore.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                    <View style={[styles.distancePill, { backgroundColor: colors.border }]}>
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>
                        {distance ? `${distance.toFixed(1)} km` : '--'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                    {item.address}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 5,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 36,
  },
  topOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 4,
  },
  locationNote: {
    fontSize: 12,
    marginBottom: 10,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchText: {
    fontSize: 14,
    flex: 1,
  },
  searchDivider: {
    width: 1,
    height: 18,
  },
  searchAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    width: 54,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  sheetSubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardsRow: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 12,
  },
  parkCard: {
    width: 260,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    height: 110,
    backgroundColor: '#d9e6d8',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  cardContent: {
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 6,
  },
  distancePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
