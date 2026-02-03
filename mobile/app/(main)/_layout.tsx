import { Stack, useRouter, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useRef, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function MainLayout() {
    const { user, isHydrated, isLoading } = useAuth();
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // ⚡ AJUSTE CRÍTICO APK-SAFE: Guards devem retornar null
    // Se retornarmos um componente <View>, o Android tentará montá-lo no ViewGroup.
    // Durante o logout, se o (main) e o (auth) tentarem coexistir no ViewGroup, o app crasheia.

    // Guard 1: Hydration
    if (!isHydrated) return null;

    // Guard 2: Loading (Semáforo de Logout)
    if (isLoading) return null;

    // Guard 3: User existency
    if (!user) return null;

    // Guard 4: Component Mounted
    if (!isMounted.current) return null;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="owner" />
            <Stack.Screen name="super_admin" />
            <Stack.Screen name="manager" />
            {/* Outras rotas serão capturadas automaticamente se não definidas aqui */}
        </Stack>
    );
}
