import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import HomeScreen from "./home";
import { useUserStore } from "../src/store/userStore";

export default function IndexRedirect() {
    const router = useRouter();
    const { loadUserProfile } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                // Sem token, redirecionar para login
                router.replace("/login");
            } else {
                // Token existe, carregar perfil do usuário
                await loadUserProfile();
                setIsChecking(false);
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            router.replace("/login");
        }
    };

    if (isChecking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return <HomeScreen />;
}
