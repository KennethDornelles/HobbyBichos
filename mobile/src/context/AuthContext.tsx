import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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
    token: string | null;
    login: (userData: User, authToken: string, refreshToken?: string) => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = '@app:token';
const USER_KEY = '@app:user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
        try {
            setIsLoading(true);

            // Aguardar limpeza do storage
            await Promise.all([
                AsyncStorage.removeItem(USER_KEY),
                SecureStore.deleteItemAsync('authToken'),
                SecureStore.deleteItemAsync('refreshToken'),
            ]);

            // Atualiza estados
            setToken(null);
            setUser(null);

            console.log('✅ Logout realizado');
        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);
        } finally {
            // Pequeno timeout para garantir que os efeitos do _layout (redirecionamento)
            // sejam disparados assim que isLoading mudar
            setTimeout(() => {
                setIsLoading(false);
            }, 100);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, signOut, isLoading, token, login, updateUser }}>
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