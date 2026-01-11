import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Search, Camera, ShoppingCart, Menu } from 'lucide-react-native';

interface HeaderProps {
    onSearchChange?: (text: string) => void;
    onCameraPress?: () => void;
    onCartPress?: () => void;
    onMenuPress?: () => void;
}

export const HomeHeader = React.memo(({ onSearchChange, onCameraPress, onCartPress, onMenuPress }: HeaderProps) => (
    <View className="bg-primary-dark px-4 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
            {/* Botão Menu */}
            <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
                <Menu size={28} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>

            {/* Campo de Busca */}
            <View className="flex-1 flex-row items-center bg-card-input rounded-lg px-4 py-3">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                    placeholder="Buscar na Hobby Bichos"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3 text-white text-base"
                    onChangeText={onSearchChange}
                />
                <TouchableOpacity onPress={onCameraPress} className="ml-2" activeOpacity={0.7}>
                    <Camera size={24} color="#FDB813" />
                </TouchableOpacity>
            </View>

            {/* Botão Carrinho */}
            <TouchableOpacity onPress={onCartPress} activeOpacity={0.7}>
                <ShoppingCart size={28} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
        </View>
    </View>
));

HomeHeader.displayName = 'HomeHeader';
