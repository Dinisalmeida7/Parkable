import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { useTranslation } from '../i18n';
import { useSession } from '../session';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signOut } = useSession();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t('screens.profile.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {t('screens.profile.subtitle')}
      </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
