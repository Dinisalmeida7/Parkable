import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NEEDS } from '../data';
import { useSession } from '../session';

const UI = {
  background: '#F9F9F9',
  surface: '#FFFFFF',
  surfaceHigh: '#E8E8E8',
  text: '#1A1C1C',
  muted: '#3F4A3C',
  primary: '#1B6D24',
  primaryContainer: '#5DAC5B',
  secondary: '#005FAF',
  tertiary: '#CD8F00',
  border: '#EEEEEE',
};

const NEED_META = {
  mobility: {
    icon: 'accessibility',
    title: 'Mobilidade reduzida',
    description: 'Percursos planos, rampas e caminhos faceis de usar.',
    color: UI.primaryContainer,
  },
  cognitive: {
    icon: 'sparkles-outline',
    title: 'Ambientes calmos',
    description: 'Zonas tranquilas, sinalizacao simples e menos estimulos.',
    color: UI.secondary,
  },
  visual: {
    icon: 'eye-outline',
    title: 'Apoio visual',
    description: 'Sinais legiveis, caminhos tateis e informacao audio.',
    color: UI.tertiary,
  },
  auditory: {
    icon: 'ear-outline',
    title: 'Apoio auditivo',
    description: 'Alertas visuais e informacao clara no ecra.',
    color: '#2F8F2E',
  },
};

export default function RegisterScreen({ navigation }) {
  const { registerLocalUser } = useSession();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const needsList = useMemo(() => NEEDS, []);

  const isCredentialsStep = step === 'credentials';

  const toggleNeed = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handlePrimaryAction = async () => {
    if (isCredentialsStep) {
      setStep('profile');
      return;
    }

    if (selected.includes('visual')) {
      Alert.alert(
        'Apoio visual',
        'Sofres de daltonismo?',
        [
          {
            text: 'Nao',
            onPress: () => registerLocalUser({ name, needs: selected, colorBlindness: false }),
          },
          {
            text: 'Sim',
            onPress: () => registerLocalUser({ name, needs: selected, colorBlindness: true }),
          },
        ],
        { cancelable: true }
      );
      return;
    }

    await registerLocalUser({ name, needs: selected });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        {isCredentialsStep ? (
          <View style={styles.iconButtonPlaceholder} />
        ) : (
          <Pressable
            onPress={() => setStep('credentials')}
            accessibilityRole="button"
            accessibilityLabel="Voltar aos dados de acesso"
            accessibilityHint="Volta ao passo de email e palavra-passe."
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={22} color={UI.primary} />
          </Pressable>
        )}
        <Text style={styles.brand}>ParkAble</Text>
        <Text style={styles.stepText}>{isCredentialsStep ? 'Passo 1 de 2' : 'Passo 2 de 2'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {isCredentialsStep ? (
          <>
            <View style={styles.hero}>
              <View style={styles.logoBox}>
                <Ionicons name="leaf" size={38} color={UI.primary} />
              </View>
              <Text style={styles.title}>Cria a tua conta</Text>
              <Text style={styles.subtitle}>
                Primeiro define os dados de acesso. Depois personalizamos a app para ti.
              </Text>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={UI.muted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="O teu email"
                  placeholderTextColor="#6F7A6B"
                  style={styles.input}
                  accessibilityLabel="Email"
                  accessibilityHint="Indica o email que queres usar para criar conta."
                />
              </View>

              <Text style={[styles.label, styles.spacedLabel]}>Palavra-passe</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={UI.muted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Cria uma palavra-passe"
                  placeholderTextColor="#6F7A6B"
                  style={styles.input}
                  accessibilityLabel="Palavra-passe"
                  accessibilityHint="Cria uma palavra-passe para esta conta."
                />
              </View>
            </View>

            <Text style={styles.loginPrompt}>Ja tens conta?</Text>
            <Pressable
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              accessibilityLabel="Entrar numa conta existente"
              accessibilityHint="Abre a pagina para entrar na conta local guardada."
              style={({ pressed }) => [styles.secondaryCta, { opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={styles.secondaryText}>Entrar</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.logoBox}>
                <Ionicons name="leaf" size={38} color={UI.primary} />
              </View>
              <Text style={styles.title}>Vamos preparar a tua experiencia</Text>
              <Text style={styles.subtitle}>
                Diz-nos como te devemos tratar e que apoios queres ver primeiro.
              </Text>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={20} color={UI.muted} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="O teu nome"
                  placeholderTextColor="#6F7A6B"
                  style={styles.input}
                  accessibilityLabel="Nome"
                  accessibilityHint="Indica como queres ser tratado na app."
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Que apoio precisas?</Text>
              <Text style={styles.sectionSubtitle}>Podes escolher mais do que uma opcao.</Text>
            </View>

            <View style={styles.grid}>
              {needsList.map((need) => {
                const isActive = selected.includes(need.key);
                const meta = NEED_META[need.key] || NEED_META.mobility;
                return (
                  <Pressable
                    key={need.key}
                    onPress={() => toggleNeed(need.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`${isActive ? 'Remover' : 'Selecionar'} ${meta.title}`}
                    accessibilityHint="Ajuda a personalizar recomendacoes de parques."
                    style={({ pressed }) => [
                      styles.needCard,
                      {
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
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handlePrimaryAction}
          accessibilityRole="button"
          accessibilityLabel={isCredentialsStep ? 'Continuar' : 'Registar'}
          accessibilityHint={
            isCredentialsStep
              ? 'Avanca para a personalizacao da conta.'
              : 'Cria uma conta nova sem favoritos nem dados anteriores.'
          }
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={styles.ctaText}>{isCredentialsStep ? 'Continuar' : 'Registar'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
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
    backgroundColor: 'rgba(255,255,255,0.9)',
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
  iconButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  brand: {
    color: UI.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  stepText: {
    width: 76,
    color: UI.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 130,
  },
  hero: {
    marginBottom: 22,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: UI.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    color: UI.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    color: UI.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  inputCard: {
    backgroundColor: UI.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: UI.border,
    marginBottom: 24,
  },
  label: {
    marginLeft: 8,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    color: UI.muted,
  },
  spacedLabel: {
    marginTop: 18,
  },
  inputWrap: {
    minHeight: 56,
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
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: UI.text,
    fontSize: 21,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: UI.muted,
    fontSize: 13,
    fontWeight: '600',
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
    backgroundColor: UI.surface,
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
  loginPrompt: {
    marginTop: 28,
    textAlign: 'center',
    color: UI.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryCta: {
    alignSelf: 'center',
    marginTop: 12,
    minHeight: 44,
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.86)',
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
});
