import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';
import { NEEDS } from '../data';
import { useSession } from '../session';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { setNeeds, setOnboarded, signOut } = useSession();
  const [selected, setSelected] = useState([]);

  const needsList = useMemo(() => NEEDS, []);

  const toggleNeed = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleContinue = async () => {
    await setNeeds(selected);
    await setOnboarded(true);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t('screens.onboarding.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {t('screens.onboarding.subtitle')}
      </Text>

      <View style={styles.chipsRow}>
        {needsList.map((need) => {
          const isActive = selected.includes(need.key);
          return (
            <Pressable
              key={need.key}
              onPress={() => toggleNeed(need.key)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: isActive ? colors.card : colors.text,
                  fontWeight: '600',
                }}
              >
                {t(need.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleContinue}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: colors.accent,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.ctaText, { color: colors.text }]}>
          {t('screens.onboarding.cta')}
        </Text>
      </Pressable>

      <Pressable onPress={signOut} style={styles.backLink}>
        <Text style={[styles.backText, { color: colors.accent }]}>
          {t('screens.onboarding.backToAuth')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  cta: {
    marginTop: 32,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
