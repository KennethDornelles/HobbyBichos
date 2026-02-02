import "../global.css";
import { Stack, useRouter, useSegments, Redirect } from "expo-router";
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



  // ... inside function
  // Determinar se devemos bloquear a renderização da Stack
  // 1. Se estiver carregando fontes ou auth -> null (Splash)
  // 2. Se não houver usuário e não estivermos no grupo de auth -> Redirect

  const inAuthGroup = segments[0] === '(auth)';

  if ((!fontsLoaded && !fontError) || isLoading) {
    return null;
  }

  if (!user && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  // Effect para redirecionar para home se já logado
  useEffect(() => {
    if (user && inAuthGroup) {
      router.replace("/(main)/home");
    }
  }, [user, inAuthGroup]);

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
