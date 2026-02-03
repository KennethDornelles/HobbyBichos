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
            console.log('🔄 Iniciando logout seguro...');
            isSigningOut.current = true;
            setIsLoading(true);

            // 1. Limpeza do Storage (assíncrona e persistente)
            await Promise.allSettled([
                AsyncStorage.removeItem(USER_KEY),
                SecureStore.deleteItemAsync('authToken'),
                SecureStore.deleteItemAsync('refreshToken'),
            ]);

            // 2. Navegação ANTES de limpar o estado do usuário
            // Isso evita que as telas protegidas tentem renderizar com user null
            router.replace('/(auth)/login');

            // 3. Pequeno delay para garantir que a navegação foi iniciada/processada
            await new Promise(resolve => setTimeout(resolve, 300));

            // 4. Agora sim limpamos o estado
            setToken(null);
            setUser(null);

            console.log('✅ Logout seguro concluído');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            // Fallback: tenta sair de qualquer jeito
            router.replace('/(auth)/login');
            setUser(null);
        } finally {
            setIsLoading(false);
            isSigningOut.current = false;
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