import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { applyParkFilters, EQUIPMENT, getParks, NEEDS } from '../data';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [sort, setSort] = useState('accessibility');

  const parksList = useMemo(() => getParks(), []);
  const userLocation = { lat: 38.7223, lng: -9.1393 };

  const results = useMemo(
    () =>
      applyParkFilters({
        parksList,
        needs: selectedNeeds,
        equipment: selectedEquipment,
        query,
        sort,
        userLocation,
      }),
    [parksList, selectedNeeds, selectedEquipment, query, sort]
  );

  const toggleNeed = (key) => {
    setSelectedNeeds((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const toggleEquipment = (key) => {
    setSelectedEquipment((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('screens.search.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {t('screens.search.subtitle')}
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('screens.search.searchPlaceholder')}
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('screens.search.needsTitle')}
      </Text>
      <View style={styles.chipsRow}>
        {NEEDS.map((need) => {
          const isActive = selectedNeeds.includes(need.key);
          return (
            <Pressable
              key={need.key}
              onPress={() => toggleNeed(need.key)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ color: isActive ? colors.card : colors.text, fontWeight: '600' }}>
                {need.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('screens.search.equipmentTitle')}
      </Text>
      <View style={styles.chipsRow}>
        {EQUIPMENT.map((item) => {
          const isActive = selectedEquipment.includes(item.key);
          return (
            <Pressable
              key={item.key}
              onPress={() => toggleEquipment(item.key)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isActive ? colors.accent : colors.card,
                  borderColor: isActive ? colors.accent : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ color: isActive ? colors.text : colors.text, fontWeight: '600' }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('screens.search.sortTitle')}
      </Text>
      <View style={styles.sortRow}>
        <Pressable
          onPress={() => setSort('accessibility')}
          style={({ pressed }) => [
            styles.sortChip,
            {
              backgroundColor: sort === 'accessibility' ? colors.primary : colors.card,
              borderColor: sort === 'accessibility' ? colors.primary : colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: sort === 'accessibility' ? colors.card : colors.text }}>
            {t('screens.search.sortAccessibility')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSort('distance')}
          style={({ pressed }) => [
            styles.sortChip,
            {
              backgroundColor: sort === 'distance' ? colors.primary : colors.card,
              borderColor: sort === 'distance' ? colors.primary : colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: sort === 'distance' ? colors.card : colors.text }}>
            {t('screens.search.sortDistance')}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.resultsTitle, { color: colors.text }]}>
        {t('screens.search.resultsCount', { count: results.length })}
      </Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
            style={({ pressed }) => [
              styles.resultCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={[styles.resultTitle, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.resultSubtitle, { color: colors.muted }]}>{item.address}</Text>
            <Text style={[styles.resultScore, { color: colors.primary }]}>
              {item.accessibilityScore.toFixed(1)} / 5
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {t('screens.search.empty')}
          </Text>
        }
        contentContainerStyle={styles.resultsList}
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
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  sortChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  resultsTitle: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '700',
  },
  resultsList: {
    paddingVertical: 12,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultSubtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  resultScore: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
});
