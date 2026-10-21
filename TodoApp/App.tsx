import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';
import { colors } from './src/theme';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.violet,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.mint,
  },
};

export default function App(): React.JSX.Element {
  const hydrate = useAuthStore((state) => state.hydrate);

  React.useEffect(() => {
    void hydrate();
    if (Platform.OS === 'android') {
      const sb = StatusBar as unknown as { setBackgroundColor?: (color: string, animated?: boolean) => void };
      sb.setBackgroundColor?.(colors.background, true);
    }
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" animated={true} />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
