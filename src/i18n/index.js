import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  pt: {
    app: {
      title: 'Parkable',
    },
    tabs: {
      map: 'Mapa',
      search: 'Pesquisa',
      favorites: 'Favoritos',
      profile: 'Perfil',
    },
    screens: {
      onboarding: {
        title: 'Bem-vindo ao Parkable',
        subtitle: 'Escolhe as necessidades para ajustar o mapa.',
        cta: 'Continuar',
        backToAuth: 'Voltar ao login',
      },
      auth: {
        title: 'Entrar',
        subtitle: 'Simulacao de login local.',
        inputLabel: 'Nome',
        cta: 'Entrar',
        skip: 'Entrar como convidado',
      },
      loading: {
        title: 'A preparar a app...',
      },
      map: {
        title: 'Mapa de parques acessiveis',
        subtitle: 'Breve mapa interativo com marcadores e pesquisa.',
        searchPlaceholder: 'Procurar parques e filtros',
        quickListTitle: 'Mais acessiveis',
        openSearch: 'Abrir',
        locationDenied: 'Localizacao desativada. A mostrar dados gerais.',
      },
      search: {
        title: 'Pesquisa e filtros',
        subtitle: 'Procura por nome, proximidade e necessidades.',
        searchPlaceholder: 'Nome do parque',
        needsTitle: 'Necessidades',
        equipmentTitle: 'Equipamentos',
        sortTitle: 'Ordenar por',
        sortAccessibility: 'Acessibilidade',
        sortDistance: 'Distancia',
        resultsCount: '{{count}} resultados',
        empty: 'Sem resultados para estes filtros.',
        locationDenied: 'Ativa a localizacao para ordenar por distancia.',
      },
      favorites: {
        title: 'Favoritos',
        subtitle: 'Guarda parques para acesso rapido.',
        count: '{{count}} favoritos',
        empty: 'Ainda nao tens favoritos.',
        remove: 'Remover',
      },
      profile: {
        title: 'Perfil',
        subtitle: 'Preferencias, necessidades e notificacoes.',
        nameLabel: 'Nome',
        needsLabel: 'Necessidades selecionadas',
        needsEmpty: 'Nenhuma necessidade selecionada.',
        guest: 'Convidado',
        signOut: 'Sair da sessao',
      },
      parkDetails: {
        title: 'Ficha do parque',
        subtitle: 'Detalhes completos, avaliacoes e alertas.',
        missing: 'Parque nao encontrado.',
        overview: 'Resumo',
        city: 'Cidade',
        lastUpdated: 'Atualizado',
        accessibilityScore: 'Acessibilidade',
        community: 'Comunidade',
        communityCount: '{{count}} avaliacoes',
        features: 'Equipamentos',
        needs: 'Necessidades suportadas',
        alerts: 'Alertas',
        alertsEmpty: 'Sem alertas ativos.',
        alertUntil: 'Ate {{date}}',
        reviews: 'Reviews',
        reviewsEmpty: 'Sem reviews ainda.',
        addReview: 'Adicionar review',
        submitReview: 'Enviar review',
        commentPlaceholder: 'Partilha a tua experiencia...',
        overall: 'Geral',
        mobility: 'Mobilidade',
        visual: 'Visual',
        auditory: 'Auditiva',
        cognitive: 'Cognitiva',
        favorite: 'Favoritar',
        unfavorite: 'Remover',
        reviewErrorTitle: 'Review incompleta',
        reviewErrorBody: 'Adiciona uma pontuacao ou comentario.',
      },
    },
  },
  en: {
    app: {
      title: 'Parkable',
    },
    tabs: {
      map: 'Map',
      search: 'Search',
      favorites: 'Favorites',
      profile: 'Profile',
    },
    screens: {
      onboarding: {
        title: 'Welcome to Parkable',
        subtitle: 'Pick needs to personalize the map.',
        cta: 'Continue',
        backToAuth: 'Back to sign in',
      },
      auth: {
        title: 'Sign in',
        subtitle: 'Local login simulation.',
        inputLabel: 'Name',
        cta: 'Sign in',
        skip: 'Continue as guest',
      },
      loading: {
        title: 'Preparing the app...',
      },
      map: {
        title: 'Accessible parks map',
        subtitle: 'Interactive map with markers and search.',
        searchPlaceholder: 'Search parks and filters',
        quickListTitle: 'Most accessible',
        openSearch: 'Open',
        locationDenied: 'Location disabled. Showing general results.',
      },
      search: {
        title: 'Search and filters',
        subtitle: 'Find by name, proximity, and needs.',
        searchPlaceholder: 'Park name',
        needsTitle: 'Needs',
        equipmentTitle: 'Equipment',
        sortTitle: 'Sort by',
        sortAccessibility: 'Accessibility',
        sortDistance: 'Distance',
        resultsCount: '{{count}} results',
        empty: 'No results for these filters.',
        locationDenied: 'Enable location to sort by distance.',
      },
      favorites: {
        title: 'Favorites',
        subtitle: 'Save parks for quick access.',
        count: '{{count}} favorites',
        empty: 'You have no favorites yet.',
        remove: 'Remove',
      },
      profile: {
        title: 'Profile',
        subtitle: 'Preferences, needs, and notifications.',
        nameLabel: 'Name',
        needsLabel: 'Selected needs',
        needsEmpty: 'No needs selected yet.',
        guest: 'Guest',
        signOut: 'Sign out',
      },
      parkDetails: {
        title: 'Park details',
        subtitle: 'Full info, ratings, and alerts.',
        missing: 'Park not found.',
        overview: 'Overview',
        city: 'City',
        lastUpdated: 'Updated',
        accessibilityScore: 'Accessibility',
        community: 'Community',
        communityCount: '{{count}} ratings',
        features: 'Equipment',
        needs: 'Supported needs',
        alerts: 'Alerts',
        alertsEmpty: 'No active alerts.',
        alertUntil: 'Until {{date}}',
        reviews: 'Reviews',
        reviewsEmpty: 'No reviews yet.',
        addReview: 'Add review',
        submitReview: 'Submit review',
        commentPlaceholder: 'Share your experience...',
        overall: 'Overall',
        mobility: 'Mobility',
        visual: 'Visual',
        auditory: 'Auditory',
        cognitive: 'Cognitive',
        favorite: 'Favorite',
        unfavorite: 'Remove',
        reviewErrorTitle: 'Review incomplete',
        reviewErrorBody: 'Add a score or a comment.',
      },
    },
  },
};

const i18n = new I18n(translations);
const LanguageContext = createContext({
  locale: 'pt',
  setLocale: () => {},
  t: (key, options) => i18n.t(key, options),
});

i18n.enableFallback = true;

const getDeviceLocale = () => {
  const languageCode = Localization.getLocales?.()[0]?.languageCode;
  return languageCode === 'en' ? 'en' : 'pt';
};

export function LanguageProvider({ children, initialLocale }) {
  const [locale, setLocale] = useState(initialLocale ?? getDeviceLocale());

  useEffect(() => {
    i18n.locale = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key, options) => i18n.t(key, options),
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
