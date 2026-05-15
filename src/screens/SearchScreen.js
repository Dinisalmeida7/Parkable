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
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
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
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [filterFeedback, setFilterFeedback] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const filtersTranslateY = useRef(new Animated.Value(0)).current;
  const filtersOffset = useRef(0);
  const filtersHeight = useMemo(() => Math.round(Dimensions.get('window').height * 0.36), []);
  const filtersPeek = 72;
  const maxFiltersTranslate = Math.max(0, filtersHeight - filtersPeek);

  const parksList = useMemo(() => getParks(), []);

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
    [parksList, selectedNeeds, selectedEquipment, query, sort, userLocation]
  );

  const activeFiltersCount = selectedNeeds.length + selectedEquipment.length;

  const toggleNeed = (key) => {
    setSelectedNeeds((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
    setFilterFeedback('Filtros atualizados');
  };

  const toggleEquipment = (key) => {
    setSelectedEquipment((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
    setFilterFeedback('Filtros atualizados');
  };

  const filtersPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6,
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(
            0,
            Math.min(maxFiltersTranslate, filtersOffset.current + gesture.dy)
          );
          filtersTranslateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldCollapse =
            gesture.vy > 0.4 || filtersOffset.current + gesture.dy > maxFiltersTranslate / 2;
          const target = shouldCollapse ? maxFiltersTranslate : 0;
          filtersOffset.current = target;
          setFiltersExpanded(!shouldCollapse);
          Animated.spring(filtersTranslateY, {
            toValue: target,
            useNativeDriver: true,
          }).start();
        },
      }),
    [filtersTranslateY, maxFiltersTranslate]
  );

  useEffect(() => {
    filtersOffset.current = maxFiltersTranslate;
    filtersTranslateY.setValue(maxFiltersTranslate);
    setFiltersExpanded(false);
  }, [filtersTranslateY, maxFiltersTranslate]);

  const openFilters = () => {
    filtersOffset.current = 0;
    setFiltersExpanded(true);
    Animated.spring(filtersTranslateY, { toValue: 0, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
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
          accessibilityLabel="Pesquisar parque"
          accessibilityHint="Escreve o nome de um parque para filtrar a lista."
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('screens.search.sortTitle')}
        </Text>
        <View style={styles.sortRow}>
          <Pressable
            onPress={() => setSort('accessibility')}
            accessibilityRole="button"
            accessibilityLabel="Ordenar por acessibilidade"
            accessibilityHint="Mostra primeiro os parques com melhor acessibilidade."
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
            accessibilityRole="button"
            accessibilityLabel="Ordenar por distância"
            accessibilityHint="Mostra primeiro os parques mais próximos se a localização estiver ativa."
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
        {locationDenied && sort === 'distance' && (
          <Text style={[styles.locationNote, { color: colors.muted }]}>
            {t('screens.search.locationDenied')}
          </Text>
        )}

        <Text style={[styles.resultsTitle, { color: colors.text }]}>
          {t('screens.search.resultsCount', { count: results.length })}
        </Text>
        <Pressable
          onPress={openFilters}
          style={[styles.filtersButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Abrir filtros"
          accessibilityState={{ expanded: filtersExpanded }}
          accessibilityHint="Mostra filtros por necessidades, equipamentos e acessibilidade."
        >
          <Text style={styles.filtersButtonText}>
            {activeFiltersCount ? `Filtros ativos: ${activeFiltersCount}` : 'Abrir filtros'}
          </Text>
          <Ionicons name="chevron-up" size={18} color="#FFFFFF" />
        </Pressable>
        {!!filterFeedback && (
          <Text
            style={[styles.feedbackText, { color: colors.muted }]}
            accessibilityLiveRegion="polite"
          >
            {filterFeedback}
          </Text>
        )}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('ParkDetails', { parkId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ficha de ${item.name}`}
              accessibilityHint="Abre detalhes, avaliações e direções deste parque."
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

      <Animated.View
        style={[
          styles.filtersHud,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            height: filtersHeight,
            transform: [{ translateY: filtersTranslateY }],
          },
        ]}
      >
        <View {...filtersPanResponder.panHandlers}>
          <View style={[styles.hudHandle, { backgroundColor: colors.border }]} />
          <View style={styles.hudHeader}>
            <View>
              <Text style={[styles.hudTitle, { color: colors.text }]}>Filtros</Text>
              <Text style={[styles.hudSubtitle, { color: colors.muted }]}>
                {activeFiltersCount ? `${activeFiltersCount} ativos` : 'Sem filtros ativos'} - arrasta para fechar
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.hudContent}>
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
                  accessibilityRole="button"
                  accessibilityLabel={`${isActive ? 'Remover' : 'Adicionar'} filtro ${t(need.labelKey)}`}
                  accessibilityHint="Atualiza a lista de parques."
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderColor: isActive ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{ color: isActive ? colors.card : colors.text, fontWeight: '600' }}
                  >
                    {t(need.labelKey)}
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
                  accessibilityRole="button"
                  accessibilityLabel={`${isActive ? 'Remover' : 'Adicionar'} filtro ${t(item.labelKey)}`}
                  accessibilityHint="Atualiza a lista de parques."
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: isActive ? colors.accent : colors.card,
                      borderColor: isActive ? colors.accent : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{t(item.labelKey)}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
    marginTop: 12,
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
    minHeight: 44,
    justifyContent: 'center',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  locationNote: {
    marginTop: 8,
    fontSize: 12,
  },
  sortChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  resultsTitle: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
  },
  resultsList: {
    paddingTop: 8,
    paddingBottom: 96,
  },
  filtersButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  filtersButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  feedbackText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
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
  filtersHud: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
  },
  hudHandle: {
    width: 54,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  hudHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  hudTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  hudSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  hudContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
