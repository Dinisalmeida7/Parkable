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
import { useRoute } from '@react-navigation/native';
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
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';

const clampScore = (value) => Math.min(5, Math.max(0, value));

const parseScore = (value) => {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return clampScore(parsed);
};

export default function ParkDetailsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const parkId = route.params?.parkId;
  const [park, setPark] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [ratings, setRatings] = useState([]);
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
    if (parkId) {
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
      Alert.alert(t('screens.parkDetails.reviewErrorTitle'),
        t('screens.parkDetails.reviewErrorBody'));
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

  const features = useMemo(
    () =>
      EQUIPMENT.map((item) => ({
        key: item.key,
        label: item.label,
        value: park?.features?.[item.key],
      })),
    [park]
  );

  const needs = useMemo(
    () =>
      NEEDS.map((item) => ({
        key: item.key,
        label: item.label,
        value: park?.needsSupported?.[item.key],
      })),
    [park]
  );

  if (!park) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('screens.parkDetails.missing')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{park.name}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{park.address}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {t('screens.parkDetails.city')}: {park.city}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {t('screens.parkDetails.lastUpdated')}: {park.lastUpdated}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('screens.parkDetails.overview')}
          </Text>
          <Pressable
            onPress={handleToggleFavorite}
            style={({ pressed }) => [
              styles.favoriteButton,
              {
                backgroundColor: favorite ? colors.primary : colors.card,
                borderColor: favorite ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={{ color: favorite ? colors.card : colors.text, fontWeight: '600' }}>
              {favorite
                ? t('screens.parkDetails.unfavorite')
                : t('screens.parkDetails.favorite')}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {t('screens.parkDetails.accessibilityScore')}
          </Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {park.accessibilityScore.toFixed(1)} / 5
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {t('screens.parkDetails.community')}
          </Text>
          <Text style={[styles.cardValue, { color: colors.accent }]}>
            {averageRating ?? park.communitySummary?.rating?.toFixed(1) ?? '0.0'} / 5
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
            {t('screens.parkDetails.communityCount', {
              count: park.communitySummary?.count ?? ratings.length,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('screens.parkDetails.features')}
        </Text>
        <View style={styles.chipRow}>
          {features.map((item) => (
            <View
              key={item.key}
              style={[
                styles.chip,
                {
                  backgroundColor: item.value ? colors.primary : colors.card,
                  borderColor: item.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={{ color: item.value ? colors.card : colors.text }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('screens.parkDetails.needs')}
        </Text>
        <View style={styles.chipRow}>
          {needs.map((item) => (
            <View
              key={item.key}
              style={[
                styles.chip,
                {
                  backgroundColor: item.value ? colors.accent : colors.card,
                  borderColor: item.value ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={{ color: item.value ? colors.text : colors.text }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('screens.parkDetails.alerts')}
        </Text>
        {park.alerts?.length ? (
          park.alerts.map((alert) => (
            <View
              key={alert.id}
              style={[styles.alertCard, { borderColor: colors.border }]}
            >
              <Text style={[styles.alertTitle, { color: colors.text }]}>
                {alert.type.toUpperCase()}
              </Text>
              <Text style={[styles.alertMessage, { color: colors.muted }]}>
                {alert.message}
              </Text>
              <Text style={[styles.alertDate, { color: colors.muted }]}>
                {t('screens.parkDetails.alertUntil', { date: alert.expiresAt })}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {t('screens.parkDetails.alertsEmpty')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('screens.parkDetails.reviews')}
        </Text>
        {ratings.length ? (
          ratings.map((rating) => {
            const dateLabel = rating.createdAt
              ? new Date(rating.createdAt).toLocaleDateString()
              : t('screens.parkDetails.reviewDateUnknown');
            return (
              <View
                key={rating.id}
                style={[styles.reviewCard, { borderColor: colors.border }]}
              >
                <Text style={[styles.reviewScore, { color: colors.primary }]}>
                  {rating.overall?.toFixed(1) ?? '0.0'} / 5
                </Text>
                {!!rating.comment && (
                  <Text style={[styles.reviewComment, { color: colors.text }]}>
                    {rating.comment}
                  </Text>
                )}
                <Text style={[styles.reviewDate, { color: colors.muted }]}>
                  {dateLabel}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {t('screens.parkDetails.reviewsEmpty')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('screens.parkDetails.addReview')}
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={overall}
            onChangeText={setOverall}
            placeholder={t('screens.parkDetails.overall')}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={[styles.scoreInput, { color: colors.text, borderColor: colors.border }]}
          />
          <TextInput
            value={mobility}
            onChangeText={setMobility}
            placeholder={t('screens.parkDetails.mobility')}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={[styles.scoreInput, { color: colors.text, borderColor: colors.border }]}
          />
          <TextInput
            value={visual}
            onChangeText={setVisual}
            placeholder={t('screens.parkDetails.visual')}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={[styles.scoreInput, { color: colors.text, borderColor: colors.border }]}
          />
          <TextInput
            value={auditory}
            onChangeText={setAuditory}
            placeholder={t('screens.parkDetails.auditory')}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={[styles.scoreInput, { color: colors.text, borderColor: colors.border }]}
          />
          <TextInput
            value={cognitive}
            onChangeText={setCognitive}
            placeholder={t('screens.parkDetails.cognitive')}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={[styles.scoreInput, { color: colors.text, borderColor: colors.border }]}
          />
        </View>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder={t('screens.parkDetails.commentPlaceholder')}
          placeholderTextColor={colors.muted}
          style={[styles.commentInput, { color: colors.text, borderColor: colors.border }]}
          multiline
        />
        <Pressable
          onPress={handleSubmitRating}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.submitText, { color: colors.card }]}>
            {t('screens.parkDetails.submitReview')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 18,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  favoriteButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertMessage: {
    fontSize: 13,
    marginTop: 6,
  },
  alertDate: {
    fontSize: 11,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  reviewScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  reviewComment: {
    marginTop: 6,
    fontSize: 13,
  },
  reviewDate: {
    marginTop: 6,
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  scoreInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 82,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
    marginTop: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
