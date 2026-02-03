import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { setStatusBarStyle, setStatusBarTranslucent } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from "react-native";

SplashScreen.preventAutoHideAsync();

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useCartAutoSync } from "@/hooks/useCartAutoSync";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

function RootLayoutContent() {
  const { isHydrated, user, isLoading } = useAuth();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useCartAutoSync();

  // 1. Controle da Splash Screen - Garante o hide mesmo em caso de erro
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(console.warn);
    }, 5000);

    if ((fontsLoaded || fontError) && isHydrated) {
      SplashScreen.hideAsync().catch(console.warn);
      clearTimeout(safetyTimer);

      setStatusBarTranslucent(true);
      setStatusBarStyle(isDark ? "light" : "dark");
    }
    return () => clearTimeout(safetyTimer);
  }, [fontsLoaded, fontError, isHydrated, isDark]);

  // 2. Lógica de Redirecionamento Automático
  useEffect(() => {
    // ⚡ CRÍTICO: Não navega se estiver em transição (loading) ou hidratando
    if (!isHydrated || !fontsLoaded || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = segments[0] === undefined || segments[0] === '' || segments[0] === 'index';

    if (!user && !inAuthGroup) {
      console.log('🔒 Redirecionando para login...');
      router.replace('/(auth)/login');
    }
    else if (user && (inAuthGroup || isRoot)) {
      console.log('🏠 Redirecionando para home...');
      router.replace('/(main)/home');
    }
  }, [user, isHydrated, fontsLoaded, isLoading, segments]);

  // ⚡ AJUSTE CRÍTICO APK-SAFE: Retorna null durante transições (isLoading)
  // Isso garante que o ViewGroup nativo do Android seja ESVAZIADO completamente
  // antes de montarmos a nova rota, evitando o erro "child already has a parent".
  if (!isHydrated || (!fontsLoaded && !fontError) || isLoading) {
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
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
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