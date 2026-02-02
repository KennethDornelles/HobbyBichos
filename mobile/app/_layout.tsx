import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { setStatusBarStyle, setStatusBarTranslucent } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { useCartAutoSync } from '../src/hooks/useCartAutoSync';
import { GlobalErrorBoundary } from '../src/components/GlobalErrorBoundary';

function RootLayoutContent() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useCartAutoSync();
  const { isDark } = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirecionar para login se não houver usuário
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirecionar para home se usuário já estiver logado (evitar login duplo)
      router.replace("/(main)/home");
    }
  }, [user, isLoading, segments]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync();
      setStatusBarTranslucent(true);
      setStatusBarStyle(isDark ? "light" : "dark");
    }
  }, [fontsLoaded, fontError, isLoading, isDark]);

  // Timeout de segurança
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Forçar hide apenas se passou muito tempo
      SplashScreen.hideAsync();
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if ((!fontsLoaded && !fontError) || isLoading) {
    // Manter Splash Screen (ou retornar null) enquanto carrega
    return null;
  }

  return (
    <GlobalErrorBoundary>
      <StatusBar translucent={true} style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? "#10142D" : "#F4F4F6"
          },
        }}
      />
    </GlobalErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
