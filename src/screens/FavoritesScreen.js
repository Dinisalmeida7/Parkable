import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getFavorites, getParkById, removeFavorite } from '../data';
import { useTranslation } from '../i18n';

const UI = {
  background: '#0E141B',
  surface: '#18212B',
  surfaceHigh: '#24303C',
  text: '#F7F9FB',
  muted: '#D7DED2',
  primary: '#38C88A',
  primarySoft: '#123B24',
  secondary: '#A5C8FF',
  tertiary: '#FFC86B',
};

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

const coverPalettes = [
  ['#B9E8BC', '#1B6D24'],
  ['#D4E3FF', '#005FAF'],
  ['#FFDEAC', '#CD8F00'],
  ['#A3F69C', '#5DAC5B'],
  ['#F5CBC7', '#BA1A1A'],
];

const getCoverColors = (parkId) => {
  const index = Math.abs(parkId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return coverPalettes[index % coverPalettes.length];
};

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadFavorites = useCallback(async () => {
    const storedFavorites = await getFavorites();
    const validFavorites = storedFavorites.filter((id) => !!getParkById(id));
    setFavoriteIds(validFavorites);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadLocation = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            return;
          }
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (active) {
            setUserLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
          }
        } catch (error) {
          if (active) {
            setUserLocation(null);
          }
        }
      };
      loadLocation();
      return () => {
        active = false;
      };
    }, [])
  );

  const favoriteParks = useMemo(
    () => favoriteIds.map((id) => getParkById(id)).filter(Boolean),
    [favoriteIds]
  );

  const handleRemove = async (parkId) => {
    const next = await removeFavorite(parkId);
    setFavoriteIds(next);
    setFeedback('Local removido dos favoritos');
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Pressable
            onPress={handleBack}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Volta ao ecrã anterior."
          >
            <Ionicons name="arrow-back" size={22} color={UI.primary} />
          </Pressable>
          <Text style={styles.brand}>ParkAble</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          accessibilityHint="Abre preferências e sessão."
        >
          <Ionicons name="accessibility" size={22} color={UI.primary} />
        </Pressable>
      </View>

      <FlatList
        data={favoriteParks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.title}>Locais guardados</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>
                {t('screens.favorites.count', { count: favoriteParks.length })}
              </Text>
            </View>
            {!!feedback && (
              <Text style={styles.feedbackText} accessibilityLiveRegion="polite">
                {feedback}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const [topColor, bottomColor] = getCoverColors(item.id);
          const rating = item.communitySummary?.rating ?? item.accessibilityScore;
          const distance = userLocation ? haversineDistanceKm(userLocation, item.coords) : null;
          const accessibilityLabel =
            item.accessibilityScore >= 4.2
              ? 'Totalmente acessivel'
              : item.accessibilityScore >= 3.4
                ? 'Boa acessibilidade'
                : 'Acesso parcial';

          return (
            <Pressable
              onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ficha de ${item.name}`}
              accessibilityHint="Abre detalhes, avaliações e direções deste parque."
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.96 : 1 }]}
            >
              <View style={styles.cover}>
                <View style={[styles.coverLayer, { backgroundColor: topColor }]} />
                <View style={[styles.coverLayer, { backgroundColor: bottomColor, opacity: 0.78 }]} />
                <View style={styles.coverPattern}>
                  <Ionicons name="leaf-outline" size={92} color="rgba(255,255,255,0.22)" />
                </View>
                <Pressable
                  onPress={() => handleRemove(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item.name} dos favoritos`}
                  accessibilityHint="Remove este parque da lista de locais guardados."
                  style={({ pressed }) => [styles.favoriteButton, { opacity: pressed ? 0.8 : 1 }]}
                >
                  <Ionicons name="heart" size={20} color={UI.primary} />
                </Pressable>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={13} color={UI.secondary} />
                    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {item.address}
                </Text>
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Ionicons name="accessibility-outline" size={14} color={UI.muted} />
                    <Text style={styles.chipText}>{accessibilityLabel}</Text>
                  </View>
                  <View style={styles.chip}>
                    <Ionicons name="leaf-outline" size={14} color={UI.muted} />
                    <Text style={styles.chipText}>
                      {distance ? `${distance.toFixed(1)} km` : 'Distância indisponível'}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('screens.favorites.empty')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.background,
  },
  topBar: {
    height: 68,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(14,20,27,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: UI.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: UI.text,
  },
  feedbackText: {
    marginTop: 8,
    color: UI.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
    gap: 20,
  },
  countPill: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginTop: 10,
    backgroundColor: UI.primarySoft,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: UI.primary,
  },
  card: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: UI.surface,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  cover: {
    height: 176,
    overflow: 'hidden',
  },
  coverLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverPattern: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 18,
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(24,33,43,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: UI.text,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 14,
    backgroundColor: '#17304F',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  ratingText: {
    color: UI.secondary,
    fontSize: 12,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    color: UI.muted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: UI.surfaceHigh,
    minHeight: 44,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: UI.muted,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
    color: UI.muted,
  },
});
