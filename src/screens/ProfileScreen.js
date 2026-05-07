import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NEEDS } from '../data';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';
import { useSession } from '../session';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signOut, profile, needs } = useSession();

  const displayName = profile?.name || t('screens.profile.guest');
  const selectedNeeds = useMemo(
    () => NEEDS.filter((item) => needs.includes(item.key)),
    [needs]
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t('screens.profile.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {t('screens.profile.subtitle')}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.muted }]}>
          {t('screens.profile.nameLabel')}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>{displayName}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.muted }]}>
          {t('screens.profile.needsLabel')}
        </Text>
        {selectedNeeds.length ? (
          <View style={styles.chipRow}>
            {selectedNeeds.map((item) => (
              <View
                key={item.key}
                style={[
                  styles.chip,
                  { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {t(item.labelKey)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {t('screens.profile.needsEmpty')}
          </Text>
        )}
      </View>

      <Pressable
        onPress={signOut}
        style={({ pressed }) => [
          styles.signOut,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.signOutText, { color: colors.text }]}>
          {t('screens.profile.signOut')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  card: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
  },
  signOut: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
