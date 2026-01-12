import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Palette, Sun, Moon, Smartphone } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '../src/context/ThemeContext';

type ThemeMode = 'system' | 'light' | 'dark';

export default function Settings() {
    const { themeMode, setThemeMode, isDark } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    const handleThemeChange = async (mode: ThemeMode) => {
        await setThemeMode(mode);
    };

    const ThemeOption = ({
        mode,
        icon: Icon,
        label
    }: {
        mode: ThemeMode;
        icon: any;
        label: string;
    }) => {
        const isActive = themeMode === mode;

        return (
            <TouchableOpacity
                onPress={() => handleThemeChange(mode)}
                className={`
                    flex-1 items-center justify-center py-4 rounded-xl
                    ${isActive
                        ? 'bg-hobby-yellow dark:bg-hobby-yellow-soft shadow-lg'
                        : 'bg-[#1C213E] dark:bg-white/80 dark:border dark:border-hobby-border-light'
                    }
                `}
                activeOpacity={0.7}
            >
                <Icon
                    color={isActive ? '#10142D' : '#9CA3AF'}
                    size={24}
                />
                <Text
                    className={`
                        mt-2 font-medium
                        ${isActive
                            ? 'text-hobby-dark'
                            : 'text-gray-400 dark:text-hobby-text-secondary'
                        }
                    `}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const themeLabel = {
        'system': 'Sistema',
        'light': 'Claro',
        'dark': 'Escuro'
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView
                className="flex-1 px-4 pt-8 bg-hobby-dark dark:bg-hobby-ice-dark"
                showsVerticalScrollIndicator={false}
            >
                {/* Título da Seção */}
                <View className="flex-row items-center mb-6">
                    <Palette color="#FFD600" size={24} />
                    <Text className="text-white dark:text-hobby-text-light text-xl font-bold ml-3">
                        Aparência
                    </Text>
                </View>

                {/* Seletor de Tema */}
                <View className="bg-[#1C213E] dark:bg-white rounded-hobby p-4 mb-6 dark:shadow-card-light dark:border dark:border-hobby-border-light">
                    <View className="flex-row gap-3">
                        <ThemeOption mode="system" icon={Smartphone} label="Sistema" />
                        <ThemeOption mode="light" icon={Sun} label="Claro" />
                        <ThemeOption mode="dark" icon={Moon} label="Escuro" />
                    </View>
                </View>

                {/* Informação adicional */}
                <Text className="text-gray-400 dark:text-hobby-text-secondary text-sm text-center">
                    O tema {themeLabel[themeMode]} está ativo
                </Text>

                {/* Seção adicional - Info */}
                <View className="mt-10">
                    <Text className="text-white dark:text-hobby-text-light text-lg font-bold mb-4">
                        Sobre
                    </Text>

                    <View className="bg-[#1C213E] dark:bg-white rounded-hobby p-4 dark:shadow-card-light dark:border dark:border-hobby-border-light">
                        <View className="mb-3">
                            <Text className="text-gray-400 dark:text-hobby-text-secondary text-sm">
                                Versão do Aplicativo
                            </Text>
                            <Text className="text-white dark:text-hobby-text-light text-base font-semibold mt-1">
                                1.0.0
                            </Text>
                        </View>

                        <View className="border-t border-[#2A2F4F] dark:border-hobby-border-light" />

                        <View className="mt-3">
                            <Text className="text-gray-400 dark:text-hobby-text-secondary text-sm">
                                Desenvolvido por
                            </Text>
                            <Text className="text-white dark:text-hobby-text-light text-base font-semibold mt-1">
                                Hobby Bichos
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
