import React from 'react';
import { View, Text } from 'react-native';
import { useCartStore } from '../store/cartStore';

export function CartBadge() {
    const total = useCartStore((s) => s.totalItems());
    if (total === 0) return null;
    return (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full px-2 py-1">
            <Text className="text-white text-xs font-semibold">{total}</Text>
        </View>
    );
}
