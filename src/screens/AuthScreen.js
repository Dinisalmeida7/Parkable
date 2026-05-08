import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';
import { useSession } from '../session';

const UI = {
  background: '#F9F9F9',
  surface: '#FFFFFF',
  surfaceHigh: '#E8E8E8',
  text: '#1A1C1C',
  muted: '#3F4A3C',
  primary: '#1B6D24',
  primarySoft: '#DFF6DC',
  secondary: '#005FAF',
  tertiary: '#CD8F00',
  border: '#EEEEEE',
};

export default function AuthScreen() {
  const { t } = useTranslation();
  const { setAuthenticated } = useSession();
  const [name, setName] = useState('');

  const handleLogin = async () => {
    const displayName = name.trim() || t('screens.profile.guest');
    await setAuthenticated(true, { name: displayName });
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.brand}>
        <View style={styles.logoBox}>
          <Ionicons name="leaf" size={44} color={UI.primary} />
        </View>
        <Text style={styles.brandTitle}>ParkAble</Text>
        <Text style={styles.brandSubtitle}>Access nature's sanctuary, for everyone.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('screens.auth.inputLabel')}</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={20} color={UI.muted} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('screens.auth.inputLabel')}
            placeholderTextColor="#7A8376"
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={styles.ctaText}>{t('screens.auth.cta')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.divider} />
        <Text style={styles.helper}>Don't have an account?</Text>
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [styles.secondaryCta, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.secondaryText}>{t('screens.auth.skip')}</Text>
        </Pressable>
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Ionicons name="accessibility" size={16} color={UI.muted} />
          <Text style={styles.trustText}>Inclusive</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color={UI.muted} />
          <Text style={styles.trustText}>Secure</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="leaf-outline" size={16} color={UI.muted} />
          <Text style={styles.trustText}>Eco-friendly</Text>
        </View>
      </View>
      <View style={styles.bottomStripe} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.background,
    padding: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: UI.primarySoft,
    opacity: 0.7,
  },
  glowBottom: {
    position: 'absolute',
    right: -170,
    top: 270,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#D4E3FF',
    opacity: 0.35,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 42,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: UI.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: UI.primary,
  },
  brandSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: UI.muted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  label: {
    marginLeft: 8,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    color: UI.muted,
  },
  inputWrap: {
    height: 56,
    borderRadius: 16,
    backgroundColor: UI.surfaceHigh,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    color: UI.text,
    fontSize: 16,
  },
  cta: {
    height: 56,
    marginTop: 22,
    borderRadius: 28,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: UI.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: UI.border,
    marginVertical: 24,
  },
  helper: {
    textAlign: 'center',
    color: UI.muted,
    fontSize: 13,
  },
  secondaryCta: {
    alignSelf: 'center',
    marginTop: 14,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 26,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  trustRow: {
    marginTop: 34,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    opacity: 0.7,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    color: UI.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: UI.primary,
    opacity: 0.35,
  },
});
