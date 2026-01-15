import React from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import { Search, Camera, ShoppingCart, Menu } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
    onSearchChange?: (text: string) => void;
    onCameraPress?: () => void;
    onCartPress?: () => void;
    onMenuPress?: () => void;
    cartItemsCount?: number;
    hideCart?: boolean;
}

export const HomeHeader = React.memo(({ onSearchChange, onCameraPress, onCartPress, onMenuPress, cartItemsCount = 0, hideCart = false }: HeaderProps) => {
    const { isDark } = useTheme();

    return (
        <View className="bg-primary-dark px-4 pt-2 pb-4">
            <View className="flex-row items-center gap-3">
                {/* Botão Menu */}
                <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
                    <Menu size={28} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>

                {/* Campo de Busca */}
                <View className="flex-1 flex-row items-center bg-card-input dark:bg-white rounded-lg px-4 py-3">
                    <Search size={20} color={isDark ? "#9CA3AF" : "#374151"} />
                    <TextInput
                        placeholder="Buscar na Hobby Bichos"
                        placeholderTextColor={isDark ? "#9CA3AF" : "#374151"}
                        className="flex-1 ml-3 text-white dark:text-gray-900 text-base"
                        onChangeText={onSearchChange}
                    />
                    <TouchableOpacity onPress={onCameraPress} className="ml-2" activeOpacity={0.7}>
                        <Camera size={24} color="#FDB813" />
                    </TouchableOpacity>
                </View>

                {/* Botão Carrinho com Badge */}
                {!hideCart && (
                    <View>
                        <TouchableOpacity onPress={onCartPress} activeOpacity={0.7}>
                            <ShoppingCart size={28} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                        {cartItemsCount > 0 && (
                            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                                <Text className="text-white text-xs font-bold">
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
});

HomeHeader.displayName = 'HomeHeader';
