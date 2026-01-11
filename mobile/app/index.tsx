import { useEffect } from "react";
import { useRouter } from "expo-router";
import HomeScreen from "./home";

export default function IndexRedirect() {
    const router = useRouter();

    // Se não autenticado, redirecionar para login
    // Por enquanto, exibindo a home como tela inicial
    useEffect(() => {
        // Descomentar linha abaixo para forçar login
        // router.replace("/login");
    }, []);

    return <HomeScreen />;
}
