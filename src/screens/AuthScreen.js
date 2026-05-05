import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';
import { useSession } from '../session';

export default function AuthScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { setAuthenticated } = useSession();
  const [name, setName] = useState('');

  const handleLogin = async () => {
    const displayName = name.trim() || 'Guest';
    await setAuthenticated(true, { name: displayName });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('screens.auth.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{t('screens.auth.subtitle')}</Text>

      <Text style={[styles.label, { color: colors.text }]}>{t('screens.auth.inputLabel')}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('screens.auth.inputLabel')}
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.ctaText, { color: colors.card }]}>{t('screens.auth.cta')}</Text>
      </Pressable>

      <Pressable onPress={handleLogin} style={styles.linkWrapper}>
        <Text style={[styles.link, { color: colors.accent }]}>{t('screens.auth.skip')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  cta: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
  linkWrapper: {
    marginTop: 16,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
