import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

const palettes = {
  light: {
    background: '#F6F8FA',
    card: '#FFFFFF',
    text: '#0D1B2A',
    muted: '#5B6770',
    primary: '#1FA971',
    accent: '#FFB547',
    border: '#E1E6EB',
  },
  dark: {
    background: '#0E141B',
    card: '#18212B',
    text: '#F7F9FB',
    muted: '#B6C0C9',
    primary: '#38C88A',
    accent: '#FFC86B',
    border: '#24303C',
  },
};

const ThemeContext = createContext({
  scheme: 'light',
  colors: palettes.light,
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const scheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = useMemo(() => ({ scheme, colors: palettes[scheme] }), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
