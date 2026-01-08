import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const signOut = async () => {
        setIsLoading(true);
        try {
            const { removeToken } = await import('../utils/removeToken');
            await removeToken();
        } catch (error) {
            // Ignorar erro, garantir remoção
        } finally {
            setUser(null);
            setIsLoading(false);
        }
    };
    return (
        <AuthContext.Provider value={{ user, setUser, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
    return (
        <AuthContext.Provider value={{ user, setUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
