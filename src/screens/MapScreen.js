import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { applyParkFilters, getParks } from '../data';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        key={`${region.latitude}-${region.longitude}`}
        showsUserLocation
        showsMyLocationButton
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
        {routePath.length > 0 && (
          <Polyline coordinates={routePath} strokeColor={colors.primary} strokeWidth={5} />
        )}
      </MapView>

      <View style={styles.header}>
        <Pressable
          onPress={routeActive ? handleExitRoute : handleBack}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.headerIcon, { color: colors.primary }]}>‹</Text>
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
      )}

      <Animated.View
        style={[
          styles.bottomSheet,
          { backgroundColor: colors.card, transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        <View {...panResponder.panHandlers}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: colors.primary }]}>
                {routeActive && selectedPark
                  ? t('screens.map.routeTitle', { name: selectedPark.name })
                  : 'Nearby Parks'}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>
                {routeActive && routeDetails
                  ? `${t('screens.map.routeSummaryDistance')}: ${routeDetails.distance || '--'} • ${t('screens.map.routeSummaryDuration')}: ${routeDetails.duration || '--'}`
                  : t('screens.map.nearbySubtitle', {
                      count: topParks.length,
                      radius: userLocation ? '2' : '-',
                    })}
              </Text>
            </View>
            {!routeActive && (
              <Pressable onPress={openSearch}>
                <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
              </Pressable>
            )}
          </View>
        </View>

        {routeActive ? (
          <View style={styles.routeHud}>
            <View style={styles.routeModes}>
              {[
                { key: 'driving', label: t('screens.map.routeDrive') },
                { key: 'walking', label: t('screens.map.routeWalk') },
                { key: 'transit', label: t('screens.map.routeTransit') },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setRouteMode(option.key)}
                  style={({ pressed }) => [
                    styles.routeChip,
                    {
                      backgroundColor:
                        routeMode === option.key ? colors.primary : colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: routeMode === option.key ? colors.card : colors.text,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {routeLoading && (
              <Text style={[styles.routeNote, { color: colors.muted }]}>
                {t('screens.map.routeLoading')}
              </Text>
            )}
            {!!routeError && !routeLoading && (
              <Text style={[styles.routeNote, { color: colors.muted }]}>
                {routeError}
              </Text>
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
                        <Text style={[styles.stepText, { color: colors.text }]}>
                          {step.label}
                        </Text>
                        <Text style={[styles.stepMeta, { color: colors.muted }]}>
                          {step.from} → {step.to}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.stepMeta, { color: colors.muted }]}>
                      {t('screens.map.routeTransitEmpty')}
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
                          {step.distance || '--'} • {step.duration || '--'}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        ) : (
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
        )}
      </Animated.View>
    </View>
  );
          setRoutePath([]);
          setRouteDetails(null);
          setRouteError(t('screens.map.routeError'));
          return;
        }
        const steps = leg?.steps ?? [];
        const stepSummaries = steps.map((step, index) => {
          const text = stripHtml(step.html_instructions || step.instructions || '');
          return {
            id: `${index}-${step.travel_mode}`,
            text,
            distance: step.distance?.text,
            duration: step.duration?.text,
            mode: step.travel_mode,
            transit: step.transit_details ?? null,
          };
        });
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
        const decoded = decodePolyline(encoded);
        setRoutePath(decoded);
        setRouteDetails({
          distance: leg?.distance?.text || '',
          duration: leg?.duration?.text || '',
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
  }, [routeMode, selectedPark, t, userLocation]);

  useEffect(() => {
    if (!routePath.length || !mapRef.current) {
      return;
    }

    mapRef.current.fitToCoordinates(routePath, {
      edgePadding: { top: 140, bottom: 320, left: 80, right: 80 },
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

  const routeActive = !!selectedParkId;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleExitRoute = () => {
    setSelectedParkId(null);
    setRoutePath([]);
    setRouteDetails(null);
    setRouteError('');
    navigation.setParams({ parkId: undefined, mode: undefined });
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        key={`${region.latitude}-${region.longitude}`}
        showsUserLocation
        showsMyLocationButton
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
        {routePath.length > 0 && (
          <Polyline coordinates={routePath} strokeColor={colors.primary} strokeWidth={5} />
        )}
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
        {selectedPark && (
          <View style={[styles.routePanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.routeTitle, { color: colors.text }]}>
              {t('screens.map.routeTitle', { name: selectedPark.name })}
            </Text>
            <View style={styles.routeModes}>
              {[
                { key: 'driving', label: t('screens.map.routeDrive') },
                { key: 'walking', label: t('screens.map.routeWalk') },
                { key: 'transit', label: t('screens.map.routeTransit') },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setRouteMode(option.key)}
                  style={({ pressed }) => [
                    styles.routeChip,
                    {
                      backgroundColor:
                        routeMode === option.key ? colors.primary : colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: routeMode === option.key ? colors.card : colors.text,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {routeLoading && (
              <Text style={[styles.routeNote, { color: colors.muted }]}>
                {t('screens.map.routeLoading')}
              </Text>
            )}
            {!!routeError && !routeLoading && (
              <Text style={[styles.routeNote, { color: colors.muted }]}>
                {routeError}
              </Text>
            )}
          </View>
        )}
      </View>

      <Animated.View
        style={[
          styles.bottomSheet,
          { backgroundColor: colors.card, transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        <View {...panResponder.panHandlers}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: colors.primary }]}>Nearby Parks</Text>
              <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>
                {t('screens.map.nearbySubtitle', {
                  count: topParks.length,
                  radius: userLocation ? '2' : '-',
                })}
              </Text>
            </View>
            <Pressable onPress={openSearch}>
              <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
            </Pressable>
          </View>
        </View>
        <FlatList
            <View style={styles.sheetTitle}>
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
  routeHud: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  routeModes: {
    flexDirection: 'row',
    gap: 8,
  },
  routeChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  routeNote: {
    fontSize: 11,
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
