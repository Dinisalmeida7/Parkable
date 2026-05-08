import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import {
  addHistoryEntry,
  addRating,
  EQUIPMENT,
  getParkById,
  getRatingsForPark,
  isFavorite,
  NEEDS,
  toggleFavorite,
} from '../data';
import { useTranslation } from '../i18n';

const UI = {
  background: '#F9F9F9',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F3',
  surfaceHigh: '#E8E8E8',
  text: '#1A1C1C',
  muted: '#3F4A3C',
  primary: '#1B6D24',
  primaryContainer: '#5DAC5B',
  secondary: '#005FAF',
  secondarySoft: '#D4E3FF',
  tertiary: '#CD8F00',
  error: '#BA1A1A',
  errorSoft: '#FFDAD6',
};

const clampScore = (value) => Math.min(5, Math.max(0, value));

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

const parseScore = (value) => {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return clampScore(parsed);
};

const scoreToPercent = (score) => `${Math.round((score / 5) * 100)}%`;

export default function ParkDetailsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const parkId = route.params?.parkId;
  const [park, setPark] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [overall, setOverall] = useState('');
  const [mobility, setMobility] = useState('');
  const [visual, setVisual] = useState('');
  const [auditory, setAuditory] = useState('');
  const [cognitive, setCognitive] = useState('');
  const [comment, setComment] = useState('');

  const loadDetails = useCallback(async () => {
    if (!parkId) {
      return;
    }
    setPark(getParkById(parkId));
    const [favoriteState, parkRatings] = await Promise.all([
      isFavorite(parkId),
      getRatingsForPark(parkId),
    ]);
    setFavorite(favoriteState);
    setRatings(parkRatings);
  }, [parkId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

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
    if (parkId && getParkById(parkId)) {
      addHistoryEntry(parkId);
    }
  }, [parkId]);

  const averageRating = useMemo(() => {
    if (!ratings.length) {
      return null;
    }
    const sum = ratings.reduce((acc, item) => acc + (item.overall ?? 0), 0);
    return (sum / ratings.length).toFixed(1);
  }, [ratings]);

  const distance = useMemo(
    () => (userLocation && park ? haversineDistanceKm(userLocation, park.coords) : null),
    [park, userLocation]
  );

  const handleToggleFavorite = async () => {
    if (!parkId) {
      return;
    }
    const next = await toggleFavorite(parkId);
    setFavorite(next.includes(parkId));
  };

  const handleSubmitRating = async () => {
    if (!parkId) {
      return;
    }
    const nextOverall = parseScore(overall);
    const nextComment = comment.trim();
    if (!nextOverall && !nextComment) {
      Alert.alert(t('screens.parkDetails.reviewErrorTitle'), t('screens.parkDetails.reviewErrorBody'));
      return;
    }

    await addRating({
      parkId,
      overall: nextOverall,
      mobility: parseScore(mobility),
      visual: parseScore(visual),
      auditory: parseScore(auditory),
      cognitive: parseScore(cognitive),
      comment: nextComment,
    });

    setOverall('');
    setMobility('');
    setVisual('');
    setAuditory('');
    setCognitive('');
    setComment('');
    await loadDetails();
  };

  const handleDirections = () => {
    if (!parkId) {
      return;
    }

    navigation.navigate('Tabs', {
      screen: 'Map',
      params: { parkId, mode: 'driving' },
    });
  };

  const features = useMemo(
    () =>
      EQUIPMENT.map((item) => ({
        key: item.key,
        labelKey: item.labelKey,
        value: park?.features?.[item.key],
      })),
    [park]
  );

  const needs = useMemo(
    () =>
      NEEDS.map((item) => ({
        key: item.key,
        labelKey: item.labelKey,
        value: park?.needsSupported?.[item.key],
      })),
    [park]
  );

  if (!park) {
    return (
      <View style={styles.missingContainer}>
        <Text style={styles.title}>{t('screens.parkDetails.missing')}</Text>
      </View>
    );
  }

  const communityRating = averageRating ?? park.communitySummary?.rating?.toFixed(1) ?? '0.0';

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Volta ao ecrã anterior."
        >
          <Ionicons name="arrow-back" size={22} color={UI.primary} />
        </Pressable>
        <Text style={styles.brand}>ParkAble</Text>
        <Pressable
          onPress={handleToggleFavorite}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          accessibilityHint="Atualiza a lista de locais guardados."
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={UI.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.photoCard}>
              <View style={styles.photoGradient} />
              <Ionicons name="leaf-outline" size={96} color="rgba(255,255,255,0.24)" />
              <Text style={styles.photoAltText}>Imagem ilustrativa do parque</Text>
              {item === 0 && (
                <View style={styles.photoCounter}>
                  <Text style={styles.photoCounterText}>1/3</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.hero}>
          <View style={styles.heroTitleWrap}>
            <Text style={styles.title}>{park.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={UI.secondary} />
              <Text style={styles.locationText}>
                {park.city} | {distance ? `${distance.toFixed(1)} km` : '--'}
              </Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingValue}>{communityRating}</Text>
            <Text style={styles.ratingLabel}>Avaliação</Text>
          </View>
        </View>

        {locationDenied && <Text style={styles.locationDenied}>{t('screens.search.locationDenied')}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de acessibilidade</Text>
          <Text style={styles.scoreExplanation}>
            A pontuação combina equipamentos disponíveis, necessidades suportadas e avaliações da comunidade.
          </Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <View style={styles.scoreTop}>
                <View style={styles.scoreIcon}>
                  <Ionicons name="accessibility-outline" size={22} color={UI.primary} />
                </View>
                <Text style={styles.scorePercent}>{scoreToPercent(park.accessibilityScore)}</Text>
              </View>
              <Text style={styles.scoreTitle}>Mobilidade</Text>
              <Text style={styles.scoreText}>Percursos largos, planos e fáceis de usar</Text>
            </View>
            <View style={styles.scoreCard}>
              <View style={styles.scoreTop}>
                <View style={[styles.scoreIcon, { backgroundColor: '#EDF5FF' }]}>
                  <Ionicons name="star-outline" size={22} color={UI.secondary} />
                </View>
                <Text style={[styles.scorePercent, { color: UI.secondary }]}>
                  {scoreToPercent(Number(communityRating))}
                </Text>
              </View>
              <Text style={styles.scoreTitle}>Comunidade</Text>
              <Text style={styles.scoreText}>{park.communitySummary?.count ?? ratings.length} avaliações</Text>
            </View>
            <View style={[styles.scoreCard, styles.scoreCardWide]}>
              <View style={styles.scoreWideContent}>
                <View style={[styles.scoreIcon, { backgroundColor: '#FFF4DE' }]}>
                  <Ionicons name="trail-sign-outline" size={22} color={UI.tertiary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.scoreTitle}>Equipamentos</Text>
                  <Text style={styles.scoreText}>
                    {features.filter((item) => item.value).length} equipamentos acessíveis disponíveis
                  </Text>
                </View>
                <Text style={[styles.scorePercent, { color: UI.tertiary }]}>
                  {scoreToPercent(features.filter((item) => item.value).length / features.length * 5)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('screens.parkDetails.needs')}</Text>
          <View style={styles.chipRow}>
            {needs.map((item) => (
              <View key={item.key} style={[styles.chip, { opacity: item.value ? 1 : 0.45 }]}>
                <Ionicons
                  name={item.value ? 'checkmark-circle' : 'ellipse-outline'}
                  size={15}
                  color={item.value ? UI.primary : UI.muted}
                />
                <Text style={styles.chipText}>{t(item.labelKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('screens.parkDetails.features')}</Text>
          <View style={styles.chipRow}>
            {features.map((item) => (
              <View
                key={item.key}
                style={[styles.chip, { opacity: item.value ? 1 : 0.45 }]}
              >
                <Ionicons
                  name={item.value ? 'checkmark-circle' : 'ellipse-outline'}
                  size={15}
                  color={item.value ? UI.primary : UI.muted}
                />
                <Text style={styles.chipText}>{t(item.labelKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('screens.parkDetails.alerts')}</Text>
          {park.alerts?.length ? (
            park.alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <Ionicons name="construct-outline" size={20} color={UI.error} />
                <View style={styles.flex}>
                  <Text style={styles.alertTitle}>{alert.type.toUpperCase()}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertDate}>
                    {t('screens.parkDetails.alertUntil', { date: alert.expiresAt })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{t('screens.parkDetails.alertsEmpty')}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Opiniões da comunidade</Text>
              <Text style={styles.sectionSubtitle}>{t('screens.parkDetails.lastUpdated')}: {park.lastUpdated}</Text>
            </View>
            <Text style={styles.viewAll}>{ratings.length || park.communitySummary?.count || 0}</Text>
          </View>
          {ratings.length ? (
            ratings.slice(0, 3).map((rating, index) => {
              const dateLabel = rating.createdAt
                ? new Date(rating.createdAt).toLocaleDateString()
                : t('screens.parkDetails.reviewDateUnknown');
              return (
                <View key={rating.id || `${rating.parkId}-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>U{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewName}>Utilizador ParkAble</Text>
                      <Text style={styles.reviewScore}>{rating.overall?.toFixed(1) ?? '0.0'} / 5</Text>
                    </View>
                  </View>
                  {!!rating.comment && <Text style={styles.reviewComment}>{rating.comment}</Text>}
                  <Text style={styles.reviewDate}>{dateLabel}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>{t('screens.parkDetails.reviewsEmpty')}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('screens.parkDetails.addReview')}</Text>
          <View style={styles.reviewForm}>
            <View style={styles.inputRow}>
              {[
                [overall, setOverall, t('screens.parkDetails.overall')],
                [mobility, setMobility, t('screens.parkDetails.mobility')],
                [visual, setVisual, t('screens.parkDetails.visual')],
                [auditory, setAuditory, t('screens.parkDetails.auditory')],
                [cognitive, setCognitive, t('screens.parkDetails.cognitive')],
              ].map(([value, setter, placeholder]) => (
                <TextInput
                  key={placeholder}
                  value={value}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor="#6F7A6B"
                  keyboardType="decimal-pad"
                  style={styles.scoreInput}
                  accessibilityLabel={`Pontuação de ${placeholder}`}
                  accessibilityHint="Insere um valor de zero a cinco."
                />
              ))}
            </View>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('screens.parkDetails.commentPlaceholder')}
              placeholderTextColor="#6F7A6B"
              style={styles.commentInput}
              multiline
              accessibilityLabel="Comentário da avaliação"
              accessibilityHint="Escreve informação útil sobre acessibilidade, alertas ou experiência no parque."
            />
            <Pressable
              onPress={handleSubmitRating}
              accessibilityRole="button"
              accessibilityLabel="Enviar avaliação"
              accessibilityHint="Guarda a avaliação escrita para este parque."
              style={({ pressed }) => [styles.submitButton, { opacity: pressed ? 0.9 : 1 }]}
            >
              <Text style={styles.submitText}>{t('screens.parkDetails.submitReview')}</Text>
              <Ionicons name="send-outline" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyCta}>
        <Pressable
          onPress={handleDirections}
          accessibilityRole="button"
          accessibilityLabel={`Obter direções para ${park.name}`}
          accessibilityHint="Abre o mapa com a melhor rota a partir da tua localização."
          style={({ pressed }) => [styles.directionsButton, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Ionicons name="navigate-outline" size={20} color="#FFFFFF" />
          <Text style={styles.directionsText}>{t('screens.parkDetails.directions')}</Text>
        </Pressable>
        <Pressable
          onPress={handleToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          accessibilityHint="Atualiza a lista de locais guardados."
          style={({ pressed }) => [styles.stickyFavorite, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={UI.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: UI.background,
  },
  missingContainer: {
    flex: 1,
    backgroundColor: UI.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  topBar: {
    height: 68,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  container: {
    paddingBottom: 130,
  },
  carousel: {
    paddingHorizontal: 24,
    paddingTop: 18,
    gap: 14,
  },
  photoCard: {
    width: 300,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: UI.primaryContainer,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 20,
  },
  photoGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: UI.primary,
    opacity: 0.32,
  },
  photoCounter: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  photoCounterText: {
    color: UI.text,
    fontSize: 11,
    fontWeight: '800',
  },
  photoAltText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  hero: {
    paddingHorizontal: 28,
    paddingTop: 26,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroTitleWrap: {
    flex: 1,
  },
  title: {
    color: UI.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  locationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: UI.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  ratingBox: {
    minWidth: 64,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: UI.primarySoft,
  },
  ratingValue: {
    color: UI.primary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  ratingLabel: {
    color: UI.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  locationDenied: {
    color: UI.muted,
    fontSize: 12,
    marginHorizontal: 28,
    marginTop: 8,
  },
  featurePills: {
    paddingHorizontal: 28,
    paddingTop: 20,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 34,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    color: UI.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  sectionSubtitle: {
    color: UI.muted,
    fontSize: 11,
  },
  viewAll: {
    color: UI.primary,
    fontWeight: '800',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreCard: {
    width: '48%',
    borderRadius: 22,
    padding: 18,
    backgroundColor: UI.surface,
  },
  scoreCardWide: {
    width: '100%',
  },
  scoreTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreWideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scoreIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: UI.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercent: {
    color: UI.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  scoreTitle: {
    color: UI.text,
    fontWeight: '800',
    fontSize: 14,
  },
  scoreText: {
    color: UI.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  scoreExplanation: {
    color: UI.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -6,
    marginBottom: 14,
  },
  flex: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: UI.surfaceHigh,
    minHeight: 44,
  },
  chipText: {
    color: UI.muted,
    fontWeight: '700',
    fontSize: 12,
  },
  alertCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: UI.errorSoft,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  alertTitle: {
    color: UI.error,
    fontSize: 12,
    fontWeight: '800',
  },
  alertMessage: {
    color: UI.text,
    fontSize: 13,
    marginTop: 4,
  },
  alertDate: {
    color: UI.muted,
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: UI.muted,
    fontSize: 13,
  },
  reviewCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: UI.surfaceLow,
    marginBottom: 12,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: UI.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: UI.secondary,
    fontWeight: '800',
  },
  reviewName: {
    color: UI.text,
    fontWeight: '800',
    fontSize: 13,
  },
  reviewScore: {
    color: UI.tertiary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  reviewComment: {
    color: UI.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewDate: {
    color: '#6F7A6B',
    fontSize: 11,
    marginTop: 8,
  },
  reviewForm: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: UI.surface,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreInput: {
    width: 86,
    borderRadius: 16,
    backgroundColor: UI.surfaceHigh,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: UI.text,
  },
  commentInput: {
    minHeight: 96,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: UI.surfaceHigh,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: UI.text,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 14,
    height: 50,
    borderRadius: 25,
    backgroundColor: UI.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stickyCta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(249,249,249,0.92)',
  },
  directionsButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  stickyFavorite: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
