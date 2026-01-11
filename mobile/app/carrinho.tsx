import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useCartStore } from '../src/store/cartStore';
import { useRouter } from 'expo-router';

export default function CarrinhoScreen() {
    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);

    const confirmRemove = (productId: string, name: string) => {
        Alert.alert('Remover item', `Deseja remover ${name}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: () => removeItem(productId) },
        ]);
    };

    return (
        <View className="flex-1 p-4">
            <Text className="text-2xl font-semibold mb-4">Seu carrinho</Text>

            {items.length === 0 ? (
                <Text>Seu carrinho está vazio.</Text>
            ) : (
                items.map((item) => (
                    <View key={item.productId} className="flex-row items-center bg-white rounded-xl p-3 mb-3">
                        {item.image ? (
                            <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg mr-3" />
                        ) : (
                            <View className="w-16 h-16 rounded-lg mr-3 bg-gray-200" />
                        )}
                        <View className="flex-1">
                            <Text className="font-semibold">{item.name}</Text>
                            <Text className="text-gray-500">R$ {(item.price).toFixed(2)}</Text>
                            <View className="flex-row items-center mt-2">
                                <TouchableOpacity onPress={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))} className="px-3 py-1 bg-gray-100 rounded-lg mr-2">
                                    <Text>-</Text>
                                </TouchableOpacity>
                                <Text className="mx-2">{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.productId, Math.min(item.maxStock, item.quantity + 1))} className="px-3 py-1 bg-gray-100 rounded-lg ml-2">
                                    <Text>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => confirmRemove(item.productId, item.name)}>
                            <Text className="text-red-500 font-semibold">Remover</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}

            <View className="mt-auto bg-white rounded-xl p-4">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-lg">Subtotal</Text>
                    <Text className="text-lg font-semibold">R$ {subtotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/checkout')} className="bg-black rounded-xl p-3">
                    <Text className="text-white text-center font-semibold">Prosseguir para checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
