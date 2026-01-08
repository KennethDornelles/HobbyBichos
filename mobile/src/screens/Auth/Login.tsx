
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const router = useRouter();
    const { setUser } = useAuth();

    const handleLogin = () => {
        // Simula login bem-sucedido
        setUser({ name: 'Usuário' });
        router.replace('/'); // Redireciona para a Home
    };

    return (
        <View>
            <Text>Login Screen</Text>
            <Button title="Entrar" onPress={handleLogin} />
        </View>
    );
};

export default Login;
