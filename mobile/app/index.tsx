
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/context/AuthContext";

export default function IndexRedirect() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace("/login");
            } else {
                // Redireciona para a home/tela correta conforme o role
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
        }
    }, [user, isLoading, router]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF6B35" />
        </View>
    );
}
