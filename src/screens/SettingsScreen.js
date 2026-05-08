import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../i18n';
import { useSession } from '../session';
import { useTheme } from '../theme';

const sectionLabels = {
  pt: {
    title: 'Definicoes',
    accessibility: 'Acessibilidade',
    notifications: 'Notificacoes',
    account: 'Conta',
    preferences: 'Preferencias',
    support: 'Suporte e sobre',
    darkMode: 'Modo escuro',
    textSize: 'Tamanho do texto',
    small: 'Pequeno',
    medium: 'Medio',
    large: 'Grande',
    activeNotifications: 'Notificacoes ativas',
    activeNotificationsDescription: 'Recebe avisos gerais sobre favoritos e atualizacoes importantes.',
    routeAlerts: 'Alertas de percurso',
    routeAlertsDescription: 'Avisa quando uma rota pode ter obras, barreiras ou informacao incerta.',
    editProfile: 'Editar perfil',
    logout: 'Sair da conta',
    language: 'Idioma',
    help: 'Ajuda / FAQs',
    contact: 'Contactar suporte',
    portuguese: 'Portugues',
    english: 'Ingles',
  },
  en: {
    title: 'Settings',
    accessibility: 'Accessibility',
    notifications: 'Notifications',
    account: 'Account',
    preferences: 'Preferences',
    support: 'Support and about',
    darkMode: 'Dark mode',
    textSize: 'Text size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    activeNotifications: 'Notifications enabled',
    activeNotificationsDescription: 'Receive general alerts about favorites and important updates.',
    routeAlerts: 'Route alerts',
    routeAlertsDescription: 'Warns when a route may have works, barriers, or uncertain information.',
    editProfile: 'Edit profile',
    logout: 'Sign out',
    language: 'Language',
    help: 'Help / FAQs',
    contact: 'Contact support',
    portuguese: 'Portuguese',
    english: 'English',
  },
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { locale, setLocale } = useTranslation();
  const { signOut } = useSession();
  const { colors, isDark, toggleColorMode } = useTheme();
  const [textSize, setTextSize] = useState('medium');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [routeAlerts, setRouteAlerts] = useState(true);
  const labels = sectionLabels[locale] || sectionLabels.pt;

  const showInfo = (title, message) => {
    Alert.alert(title, message);
  };

  const rows = {
    accessibility: [
      {
        icon: 'moon-outline',
        iconBg: isDark ? '#E9E7FF' : '#D4E3FF',
        iconColor: '#4B4EDB',
        label: labels.darkMode,
        control: <Switch value={isDark} onValueChange={toggleColorMode} />,
      },
      {
        icon: 'text-outline',
        iconBg: '#F2E7FF',
        iconColor: '#7E3FB4',
        label: labels.textSize,
        custom: (
          <SegmentedControl
            options={[
              { key: 'small', label: labels.small },
              { key: 'medium', label: labels.medium },
              { key: 'large', label: labels.large },
            ]}
            value={textSize}
            onChange={setTextSize}
            colors={colors}
          />
        ),
      },
    ],
    notifications: [
      {
        icon: 'notifications-outline',
        iconBg: '#E7F0FF',
        iconColor: '#005FAF',
        label: labels.activeNotifications,
        description: labels.activeNotificationsDescription,
        control: (
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        ),
      },
      {
        icon: 'trail-sign-outline',
        iconBg: '#FFF4DE',
        iconColor: '#A16700',
        label: labels.routeAlerts,
        description: labels.routeAlertsDescription,
        control: <Switch value={routeAlerts} onValueChange={setRouteAlerts} />,
      },
    ],
    account: [
      {
        icon: 'person-outline',
        iconBg: '#DFF6DC',
        iconColor: '#1B6D24',
        label: labels.editProfile,
        onPress: () => navigation.goBack(),
      },
      {
        icon: 'log-out-outline',
        iconBg: colors.dangerSoft,
        iconColor: colors.danger,
        label: labels.logout,
        onPress: signOut,
      },
    ],
    preferences: [
      {
        icon: 'globe-outline',
        iconBg: '#FFF4DE',
        iconColor: '#7E5700',
        label: labels.language,
        value: locale === 'pt' ? labels.portuguese : labels.english,
        onPress: () => setLocale(locale === 'pt' ? 'en' : 'pt'),
      },
    ],
    support: [
      {
        icon: 'help-circle-outline',
        iconBg: colors.surfaceHigh,
        iconColor: colors.muted,
        label: labels.help,
        onPress: () =>
          showInfo(
            labels.help,
            locale === 'pt'
              ? 'Podes usar o mapa, filtros, favoritos e direcoes para encontrar parques acessiveis.'
              : 'Use the map, filters, favorites, and directions to find accessible parks.'
          ),
      },
      {
        icon: 'chatbox-ellipses-outline',
        iconBg: colors.surfaceHigh,
        iconColor: colors.muted,
        label: labels.contact,
        onPress: () =>
          showInfo(
            labels.contact,
            locale === 'pt'
              ? 'Suporte de teste: suporte@parkable.local'
              : 'Test support: support@parkable.local'
          ),
      },
    ],
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Fecha as definicoes e volta ao perfil."
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.surfaceHigh, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{labels.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SettingsSection title={labels.accessibility} rows={rows.accessibility} colors={colors} />
        <SettingsSection title={labels.notifications} rows={rows.notifications} colors={colors} />
        <SettingsSection title={labels.account} rows={rows.account} colors={colors} />
        <SettingsSection title={labels.preferences} rows={rows.preferences} colors={colors} />
        <SettingsSection title={labels.support} rows={rows.support} colors={colors} />
      </ScrollView>
    </View>
  );
}

function SettingsSection({ title, rows, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>{title}</Text>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {rows.map((row, index) => (
          <Pressable
            key={row.label}
            onPress={row.onPress}
            disabled={!row.onPress}
            accessibilityRole={row.control ? 'switch' : 'button'}
            accessibilityLabel={row.label}
            style={({ pressed }) => [
              styles.row,
              index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 },
              { opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <View style={[styles.rowIcon, { backgroundColor: row.iconBg }]}>
              <Ionicons name={row.icon} size={20} color={row.iconColor} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
              {row.description ? (
                <Text style={[styles.rowDescription, { color: colors.muted }]}>
                  {row.description}
                </Text>
              ) : null}
            </View>
            {row.value ? <Text style={[styles.rowValue, { color: colors.muted }]}>{row.value}</Text> : null}
            {row.custom || row.control || (row.onPress ? <Ionicons name="chevron-forward" size={20} color={colors.muted} /> : null)}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SegmentedControl({ options, value, onChange, colors }) {
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceHigh }]}>
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={[
              styles.segmentOption,
              { backgroundColor: selected ? colors.primary : 'transparent' },
            ]}
          >
            <Text style={[styles.segmentText, { color: selected ? colors.card : colors.muted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginLeft: 12,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  group: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  segmented: {
    minHeight: 36,
    borderRadius: 18,
    padding: 3,
    flexDirection: 'row',
  },
  segmentOption: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '900',
  },
});
