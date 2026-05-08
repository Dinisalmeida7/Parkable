import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { applyParkFilters, getParkById, getParks } from '../data';
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
    Math.cos(originLat) *
      Math.cos(targetLat) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const stripHtml = (value = '') => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const decodePolyline = (encoded = '') => {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = null;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
};

const getDirectionsApiKey = () =>
  Constants.expoConfig?.extra?.googleDirectionsApiKey ||
  Constants.manifest?.extra?.googleDirectionsApiKey ||
  '';

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const sheetOffset = useRef(0);

  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [selectedParkId, setSelectedParkId] = useState(route.params?.parkId ?? null);
  const [routeMode, setRouteMode] = useState(route.params?.mode ?? 'driving');
  const [routePath, setRoutePath] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  const sheetHeight = useMemo(() => Math.round(Dimensions.get('window').height * 0.36), []);
  const sheetPeek = 85;
  const maxSheetTranslate = Math.max(0, sheetHeight - sheetPeek);

  const parksList = useMemo(() => getParks(), []);
  const selectedPark = useMemo(
    () => (selectedParkId ? getParkById(selectedParkId) : null),
    [selectedParkId]
  );
  const routeActive = !!selectedPark;

  const topParks = useMemo(
    () => applyParkFilters({ parksList, sort: 'accessibility' }).slice(0, 3),
    [parksList]
  );

  useEffect(() => {
    if (route.params?.parkId) {
      setSelectedParkId(route.params.parkId);
    }
    if (route.params?.mode) {
      setRouteMode(route.params.mode);
    }
  }, [route.params?.mode, route.params?.parkId]);

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

  useEffect(() => {
    if (!routeActive || !selectedPark || !userLocation) {
      setRoutePath([]);
      setRouteDetails(null);
      return;
    }

    const apiKey = getDirectionsApiKey();
    if (!apiKey) {
      setRouteError(t('screens.map.routeMissingKey'));
      return;
    }

    const fetchDirections = async () => {
      setRouteLoading(true);
      setRouteError('');

      try {
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${selectedPark.coords.lat},${selectedPark.coords.lng}`;
        const url =
          'https://maps.googleapis.com/maps/api/directions/json' +
          `?origin=${encodeURIComponent(origin)}` +
          `&destination=${encodeURIComponent(destination)}` +
          `&mode=${encodeURIComponent(routeMode)}` +
          `&alternatives=false` +
          `&key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url);
        const data = await response.json();
        const firstRoute = data.routes?.[0];
        const leg = firstRoute?.legs?.[0];
        const encoded = firstRoute?.overview_polyline?.points;

        if (!response.ok || data.status !== 'OK' || !leg || !encoded) {
          setRoutePath([]);
          setRouteDetails(null);
          setRouteError(t('screens.map.routeError'));
          return;
        }

        const steps = leg.steps ?? [];
        const stepSummaries = steps.map((step, index) => ({
          id: `${index}-${step.travel_mode}`,
          text: stripHtml(step.html_instructions || step.instructions || ''),
          distance: step.distance?.text,
          duration: step.duration?.text,
          mode: step.travel_mode,
          transit: step.transit_details ?? null,
        }));
        const transitSteps = stepSummaries
          .filter((step) => step.mode === 'TRANSIT' && step.transit)
          .map((step) => {
            const line = step.transit.line?.short_name || step.transit.line?.name || '';
            const vehicle = step.transit.line?.vehicle?.type || 'TRANSIT';
            const from = step.transit.departure_stop?.name || '';
            const to = step.transit.arrival_stop?.name || '';

            return {
              id: step.id,
              label: `${vehicle} ${line}`.trim(),
              from,
              to,
            };
          });

        setRoutePath(decodePolyline(encoded));
        setRouteDetails({
          distance: leg.distance?.text || '',
          duration: leg.duration?.text || '',
          steps: stepSummaries,
          transitSteps,
        });
      } catch (error) {
        setRouteError(t('screens.map.routeError'));
        setRoutePath([]);
        setRouteDetails(null);
      } finally {
        setRouteLoading(false);
      }
    };

    fetchDirections();
  }, [routeActive, routeMode, selectedPark, t, userLocation]);

  useEffect(() => {
    if (!routePath.length || !mapRef.current) {
      return;
    }

    mapRef.current.fitToCoordinates(routePath, {
      edgePadding: { top: 110, bottom: 330, left: 70, right: 70 },
      animated: true,
    });
  }, [routePath]);

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

  const recenterUserLocation = async () => {
    let nextLocation = userLocation;

    if (!nextLocation) {
      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        nextLocation = {
          lat: current.coords.latitude,
          lng: current.coords.longitude,
        };
        setUserLocation(nextLocation);
      } catch (error) {
        setLocationDenied(true);
        return;
      }
    }

    mapRef.current?.animateToRegion(
      {
        latitude: nextLocation.lat,
        longitude: nextLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      450
    );
  };

  const handleBack = () => {
    if (routeActive) {
      setSelectedParkId(null);
      setRoutePath([]);
      setRouteDetails(null);
      setRouteError('');
      navigation.setParams({ parkId: undefined, mode: undefined });
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleModeChange = (mode) => {
    setRouteMode(mode);
    navigation.setParams({ parkId: selectedParkId, mode });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6,
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(0, Math.min(maxSheetTranslate, sheetOffset.current + gesture.dy));
          sheetTranslateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldHide =
            gesture.vy > 0.4 || sheetOffset.current + gesture.dy > maxSheetTranslate / 2;
          const target = shouldHide ? maxSheetTranslate : 0;
          sheetOffset.current = target;
          Animated.spring(sheetTranslateY, {
            toValue: target,
            useNativeDriver: true,
          }).start();
        },
      }),
    [maxSheetTranslate, sheetTranslateY]
  );

  const renderParkCard = ({ item }) => {
    const distance = userLocation ? haversineDistanceKm(userLocation, item.coords) : null;

    return (
      <Pressable
        onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ficha de ${item.name}`}
        accessibilityHint="Abre detalhes, avaliação, alertas e direções para este parque."
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
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{item.address}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        key={`${region.latitude}-${region.longitude}`}
        showsUserLocation
        showsMyLocationButton={!routeActive}
        accessibilityLabel="Mapa com localização atual e parques acessíveis"
      >
        {parksList.map((park) => (
          <Marker
            key={park.id}
            coordinate={{ latitude: park.coords.lat, longitude: park.coords.lng }}
            title={park.name}
            description={park.address}
            onPress={() => navigation.navigate('ParkDetails', { parkId: park.id })}
            accessibilityLabel={`Marcador de ${park.name}`}
          />
        ))}
        {routePath.length > 0 && (
          <Polyline coordinates={routePath} strokeColor={colors.primary} strokeWidth={5} />
        )}
      </MapView>

      <Pressable
        onPress={recenterUserLocation}
        accessibilityRole="button"
        accessibilityLabel="Centrar na minha localização"
        accessibilityHint="Move o mapa para a tua localização atual."
        style={({ pressed }) => [
          styles.recenterButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="locate" size={23} color={colors.primary} />
      </Pressable>

      <View style={[styles.header, routeActive && styles.routeHeader]}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={routeActive ? 'Sair das direções' : 'Voltar'}
          accessibilityHint="Volta ao ecrã anterior ou sai do modo de direções."
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.headerIcon, { color: colors.primary }]}>{'<'}</Text>
        </Pressable>
        {!routeActive ? (
          <Text style={[styles.headerTitle, { color: colors.primary }]}>ParkAble</Text>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <View style={styles.headerSpacer} />
      </View>

      {!routeActive && (
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
            <Text style={[styles.searchIcon, { color: colors.muted }]}>⌕</Text>
            <Text style={[styles.searchText, { color: colors.muted }]}>
              {t('screens.map.searchPlaceholder')}
            </Text>
            <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.searchAction, { color: colors.accent }]}>Voz</Text>
          </Pressable>

        </View>
      )}

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.card,
            height: sheetHeight,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <View {...panResponder.panHandlers}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={[styles.sheetTitle, { color: colors.primary }]}>
                {routeActive && selectedPark
                  ? t('screens.map.routeTitle', { name: selectedPark.name })
                  : 'Parques próximos'}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>
                {routeActive && routeDetails
                  ? `${t('screens.map.routeSummaryDistance')}: ${
                      routeDetails.distance || '--'
                    } | ${t('screens.map.routeSummaryDuration')}: ${
                      routeDetails.duration || '--'
                    }`
                  : t('screens.map.nearbySubtitle', {
                      count: topParks.length,
                      radius: userLocation ? '2' : '-',
                    })}
              </Text>
            </View>
            {!routeActive && (
              <Pressable
                onPress={openSearch}
                accessibilityRole="button"
                accessibilityLabel="Ver todos os parques"
                accessibilityHint="Abre a página de pesquisa e filtros."
              >
                <Text style={[styles.viewAll, { color: colors.accent }]}>Ver todos</Text>
              </Pressable>
            )}
          </View>
        </View>

        {routeActive ? (
          <ScrollView style={styles.routeHud} contentContainerStyle={styles.routeHudContent}>
            <View style={styles.routeModes}>
              {[
                { key: 'driving', label: t('screens.map.routeDrive') },
                { key: 'walking', label: t('screens.map.routeWalk') },
                { key: 'transit', label: t('screens.map.routeTransit') },
              ].map((option) => {
                const selected = routeMode === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => handleModeChange(option.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Escolher rota por ${option.label}`}
                    accessibilityHint="Atualiza o caminho e as indicações para este meio de transporte."
                    style={({ pressed }) => [
                      styles.routeChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.card,
                        borderColor: selected ? colors.primary : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? colors.card : colors.text,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {routeLoading && (
              <Text style={[styles.routeNote, { color: colors.muted }]}>
                {t('screens.map.routeLoading')}
              </Text>
            )}
            {!!routeError && !routeLoading && (
              <Text style={[styles.routeNote, { color: colors.muted }]}>{routeError}</Text>
            )}
            {!routeLoading && !routeError && (
              <>
                <Text style={[styles.stepsTitle, { color: colors.text }]}>
                  {routeMode === 'transit'
                    ? t('screens.map.routeTransitTitle')
                    : t('screens.map.routeStepsTitle')}
                </Text>
                {routeMode === 'transit' ? (
                  routeDetails?.transitSteps?.length ? (
                    routeDetails.transitSteps.map((step) => (
                      <View key={step.id} style={styles.stepRow}>
                        <Text style={[styles.stepText, { color: colors.text }]}>{step.label}</Text>
                        <Text style={[styles.stepMeta, { color: colors.muted }]}>
                          {step.from} - {step.to}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.stepMeta, { color: colors.muted }]}>
                      Rota não verificada como acessível. A API não devolveu transportes públicos confirmados para este percurso.
                    </Text>
                  )
                ) : (
                  routeDetails?.steps?.map((step) => (
                    <View key={step.id} style={styles.stepRow}>
                      <Text style={[styles.stepText, { color: colors.text }]}>
                        {step.text || t('screens.map.routeStepsTitle')}
                      </Text>
                      {(step.distance || step.duration) && (
                        <Text style={[styles.stepMeta, { color: colors.muted }]}>
                          {step.distance || '--'} | {step.duration || '--'}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={topParks}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}
            renderItem={renderParkCard}
          />
        )}
      </Animated.View>
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
  routeHeader: {
    backgroundColor: 'transparent',
  },
  recenterButton: {
    position: 'absolute',
    right: 18,
    bottom: 92,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '700',
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
    zIndex: 8,
    elevation: 8,
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
    gap: 12,
  },
  sheetHeaderText: {
    flex: 1,
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
  routeHud: {
    paddingHorizontal: 16,
  },
  routeHudContent: {
    paddingBottom: 18,
    gap: 10,
  },
  routeModes: {
    flexDirection: 'row',
    gap: 8,
  },
  routeChip: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 44,
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  routeNote: {
    fontSize: 11,
    lineHeight: 16,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepRow: {
    paddingVertical: 6,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepMeta: {
    fontSize: 11,
    marginTop: 2,
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
