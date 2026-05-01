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
      map: {
        title: 'Mapa de parques acessiveis',
        subtitle: 'Breve mapa interativo com marcadores e pesquisa.',
      },
      search: {
        title: 'Pesquisa e filtros',
        subtitle: 'Procura por nome, proximidade e necessidades.',
      },
      favorites: {
        title: 'Favoritos',
        subtitle: 'Guarda parques para acesso rapido.',
      },
      profile: {
        title: 'Perfil',
        subtitle: 'Preferencias, necessidades e notificacoes.',
      },
      parkDetails: {
        title: 'Ficha do parque',
        subtitle: 'Detalhes completos, avaliacoes e alertas.',
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
      map: {
        title: 'Accessible parks map',
        subtitle: 'Interactive map with markers and search.',
      },
      search: {
        title: 'Search and filters',
        subtitle: 'Find by name, proximity, and needs.',
      },
      favorites: {
        title: 'Favorites',
        subtitle: 'Save parks for quick access.',
      },
      profile: {
        title: 'Profile',
        subtitle: 'Preferences, needs, and notifications.',
      },
      parkDetails: {
        title: 'Park details',
        subtitle: 'Full info, ratings, and alerts.',
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
