import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getFavorites, getParkById, removeFavorite } from '../data';
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

const coverPalettes = [
  ['#8fd3c8', '#2ea86f'],
  ['#98c8ff', '#3b74f2'],
  ['#ffd39a', '#f08a30'],
  ['#b7e7b9', '#3bb07a'],
  ['#f7b7b2', '#de5c5c'],
];

const getCoverColors = (parkId) => {
  const index = Math.abs(parkId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return coverPalettes[index % coverPalettes.length];
};

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const referenceLocation = useMemo(() => ({ lat: 38.7223, lng: -9.1393 }), []);

  const loadFavorites = useCallback(async () => {
    const storedFavorites = await getFavorites();
    const validFavorites = storedFavorites.filter((id) => !!getParkById(id));
    if (validFavorites.length !== storedFavorites.length) {
      setFavoriteIds(validFavorites);
    } else {
      setFavoriteIds(storedFavorites);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const favoriteParks = useMemo(
    () => favoriteIds.map((id) => getParkById(id)).filter(Boolean),
    [favoriteIds]
  );

  const handleRemove = async (parkId) => {
    const next = await removeFavorite(parkId);
    setFavoriteIds(next);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.headerIcon, { color: colors.primary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>ParkAble</Text>
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.headerIcon, { color: colors.primary }]}>👤</Text>
        </Pressable>
      </View>

      <FlatList
        data={favoriteParks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('screens.favorites.title')}
            </Text>
            <View style={[styles.countPill, { backgroundColor: '#DFF3E7' }]}>
              <Text style={[styles.countText, { color: colors.primary }]}
              >
                {t('screens.favorites.count', { count: favoriteParks.length })}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const [topColor, bottomColor] = getCoverColors(item.id);
          const rating = item.communitySummary?.rating ?? item.accessibilityScore;
          const distance = haversineDistanceKm(referenceLocation, item.coords);
          const accessibilityLabel = item.accessibilityScore >= 4.2
            ? 'Totalmente acessivel'
            : item.accessibilityScore >= 3.4
              ? 'Boa acessibilidade'
              : 'Acesso parcial';

          return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Pressable
                onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
                style={({ pressed }) => [styles.cardPressable, { opacity: pressed ? 0.96 : 1 }]}
              >
                <View style={styles.cover}>
                  <View style={[styles.coverLayer, { backgroundColor: topColor }]} />
                  <View style={[styles.coverLayer, { backgroundColor: bottomColor, opacity: 0.9 }]} />
                  <View style={styles.coverOverlay}>
                    <View style={[styles.ratingPill, { backgroundColor: colors.card }]}>
                      <Text style={{ color: colors.accent, fontWeight: '700' }}>★</Text>
                      <Text style={{ marginLeft: 4, color: colors.text, fontWeight: '700' }}>
                        {rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                    <Pressable
                      onPress={() => handleRemove(item.id)}
                      style={({ pressed }) => [
                        styles.heartButton,
                        { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <Text style={styles.heartIcon}>❤</Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: colors.muted }]} numberOfLines={2}>
                    {item.address}
                  </Text>
                  <View style={styles.chipRow}>
                    <View style={[styles.chip, { backgroundColor: '#F2F4F6' }]}
                    >
                      <Text style={[styles.chipText, { color: colors.muted }]}>
                        {accessibilityLabel}
                      </Text>
                    </View>
                    <View style={[styles.chip, { backgroundColor: '#F2F4F6' }]}>
                      <Text style={[styles.chipText, { color: colors.muted }]}>
                        {distance ? `${distance.toFixed(1)} km` : '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {t('screens.favorites.empty')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 28,
    gap: 18,
  },
  countPill: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    marginHorizontal: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressable: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cover: {
    height: 150,
  },
  coverLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 12,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  heartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    color: '#fff',
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
  },
});
