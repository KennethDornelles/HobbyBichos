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
    if (!isHydrated || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = segments[0] === undefined || segments[0] === '';

    if (!user && !inAuthGroup) {
      console.log('🔒 Redirecionando para login...');
      router.replace('/(auth)/login');
    }
    else if (user && (inAuthGroup || isRoot)) {
      console.log('🏠 Redirecionando para home...');
      router.replace('/(main)/home');
    }
  }, [user, isHydrated, fontsLoaded, segments]);

  // AJUSTE CRÍTICO: Bloqueia se não estiver hidratado, se fontes não carregaram OU se estiver em loading (Logout)
  // Isso evita que a Stack (main) tente renderizar componentes dependentes de user enquanto o logout acontece.
  if (!isHydrated || (!fontsLoaded && !fontError) || isLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDark ? "#10142D" : "#F4F4F6",
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Mostra um carregamento discreto atrás da Splash se demorar ou durante transições de auth */}
        <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#111827"} />
      </View>
    );
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