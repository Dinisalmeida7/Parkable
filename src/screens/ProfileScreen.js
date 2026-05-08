import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NEEDS } from '../data';
import { useTranslation } from '../i18n';
import { useSession } from '../session';

const UI = {
  background: '#F9F9F9',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F3',
  surfaceHigh: '#E8E8E8',
  text: '#1A1C1C',
  muted: '#3F4A3C',
  primary: '#1B6D24',
  primarySoft: '#DFF6DC',
  secondary: '#005FAF',
  tertiary: '#CD8F00',
  error: '#BA1A1A',
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut, profile, needs } = useSession();

  const displayName = profile?.name || t('screens.profile.guest');
  const selectedNeeds = useMemo(() => NEEDS.filter((item) => needs.includes(item.key)), [needs]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>ParkAble</Text>
        <View style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color={UI.primary} />
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.subtitle}>{t('screens.profile.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="person-outline" size={22} color={UI.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{t('screens.profile.nameLabel')}</Text>
            <Text style={styles.cardSubtitle}>{displayName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: '#EDF5FF' }]}>
            <Ionicons name="accessibility-outline" size={22} color={UI.secondary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>{t('screens.profile.needsLabel')}</Text>
            <Text style={styles.cardSubtitle}>
              {selectedNeeds.length
                ? `${selectedNeeds.length} preferencias ativas`
                : t('screens.profile.needsEmpty')}
            </Text>
          </View>
        </View>
        {selectedNeeds.length ? (
          <View style={styles.chipRow}>
            {selectedNeeds.map((item) => (
              <View key={item.key} style={styles.chip}>
                <Ionicons name="checkmark-circle" size={15} color={UI.primary} />
                <Text style={styles.chipText}>{t(item.labelKey)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={signOut}
        accessibilityRole="button"
        accessibilityLabel="Sair da sessão"
        accessibilityHint="Termina a sessão e volta ao ecrã de entrada."
        style={({ pressed }) => [styles.signOut, { opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons name="log-out-outline" size={18} color={UI.error} />
        <Text style={styles.signOutText}>{t('screens.profile.signOut')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: UI.background,
  },
  container: {
    paddingBottom: 110,
  },
  topBar: {
    height: 68,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: UI.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  heroText: {
    flex: 1,
  },
  title: {
    color: UI.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: UI.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    marginHorizontal: 24,
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: UI.surface,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: UI.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: UI.text,
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: UI.muted,
    marginTop: 3,
    fontSize: 12,
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
    backgroundColor: UI.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipText: {
    color: UI.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  signOut: {
    marginHorizontal: 24,
    marginTop: 24,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFDAD6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    color: UI.error,
    fontSize: 14,
    fontWeight: '800',
  },
});
