import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useCartStore } from '../store/cartStore';

interface Props {
    product: {
        id: string;
        name: string;
        basePrice: number;
        images?: string[];
        sku?: string | null;
        barcode?: string | null;
        stocks?: Array<{ quantity: number }>;
    };
}

export function ProductCard({ product }: Props) {
    const addItem = useCartStore((s) => s.addItem);
    const image = product.images?.[0] ?? null;
    const maxStock = (product.stocks ?? []).reduce((s, st) => s + st.quantity, 0);
    const sku = product.sku ?? product.barcode ?? '';

    return (
        <View className="bg-white rounded-xl p-3 mb-3">
            {image ? (
                <Image source={{ uri: image }} className="w-full h-40 rounded-lg mb-3" />
            ) : (
                <View className="w-full h-40 rounded-lg mb-3 bg-gray-200" />
            )}
            <Text className="font-semibold">{product.name}</Text>
            <Text className="text-gray-500 mb-3">R$ {product.basePrice.toFixed(2)}</Text>
            <TouchableOpacity
                onPress={() =>
                    addItem({ productId: product.id, name: product.name, price: product.basePrice, image, maxStock, sku })
                }
                className="bg-black rounded-xl p-3"
            >
                <Text className="text-white text-center font-semibold">Adicionar ao carrinho</Text>
            </TouchableOpacity>
        </View>
    );
}
