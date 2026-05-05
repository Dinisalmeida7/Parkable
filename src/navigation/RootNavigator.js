import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from '../screens/MapScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ParkDetailsScreen from '../screens/ParkDetailsScreen';
import AuthScreen from '../screens/AuthScreen';
import LoadingScreen from '../screens/LoadingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useTranslation } from '../i18n';
import { useSession } from '../session';
import { useTheme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Map'
              ? 'map'
              : route.name === 'Search'
              ? 'search'
              : route.name === 'Favorites'
              ? 'heart'
              : 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: t('tabs.map') }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: t('tabs.search') }} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: t('tabs.favorites') }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isBooted, isOnboarded, isAuthenticated } = useSession();
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!isBooted) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!isOnboarded ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : !isAuthenticated ? (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ title: t('screens.auth.title') }}
        />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ParkDetails"
            component={ParkDetailsScreen}
            options={{ title: t('screens.parkDetails.title') }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
