import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemeMode;
    resolvedTheme: ResolvedTheme;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = '@hobby_bichos:theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isInitialized, setIsInitialized] = useState(false);

    // Resolve o tema baseado no modo e no sistema
    const resolvedTheme: ResolvedTheme = 
        themeMode === 'system' 
            ? (systemColorScheme === 'dark' ? 'dark' : 'light')
            : themeMode;

    const isDark = resolvedTheme === 'dark';

    // Carrega a preferência salva ao inicializar
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                    setThemeModeState(savedTheme as ThemeMode);
                }
            } catch (error) {
                console.error('Erro ao carregar preferência de tema:', error);
            } finally {
                setIsInitialized(true);
            }
        };

        loadThemePreference();
    }, []);

    // Salva a preferência quando muda
    const setThemeMode = async (mode: ThemeMode) => {
        try {
            setThemeModeState(mode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Erro ao salvar preferência de tema:', error);
        }
    };

    // Alterna entre light e dark (ignora system)
    const toggleTheme = async () => {
        const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
        await setThemeMode(newMode);
    };

    // Renderiza com tema padrão enquanto carrega para não bloquear navegação
    return (
        <ThemeContext.Provider
            value={{
                themeMode,
                resolvedTheme,
                isDark,
                setThemeMode,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de ThemeProvider');
    }
    return context;
};
