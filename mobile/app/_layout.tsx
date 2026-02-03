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

  // 1. Controle da Splash Screen
  useEffect(() => {
    // Timeout de segurança: Se em 5 segundos nada acontecer, forçamos o hide
    const safetyTimer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 5000);

    if ((fontsLoaded || fontError) && !isLoading) {
      // Pequeno timeout para garantir que o estado de auth foi processado
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
        clearTimeout(safetyTimer);
      }, 500);
      return () => {
        clearTimeout(timer);
        clearTimeout(safetyTimer);
      };
    }
    return () => clearTimeout(safetyTimer);
  }, [fontsLoaded, fontError, isLoading]);

  // 2. Controle de Navegação/Redirecionamento
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirecionar para login se não houver usuário e não estiver em (auth)
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirecionar para home se usuário já estiver logado (evitar login duplo)
      router.replace("/(main)/home");
    }
  }, [user, isLoading, segments, fontsLoaded]);

  // Enquanto carrega o estado inicial ou fontes, mantemos o retorno null
  // (a Splash Screen segurando o app)
  if ((!fontsLoaded && !fontError) || isLoading) {
    return null;
  }

  const inAuthGroup = segments[0] === '(auth)';

  // ROTA PROTEGIDA: Se não houver usuário logado e tentarmos acessar rota protegida,
  // bloqueamos a renderização totalmente para evitar crashes.
  if (!user && !inAuthGroup) {
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
