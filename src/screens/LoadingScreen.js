import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n';

const brandIcon = require('../../assets/brand-icon.png');

const UI = {
  background: '#F9F9F9',
  surface: '#FFFFFF',
  primary: '#1B6D24',
  muted: '#3F4A3C',
};

export default function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.logoBox}>
        <Image source={brandIcon} style={styles.logoImage} resizeMode="contain" />
      </View>
      <Text style={styles.title}>ParkAble</Text>
      <ActivityIndicator size="large" color={UI.primary} style={styles.loader} />
      <Text style={styles.text}>{t('screens.loading.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: UI.background,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#DFF6DC',
    opacity: 0.75,
  },
  logoBox: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: UI.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  logoImage: {
    width: 74,
    height: 74,
  },
  title: {
    marginTop: 18,
    color: UI.primary,
    fontSize: 36,
    fontWeight: '800',
  },
  loader: {
    marginTop: 28,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: UI.muted,
  },
});
