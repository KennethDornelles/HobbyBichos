import { Stack, useRouter, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function MainLayout() {
    const { user, isHydrated, isLoading } = useAuth();

    // Double-check: Se o usuário não existe após hydration, RootLayout redireciona,
    // mas aqui garantimos que não renderizamos nada que dependa do user.
    useEffect(() => {
        if (isHydrated && !user && !isLoading) {
            console.warn('⚠️ Usuário null detectado em (main), redirecionando...');
            router.replace('/(auth)/login');
        }
    }, [user, isHydrated, isLoading]);

    // Bloqueia renderização se:
    // 1. Estiver carregando (ex: durante logout)
    // 2. O usuário for null (evidencia que o logout limpou o estado ou acesso indevido)
    if (isLoading || !user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

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
