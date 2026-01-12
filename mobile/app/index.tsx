import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import HomeScreen from "./home";

export default function IndexRedirect() {
    const router = useRouter();
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
                // Token existe, pode ficar na home
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
