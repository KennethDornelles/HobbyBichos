import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Palette, Sun, Moon, Smartphone } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '../src/context/ThemeContext';
import { useThemeColors } from '../src/hooks/useThemeColors';

type ThemeMode = 'system' | 'light' | 'dark';

export default function Settings() {
    const { themeMode, setThemeMode, isDark } = useTheme();
    const colors = useThemeColors();
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
                className="flex-1 items-center justify-center py-4 rounded-xl"
                style={{
                    backgroundColor: isActive ? colors.accentYellow : colors.bgCard,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: colors.borderColor,
                }}
                activeOpacity={0.7}
            >
                <Icon
                    color={isActive ? colors.bgMain : colors.textSecondary}
                    size={24}
                />
                <Text
                    className="mt-2 font-medium"
                    style={{
                        color: isActive ? colors.bgMain : colors.textSecondary
                    }}
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
                className="flex-1 px-4 pt-8"
                style={{ backgroundColor: colors.bgMain }}
                showsVerticalScrollIndicator={false}
            >
                {/* Título da Seção */}
                <View className="flex-row items-center mb-6">
                    <Palette color={colors.accentYellow} size={24} />
                    <Text className="text-xl font-bold ml-3" style={{ color: colors.textMain }}>
                        Aparência
                    </Text>
                </View>

                {/* Seletor de Tema */}
                <View className="rounded-hobby p-4 mb-6" style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}>
                    <View className="flex-row gap-3">
                        <ThemeOption mode="system" icon={Smartphone} label="Sistema" />
                        <ThemeOption mode="light" icon={Sun} label="Claro" />
                        <ThemeOption mode="dark" icon={Moon} label="Escuro" />
                    </View>
                </View>

                {/* Informação adicional */}
                <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                    O tema {themeLabel[themeMode]} está ativo
                </Text>

                {/* Seção adicional - Info */}
                <View className="mt-10">
                    <Text className="text-lg font-bold mb-4" style={{ color: colors.textMain }}>
                        Sobre
                    </Text>

                    <View className="rounded-hobby p-4" style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}>
                        <View className="mb-3">
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                Versão do Aplicativo
                            </Text>
                            <Text className="text-base font-semibold mt-1" style={{ color: colors.textMain }}>
                                1.0.0
                            </Text>
                        </View>

                        <View className="border-t" style={{ borderColor: colors.borderColor }} />

                        <View className="mt-3">
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                Desenvolvido por
                            </Text>
                            <Text className="text-base font-semibold mt-1" style={{ color: colors.textMain }}>
                                Hobby Bichos
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
