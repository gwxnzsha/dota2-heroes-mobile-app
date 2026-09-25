import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../pages/HeroBrowser';
import HeroDetailScreen from '../pages/HomeDetailScreen';
import HeroFormScreen from '../pages/HeroFormScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Home: undefined;
  HeroDetail: { heroId: string };
  HeroEdit: { heroId: string };
  HeroCreate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.background },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="HeroDetail" component={HeroDetailScreen} />
        <Stack.Screen name="HeroEdit" component={HeroFormScreen} />
        <Stack.Screen name="HeroCreate" component={HeroFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}