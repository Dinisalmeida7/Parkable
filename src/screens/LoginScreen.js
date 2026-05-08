import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../session';

const brandIcon = require('../../assets/brand-icon.png');

const UI = {
  background: '#0E141B',
  surface: '#18212B',
  surfaceHigh: '#24303C',
  text: '#F7F9FB',
  muted: '#D7DED2',
  primary: '#38C88A',
  primarySoft: '#123B24',
  secondary: '#A5C8FF',
  border: '#24303C',
};

export default function LoginScreen({ navigation }) {
  const { loginSavedUser } = useSession();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('mail registado');
  const [password, setPassword] = useState('12345678');

  if (step === 'account') {
    return (
      <View style={styles.profileScreen}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => setStep('credentials')}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao login"
            accessibilityHint="Volta à página de email e palavra-passe."
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={22} color={UI.primary} />
          </Pressable>
          <Text style={styles.topBrand}>ParkAble</Text>
          <Ionicons name="accessibility" size={24} color={UI.primary} />
        </View>

        <ScrollView contentContainerStyle={styles.profileContent}>
          <Text style={styles.profileTitle}>Bem-vindo de volta, Dinis</Text>
          <Text style={styles.profileSubtitle}>
            Encontrámos a tua conta guardada. Confirma se estas preferências continuam certas.
          </Text>

          <View style={styles.profileCard}>
            <View style={styles.accountHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>DA</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.accountName}>Dinis Almeida</Text>
                <Text style={styles.accountInfo}>Conta local de teste</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Necessidades guardadas</Text>
            <View style={styles.chipRow}>
              <View style={styles.activeChip}>
                <Ionicons name="accessibility" size={17} color="#FFFFFF" />
                <Text style={styles.activeChipText}>Mobilidade reduzida</Text>
              </View>
              <View style={styles.activeChip}>
                <Ionicons name="ear-outline" size={17} color="#FFFFFF" />
                <Text style={styles.activeChipText}>Apoio auditivo</Text>
              </View>
            </View>

            <View style={styles.infoTile}>
              <Ionicons name="heart" size={22} color={UI.primary} />
              <View style={styles.flex}>
                <Text style={styles.tileTitle}>1 local guardado</Text>
                <Text style={styles.tileText}>Parque da Cidade fica pronto na tua lista.</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={loginSavedUser}
            accessibilityRole="button"
            accessibilityLabel="Continuar para a app"
            accessibilityHint="Entra na app com a conta guardada."
            style={({ pressed }) => [styles.profileCta, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={styles.profileCtaText}>Continuar</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.brand}>
        <View style={styles.logoBox}>
          <Image source={brandIcon} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.brandTitle}>ParkAble</Text>
        <Text style={styles.brandSubtitle}>Natureza acessível para todas as pessoas.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail" size={22} color={UI.muted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="mail registado"
            placeholderTextColor="#7A8376"
            style={styles.input}
            accessibilityLabel="Email"
            accessibilityHint="Email registado para teste."
          />
        </View>

        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Palavra-passe</Text>
          <Text style={styles.forgotText}>Esqueceste?</Text>
        </View>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed" size={22} color={UI.muted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#7A8376"
            style={styles.input}
            accessibilityLabel="Palavra-passe"
            accessibilityHint="Palavra-passe da conta de teste."
          />
          <Ionicons name="eye" size={22} color={UI.muted} />
        </View>

        <Pressable
          onPress={() => setStep('account')}
          accessibilityRole="button"
          accessibilityLabel="Entrar"
          accessibilityHint="Avança para a confirmação da conta guardada."
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={styles.ctaText}>Entrar</Text>
        </Pressable>

        <View style={styles.divider} />
        <Text style={styles.helper}>Ainda não tens conta?</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Criar uma nova conta"
          accessibilityHint="Volta ao registo para criar uma conta nova."
          style={({ pressed }) => [styles.secondaryCta, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.secondaryText}>Registar</Text>
        </Pressable>
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Ionicons name="accessibility" size={16} color={UI.muted} />
          <Text style={styles.trustText}>Inclusiva</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color={UI.muted} />
          <Text style={styles.trustText}>Segura</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="leaf-outline" size={16} color={UI.muted} />
          <Text style={styles.trustText}>Sustentável</Text>
        </View>
      </View>
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
    top: -130,
    left: -110,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: UI.primarySoft,
    opacity: 0.78,
  },
  glowBottom: {
    position: 'absolute',
    right: -170,
    top: 250,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#D4E3FF',
    opacity: 0.12,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 38,
  },
  logoBox: {
    width: 84,
    height: 84,
    borderRadius: 30,
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
  logoImage: {
    width: 76,
    height: 76,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: UI.primary,
  },
  brandSubtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: UI.muted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(24,33,43,0.96)',
    borderRadius: 30,
    padding: 28,
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  label: {
    marginLeft: 8,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '800',
    color: UI.text,
  },
  passwordHeader: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    marginBottom: 8,
    color: UI.secondary,
    fontSize: 15,
    fontWeight: '800',
  },
  inputWrap: {
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: UI.surfaceHigh,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    color: UI.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cta: {
    height: 60,
    marginTop: 28,
    borderRadius: 30,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI.primary,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: UI.border,
    marginVertical: 26,
  },
  helper: {
    textAlign: 'center',
    color: UI.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryCta: {
    alignSelf: 'center',
    marginTop: 16,
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 30,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  trustRow: {
    marginTop: 34,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    opacity: 0.74,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    color: UI.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  profileScreen: {
    flex: 1,
    backgroundColor: UI.background,
  },
  topBar: {
    height: 68,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(24,33,43,0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBrand: {
    color: UI.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  profileContent: {
    padding: 24,
    paddingBottom: 48,
  },
  profileTitle: {
    color: UI.primary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  profileSubtitle: {
    marginTop: 12,
    color: UI.muted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  profileCard: {
    marginTop: 30,
    backgroundColor: UI.surface,
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: UI.border,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  flex: {
    flex: 1,
  },
  accountName: {
    color: UI.text,
    fontSize: 19,
    fontWeight: '900',
  },
  accountInfo: {
    marginTop: 4,
    color: UI.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionLabel: {
    color: UI.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  chipRow: {
    gap: 10,
  },
  activeChip: {
    alignSelf: 'flex-start',
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#D99500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  infoTile: {
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    backgroundColor: UI.surfaceHigh,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tileTitle: {
    color: UI.text,
    fontSize: 15,
    fontWeight: '900',
  },
  tileText: {
    marginTop: 3,
    color: UI.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  profileCta: {
    height: 60,
    marginTop: 32,
    borderRadius: 30,
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
  profileCtaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
