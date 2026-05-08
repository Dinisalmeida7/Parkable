import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';
import { NEEDS } from '../data';
import { useSession } from '../session';

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
  border: '#EEEEEE',
};

const NEED_META = {
  mobility: {
    icon: 'accessibility',
    title: 'Motor Needs',
    description: 'Ramps, smooth paths and accessible routes.',
    color: UI.primaryContainer,
  },
  cognitive: {
    icon: 'sparkles-outline',
    title: 'Cognitive/Autism',
    description: 'Quiet zones, clear signs and calmer spaces.',
    color: UI.secondary,
  },
  visual: {
    icon: 'eye-outline',
    title: 'Visual Impairment',
    description: 'High contrast signs, tactile paths and audio guides.',
    color: UI.tertiary,
  },
  auditory: {
    icon: 'ear-outline',
    title: 'Hearing Impairment',
    description: 'Visual alerts and easy-to-read park information.',
    color: '#88D982',
  },
};

export default function OnboardingScreen() {
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
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={signOut} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color={UI.primary} />
        </Pressable>
        <Text style={styles.brand}>ParkAble</Text>
        <View style={styles.stepWrap}>
          <View style={styles.stepTrack}>
            <View style={styles.stepFill} />
          </View>
          <Text style={styles.stepText}>Step 2 of 3</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>What are your needs?</Text>
          <Text style={styles.subtitle}>{t('screens.onboarding.subtitle')}</Text>
        </View>

        <View style={styles.grid}>
          {needsList.map((need) => {
            const isActive = selected.includes(need.key);
            const meta = NEED_META[need.key] || NEED_META.mobility;
            return (
              <Pressable
                key={need.key}
                onPress={() => toggleNeed(need.key)}
                style={({ pressed }) => [
                  styles.needCard,
                  {
                    backgroundColor: UI.surface,
                    borderColor: isActive ? UI.primary : UI.border,
                    borderWidth: isActive ? 2 : 1,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <View style={[styles.needIcon, { backgroundColor: meta.color }]}>
                  <Ionicons name={meta.icon} size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.needTitle}>{meta.title}</Text>
                <Text style={styles.needDescription}>{meta.description}</Text>
                {isActive && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.extraSection}>
          <Text style={styles.extraLabel}>Additional Filters</Text>
          <View style={styles.extraRow}>
            <View style={[styles.extraChip, { backgroundColor: '#FFF4DE' }]}>
              <Ionicons name="paw-outline" size={16} color={UI.tertiary} />
              <Text style={[styles.extraText, { color: UI.tertiary }]}>Service Animal</Text>
            </View>
            <View style={styles.extraChip}>
              <Ionicons name="medical-outline" size={16} color={UI.muted} />
              <Text style={styles.extraText}>Changing Rooms</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={styles.ctaText}>{t('screens.onboarding.cta')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={handleContinue}>
          <Text style={styles.skipText}>I'm not sure yet, skip this step</Text>
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
  topBar: {
    height: 68,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: UI.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  stepWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  stepTrack: {
    width: 64,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: UI.surfaceHigh,
  },
  stepFill: {
    width: '66%',
    height: '100%',
    backgroundColor: UI.primary,
  },
  stepText: {
    fontSize: 10,
    color: '#6F7A6B',
    fontWeight: '700',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 150,
  },
  hero: {
    marginBottom: 28,
  },
  title: {
    color: UI.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    color: UI.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  needCard: {
    width: '47.5%',
    minHeight: 178,
    borderRadius: 24,
    padding: 18,
    position: 'relative',
  },
  needIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  needTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: UI.text,
  },
  needDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: UI.muted,
  },
  checkBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraSection: {
    marginTop: 28,
  },
  extraLabel: {
    fontSize: 11,
    color: '#6F7A6B',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  extraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  extraChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: UI.surfaceHigh,
  },
  extraText: {
    color: UI.muted,
    fontWeight: '800',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  cta: {
    height: 56,
    borderRadius: 28,
    backgroundColor: UI.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: UI.primary,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  skipText: {
    color: UI.muted,
    textAlign: 'center',
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
  },
});
