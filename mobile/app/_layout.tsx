import "../global.css";
import { Stack, useRouter, useSegments, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { setStatusBarStyle, setStatusBarTranslucent } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useCartAutoSync } from "@/hooks/useCartAutoSync";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

function RootLayoutContent() {
  const { isHydrated, user } = useAuth();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useCartAutoSync();

  // Lógica Centralizada de Redirecionamento e Proteção
  useEffect(() => {
    if (!isHydrated || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    // Usuário deslogado tentando acessar área protegida
    if (!user && inMainGroup) {
      console.log('🔒 Redirecionando para login (sem autenticação)');
      router.replace('/(auth)/login');
    }
    // Usuário logado na tela de autenticação ou index
    else if (user && (inAuthGroup || segments[0] === undefined)) {
      console.log('🏠 Redirecionando para área principal (já autenticado)');
      // Redireciona baseado no role
      switch (user.role) {
        case 'OWNER':
          router.replace('/(main)/owner');
          break;
        case 'SUPER_ADMIN':
          router.replace('/(main)/super_admin');
          break;
        case 'MANAGER':
          router.replace('/(main)/manager');
          break;
        case 'EMPLOYEE':
        case 'CLIENT':
        default:
          router.replace('/(main)/home');
          break;
      }
    }
  }, [user, segments, isHydrated, fontsLoaded]);

  // Bloqueia TUDO até as fontes carregarem e a sessão ser restaurada (isHydrated)
  if ((!fontsLoaded && !fontError) || !isHydrated) {
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
