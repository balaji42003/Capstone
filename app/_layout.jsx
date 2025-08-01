import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="doctor-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="pharmacy-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="health" options={{ headerShown: false }} />
        <Stack.Screen name="doctor-profile" options={{ headerShown: false }} />
        <Stack.Screen name="video-call" options={{ headerShown: false }} />
        <Stack.Screen name="payment-method" options={{ headerShown: false }} />
        <Stack.Screen name="personal-information" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
