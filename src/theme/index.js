import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

const palettes = {
  light: {
    background: '#F9F9F9',
    card: '#FFFFFF',
    text: '#1A1C1C',
    muted: '#3F4A3C',
    primary: '#1B6D24',
    accent: '#7E5700',
    border: '#BECAB9',
    surfaceLow: '#F3F3F3',
    surfaceHigh: '#E8E8E8',
    primarySoft: '#DFF6DC',
    secondary: '#005FAF',
    secondarySoft: '#D4E3FF',
    danger: '#BA1A1A',
    dangerSoft: '#FFDAD6',
  },
  dark: {
    background: '#0E141B',
    card: '#18212B',
    text: '#F7F9FB',
    muted: '#D7DED2',
    primary: '#38C88A',
    accent: '#FFC86B',
    border: '#24303C',
    surfaceLow: '#121C25',
    surfaceHigh: '#24303C',
    primarySoft: '#123B24',
    secondary: '#A5C8FF',
    secondarySoft: '#17304F',
    danger: '#FFB4AB',
    dangerSoft: '#4F1512',
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
