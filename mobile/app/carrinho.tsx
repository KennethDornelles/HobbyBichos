import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../src/store/cartStore';
import { useRouter } from 'expo-router';
import { X, Plus, Minus } from 'lucide-react-native';
import { useTheme } from '../src/context/ThemeContext';

export default function CarrinhoScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);

    const bgMain = isDark ? '#10142D' : '#F4F4F6';
    const bgCard = isDark ? '#1C213E' : '#FFFFFF';
    const bgButton = isDark ? '#2A2F4F' : '#E5E7EB';
    const textMain = isDark ? '#FFFFFF' : '#10142D';
    const textSecondary = isDark ? '#9CA3AF' : '#6B7280';

    const confirmRemove = (productId: string, name: string) => {
        Alert.alert('Remover item', `Deseja remover ${name}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: () => removeItem(productId) },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-hobby-dark dark:bg-hobby-ice-dark" edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 px-5 pt-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-white dark:text-hobby-text-light text-3xl font-bold">
                            Seu carrinho
                        </Text>
                    </View>

                    {/* Items */}
                    {items.length === 0 ? (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-gray-400 dark:text-hobby-text-secondary text-lg">
                                Seu carrinho está vazio.
                            </Text>
                        </View>
                    ) : (
                        <View className="mb-6">
                            {items.map((item) => (
                                <View
                                    key={item.productId}
                                    className="
                                        bg-[#1C213E] dark:bg-white 
                                        rounded-3xl p-4 mb-4 flex-row items-center
                                        dark:shadow-card-light dark:border dark:border-hobby-border-light
                                    "
                                >
                                    {/* Imagem do produto */}
                                    {item.image ? (
                                        <Image
                                            source={{ uri: item.image }}
                                            className="w-20 h-20 rounded-2xl mr-4"
                                        />
                                    ) : (
                                        <View className="w-20 h-20 rounded-2xl bg-gray-300 mr-4" />
                                    )}

                                    {/* Info do produto */}
                                    <View className="flex-1">
                                        <Text className="text-white dark:text-hobby-text-light font-semibold text-base mb-1">
                                            {item.name}
                                        </Text>
                                        <Text className="text-hobby-yellow dark:text-hobby-yellow-soft font-bold text-lg">
                                            R$ {item.price.toFixed(2)}
                                        </Text>
                                    </View>

                                    {/* Controles de quantidade */}
                                    <View className="flex-row items-center mr-3">
                                        <TouchableOpacity
                                            onPress={() =>
                                                updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                                            }
                                            className="
                                                w-9 h-9 rounded-lg items-center justify-center
                                                bg-[#2A2F4F] dark:bg-gray-200
                                                active:bg-[#353B5F] dark:active:bg-gray-300
                                            "
                                        >
                                            <Minus size={16} color="#FFD600" />
                                        </TouchableOpacity>

                                        <Text className="text-white dark:text-hobby-text-light font-bold text-base mx-4 min-w-[24px] text-center">
                                            {item.quantity}
                                        </Text>

                                        <TouchableOpacity
                                            onPress={() =>
                                                updateQuantity(
                                                    item.productId,
                                                    Math.min(item.maxStock, item.quantity + 1)
                                                )
                                            }
                                            className="
                                                w-9 h-9 rounded-lg items-center justify-center
                                                bg-[#2A2F4F] dark:bg-gray-200
                                                active:bg-[#353B5F] dark:active:bg-gray-300
                                            "
                                        >
                                            <Plus size={16} color="#FFD600" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Botão remover */}
                                    <TouchableOpacity
                                        onPress={() => confirmRemove(item.productId, item.name)}
                                        className="
                                            w-9 h-9 rounded-lg items-center justify-center
                                            bg-red-500/20 dark:bg-red-100
                                            active:bg-red-500/30 dark:active:bg-red-200
                                        "
                                    >
                                        <X size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer com totais */}
            {items.length > 0 && (
                <View className="px-4 pb-8 pt-4 bg-hobby-dark dark:bg-white border-t border-gray-800 dark:border-hobby-border-light">
                    {/* Subtotal */}
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-400 dark:text-hobby-text-secondary text-base">
                            Subtotal
                        </Text>
                        <Text className="text-white dark:text-hobby-text-light font-semibold text-base">
                            R$ {subtotal.toFixed(2)}
                        </Text>
                    </View>

                    {/* Total destacado */}
                    <View className="
                        bg-hobby-yellow dark:bg-hobby-yellow-soft 
                        rounded-full py-4 px-6 mb-3
                        shadow-lg
                    ">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-hobby-dark font-semibold text-sm">Total</Text>
                            <Text className="text-hobby-dark font-bold text-2xl">
                                R$ {subtotal.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Botão checkout */}
                    <TouchableOpacity
                        onPress={() => router.push('/checkout')}
                        className="
                            bg-hobby-yellow dark:bg-hobby-yellow-soft 
                            rounded-full py-4 items-center
                        "
                    >
                        <Text className="text-hobby-dark font-bold text-lg">
                            Proceed to Checkout
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
