import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getFavorites, getParkById, removeFavorite } from '../data';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [favoriteIds, setFavoriteIds] = useState([]);

  const loadFavorites = useCallback(async () => {
    const storedFavorites = await getFavorites();
    setFavoriteIds(storedFavorites);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('screens.favorites.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {t('screens.favorites.subtitle')}
      </Text>
      <Text style={[styles.count, { color: colors.muted }]}>
        {t('screens.favorites.count', { count: favoriteParks.length })}
      </Text>

      <FlatList
        data={favoriteParks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Pressable
              onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{item.address}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleRemove(item.id)}
              style={({ pressed }) => [
                styles.removeButton,
                {
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {t('screens.favorites.remove')}
              </Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {t('screens.favorites.empty')}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  count: {
    marginTop: 8,
    fontSize: 12,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
  },
});
