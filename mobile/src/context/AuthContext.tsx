import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    storeId?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
    isLoading: boolean;
    isHydrated: boolean;
    token: string | null;
    login: (userData: User, authToken: string, refreshToken?: string) => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = '@app:user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const isSigningOut = React.useRef(false);

    // Busca usuário e token salvos ao iniciar o app
    useEffect(() => {
        restoreAuth();
    }, []);

    const restoreAuth = async () => {
        try {
            setIsLoading(true);
            const [savedToken, savedUser] = await Promise.all([
                SecureStore.getItemAsync('authToken'),
                AsyncStorage.getItem(USER_KEY),
            ]);

            if (savedToken && savedUser) {
                const userData = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(userData);
                console.log('✅ Autenticação restaurada:', userData.name, 'Role:', userData.role);
            } else {
                console.log('ℹ️ Nenhuma sessão anterior encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao restaurar autenticação:', error);
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
            setIsHydrated(true);
        }
    };

    const login = async (userData: User, authToken: string, refreshToken?: string) => {
        try {
            setIsLoading(true);
            const promises = [
                AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
                SecureStore.setItemAsync('authToken', authToken),
            ];

            if (refreshToken) {
                promises.push(SecureStore.setItemAsync('refreshToken', refreshToken));
            }

            await Promise.all(promises);

            setToken(authToken);
            setUser(userData);
            console.log('✅ Login realizado:', userData.name, 'Role:', userData.role);
        } catch (error) {
            console.error('❌ Erro ao salvar autenticação:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (userData: User) => {
        setUser(userData);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    };

    const signOut = async () => {
        if (isSigningOut.current) return;

        try {
            console.log('🔄 Iniciando logout seguro (APK-Safe)...');
            isSigningOut.current = true;
            setIsLoading(true);

            // 1. Navegação ANTES de qualquer limpeza de estado
            // Isso inicia a transição de saída enquanto o objeto 'user' ainda é válido
            router.replace('/(auth)/login');

            // 2. Pequeno delay para permitir que o Router inicie a desmontagem do grupo (main)
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Limpeza do Storage (assíncrona)
            await Promise.allSettled([
                AsyncStorage.removeItem(USER_KEY),
                SecureStore.deleteItemAsync('authToken'),
                SecureStore.deleteItemAsync('refreshToken'),
            ]);

            // 4. Limpeza do Estado (Apenas após o delay de segurança)
            setToken(null);
            setUser(null);

            console.log('✅ Logout seguro concluído');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            // Fallback crítico
            router.replace('/(auth)/login');
            setUser(null);
        } finally {
            // Mantemos isLoading=true por mais um pouco para garantir que ninguém tente re-renderizar main
            setTimeout(() => {
                setIsLoading(false);
                isSigningOut.current = false;
            }, 500);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, signOut, isLoading, isHydrated, token, login, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};