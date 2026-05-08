import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getFavorites, getParkById, NEEDS } from '../data';
import { useSession } from '../session';

const UI = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  field: '#F3F3F3',
  text: '#082D18',
  muted: '#6E7482',
  primary: '#1B6D24',
  primaryBright: '#39B54A',
  primarySoft: '#EEF8EA',
  border: '#E6EDE4',
  shadow: '#0B1F13',
  error: '#BA1A1A',
};

const NEED_META = {
  mobility: { icon: 'accessibility-outline', label: 'Mobilidade reduzida' },
  visual: { icon: 'eye-outline', label: 'Alta visibilidade' },
  auditory: { icon: 'volume-medium-outline', label: 'Apoio auditivo' },
  cognitive: { icon: 'leaf-outline', label: 'Zonas calmas' },
};

const fallbackNeed = { icon: 'checkmark-circle-outline', label: 'Apoio personalizado' };

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { signOut, profile, needs } = useSession();
  const [favoriteIds, setFavoriteIds] = useState([]);

  const displayName = profile?.name || 'Convidado';
  const selectedNeeds = useMemo(() => NEEDS.filter((item) => needs.includes(item.key)), [needs]);
  const favoriteParks = useMemo(
    () => favoriteIds.map((id) => getParkById(id)).filter(Boolean),
    [favoriteIds]
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadFavorites = async () => {
        const storedFavorites = await getFavorites();
        if (isActive) {
          setFavoriteIds(storedFavorites.filter((id) => !!getParkById(id)));
        }
      };

      loadFavorites();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <Text style={styles.sectionLabel}>Nome</Text>
      <View style={styles.nameField} accessible accessibilityRole="text">
        <Text style={styles.nameText}>{displayName}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>As minhas necessidades</Text>
      </View>

      <View style={styles.needRow}>
        {selectedNeeds.length ? (
          selectedNeeds.map((need) => {
            const meta = NEED_META[need.key] || fallbackNeed;
            return (
              <View key={need.key} style={styles.needChip}>
                <Ionicons name={meta.icon} size={22} color={UI.primaryBright} />
                <Text style={styles.needText}>{meta.label}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.needChip}>
            <Ionicons name="add-circle-outline" size={22} color={UI.primaryBright} />
            <Text style={styles.needText}>Sem necessidades escolhidas</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Locais guardados</Text>
        <Text style={styles.savedCount}>
          {favoriteParks.length} {favoriteParks.length === 1 ? 'guardado' : 'guardados'}
        </Text>
      </View>

      <View style={styles.savedList}>
        {favoriteParks.length ? (
          favoriteParks.slice(0, 3).map((park) => (
            <Pressable
              key={park.id}
              onPress={() => navigation.navigate('ParkDetails', { parkId: park.id })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${park.name}`}
              accessibilityHint="Abre os detalhes deste local guardado."
              style={({ pressed }) => [styles.savedCard, { opacity: pressed ? 0.86 : 1 }]}
            >
              <View style={styles.savedIcon}>
                <Ionicons name="home" size={28} color={UI.primaryBright} />
              </View>
              <View style={styles.savedTextWrap}>
                <Text style={styles.savedTitle}>{park.name}</Text>
                <Text style={styles.savedMeta}>
                  {park.city} - avaliacao {park.accessibilityScore.toFixed(1)}
                </Text>
              </View>
              <Ionicons name="heart" size={30} color={UI.primaryBright} />
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="heart-outline" size={28} color={UI.primaryBright} />
            <Text style={styles.emptyText}>Ainda nao tens locais guardados.</Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={signOut}
        accessibilityRole="button"
        accessibilityLabel="Sair da sessao"
        accessibilityHint="Termina a sessao e volta ao ecra de entrada."
        style={({ pressed }) => [styles.signOut, { opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons name="log-out-outline" size={18} color={UI.error} />
        <Text style={styles.signOutText}>Sair da conta</Text>
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
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 120,
  },
  title: {
    color: UI.text,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '900',
    marginBottom: 36,
  },
  sectionLabel: {
    color: UI.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  nameField: {
    minHeight: 76,
    borderRadius: 24,
    backgroundColor: UI.field,
    justifyContent: 'center',
    paddingHorizontal: 28,
    marginBottom: 44,
  },
  nameText: {
    color: UI.text,
    fontSize: 24,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionTitle: {
    color: UI.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    flex: 1,
  },
  needRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 42,
  },
  needChip: {
    minHeight: 58,
    borderRadius: 29,
    paddingHorizontal: 18,
    backgroundColor: UI.primarySoft,
    borderWidth: 1,
    borderColor: '#D9ECD2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  needText: {
    color: UI.primaryBright,
    fontSize: 18,
    fontWeight: '800',
  },
  savedCount: {
    color: '#9AA1AE',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 14,
  },
  savedList: {
    gap: 16,
  },
  savedCard: {
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: UI.surface,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    shadowColor: UI.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  savedIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: UI.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedTextWrap: {
    flex: 1,
  },
  savedTitle: {
    color: UI.text,
    fontSize: 20,
    fontWeight: '900',
  },
  savedMeta: {
    marginTop: 4,
    color: UI.muted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyCard: {
    minHeight: 104,
    borderRadius: 24,
    backgroundColor: UI.surface,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: UI.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  signOut: {
    marginTop: 28,
    height: 52,
    borderRadius: 26,
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
