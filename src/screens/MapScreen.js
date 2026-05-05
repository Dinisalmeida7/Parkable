import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { applyParkFilters, getParks } from '../data';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const parksList = useMemo(() => getParks(), []);
  const topParks = useMemo(
    () => applyParkFilters({ parksList, sort: 'accessibility' }).slice(0, 3),
    [parksList]
  );

  const region = {
    latitude: 39.5,
    longitude: -8.0,
    latitudeDelta: 4.8,
    longitudeDelta: 4.8,
  };

  const openSearch = () => {
    navigation.navigate('Search');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView style={styles.map} initialRegion={region}>
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

      <View style={[styles.overlay, { backgroundColor: colors.card }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={openSearch}
          style={({ pressed }) => [
            styles.searchBar,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.searchText, { color: colors.muted }]}>
            {t('screens.map.searchPlaceholder')}
          </Text>
          <Text style={[styles.searchAction, { color: colors.primary }]}>
            {t('screens.map.openSearch')}
          </Text>
        </Pressable>

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            {t('screens.map.quickListTitle')}
          </Text>
        </View>
        <FlatList
          data={topParks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{item.address}</Text>
              <Text style={[styles.cardScore, { color: colors.primary }]}>
                {item.accessibilityScore.toFixed(1)} / 5
              </Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchText: {
    fontSize: 14,
  },
  searchAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  listHeader: {
    marginTop: 16,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  cardScore: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  separator: {
    height: 6,
  },
});
