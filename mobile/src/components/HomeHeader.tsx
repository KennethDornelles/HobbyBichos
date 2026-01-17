import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import { Search, Camera, ShoppingCart, Menu, Bell } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../services/api';

interface HeaderProps {
    onSearchChange?: (text: string) => void;
    onCameraPress?: () => void;
    onCartPress?: () => void;
    onMenuPress?: () => void;
    cartItemsCount?: number;
    hideCart?: boolean;
    hideCamera?: boolean;
}

export const HomeHeader = React.memo(({ onSearchChange, onCameraPress, onCartPress, onMenuPress, cartItemsCount = 0, hideCart = false, hideCamera = false }: HeaderProps) => {
    const { isDark } = useTheme();
    const { role, id: userId } = useUserStore();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            if (!userId) return;

            const fetchNotifications = async () => {
                try {
                    const response = await api.get('/notifications/user', { params: { userId } });
                    const unread = response.data.filter((n: any) => !n.read).length;
                    setUnreadCount(unread);
                } catch (error) {
                    console.error('Erro ao buscar notificações:', error);
                }
            };
            fetchNotifications();
        }, [userId])
    );

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
                    {(!hideCamera && role !== 'CLIENT') && (
                        <TouchableOpacity onPress={onCameraPress} className="ml-2" activeOpacity={0.7}>
                            <Camera size={24} color="#FDB813" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Botão Notificações */}
                <TouchableOpacity
                    onPress={() => router.push('/notifications')}
                    className="ml-2"
                    activeOpacity={0.7}
                    accessibilityLabel="Notificações"
                >
                    <View>
                        <Bell size={28} color="#FDB813" strokeWidth={2} />
                        {unreadCount > 0 && (
                            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border border-white dark:border-gray-900">
                                <Text className="text-white text-[10px] font-bold">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

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
