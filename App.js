import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { LanguageProvider } from './src/i18n';
import { SessionProvider } from './src/session';
import { ThemeProvider, useTheme } from './src/theme';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { scheme } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SessionProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SessionProvider>
    </LanguageProvider>
  );
}
