import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../src/store/cartStore';
import { useRouter } from 'expo-router';
import { X, Plus, Minus } from 'lucide-react-native';

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
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#1A1B2E' }} edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 px-5 pt-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-white">Seu carrinho</Text>
                    </View>

                    {/* Items */}
                    {items.length === 0 ? (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-gray-400 text-lg">Seu carrinho está vazio.</Text>
                        </View>
                    ) : (
                        <View className="mb-6">
                            {items.map((item) => (
                                <View
                                    key={item.productId}
                                    className="flex-row items-center rounded-2xl p-4 mb-3"
                                    style={{ backgroundColor: '#2D2E3F' }}
                                >
                                    {/* Imagem */}
                                    {item.image ? (
                                        <Image
                                            source={{ uri: item.image }}
                                            className="w-20 h-20 rounded-xl mr-4"
                                        />
                                    ) : (
                                        <View className="w-20 h-20 rounded-xl mr-4 bg-gray-600" />
                                    )}

                                    {/* Info do Produto */}
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-base mb-1">
                                            {item.name}
                                        </Text>
                                        <Text className="text-yellow-400 font-bold text-lg mb-3">
                                            R$ {item.price.toFixed(2)}
                                        </Text>

                                        {/* Controles de quantidade */}
                                        <View className="flex-row items-center gap-3">
                                            <TouchableOpacity
                                                onPress={() =>
                                                    updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                                                }
                                                className="w-8 h-8 rounded-lg items-center justify-center"
                                                style={{ backgroundColor: '#3D3E4F' }}
                                            >
                                                <Minus size={16} color="#FFB800" />
                                            </TouchableOpacity>

                                            <Text className="text-white font-semibold text-base w-8 text-center">
                                                {item.quantity}
                                            </Text>

                                            <TouchableOpacity
                                                onPress={() =>
                                                    updateQuantity(
                                                        item.productId,
                                                        Math.min(item.maxStock, item.quantity + 1)
                                                    )
                                                }
                                                className="w-8 h-8 rounded-lg items-center justify-center"
                                                style={{ backgroundColor: '#3D3E4F' }}
                                            >
                                                <Plus size={16} color="#FFB800" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Botão Remover */}
                                    <TouchableOpacity
                                        onPress={() => confirmRemove(item.productId, item.name)}
                                        className="w-10 h-10 rounded-lg items-center justify-center ml-2"
                                        style={{ backgroundColor: '#3D3E4F' }}
                                    >
                                        <X size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer com Total */}
            {items.length > 0 && (
                <View className="px-5 pb-6" style={{ backgroundColor: '#1A1B2E' }}>
                    {/* Subtotal */}
                    <View className="mb-4 pb-4 border-b" style={{ borderColor: '#3D3E4F' }}>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-400 font-semibold text-base">Subtotal</Text>
                            <Text className="text-yellow-400 font-bold text-base">
                                R$ {subtotal.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Total destacado */}
                    <View
                        className="rounded-2xl p-5 mb-5 items-center"
                        style={{ backgroundColor: '#FFB800' }}
                    >
                        <Text className="text-gray-800 text-sm font-semibold mb-1">Total</Text>
                        <Text className="text-gray-900 text-3xl font-bold">
                            R$ {subtotal.toFixed(2)}
                        </Text>
                        <View className="w-16 h-1 rounded-full mt-3" style={{ backgroundColor: '#FFA500' }} />
                    </View>

                    {/* Botão Prosseguir */}
                    <TouchableOpacity
                        onPress={() => router.push('/checkout')}
                        className="p-4 rounded-2xl items-center"
                        style={{ backgroundColor: '#FFB800' }}
                    >
                        <Text className="text-gray-900 text-center font-bold text-lg">Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
