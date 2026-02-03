import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from "@/store/cartStore";
import { useRouter } from 'expo-router';
import { X, Plus, Minus } from 'lucide-react-native';
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

interface StockInfo {
    productId: string;
    availableStock: number;
    loading: boolean;
}

export default function CarrinhoScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);

    const [stockInfo, setStockInfo] = useState<Map<string, StockInfo>>(new Map());

    // Carregar estoque disponível para cada produto no carrinho
    useEffect(() => {
        const loadStockInfo = async () => {
            const newStockInfo = new Map<string, StockInfo>();

            for (const item of items) {
                if (!stockInfo.has(item.productId)) {
                    newStockInfo.set(item.productId, {
                        productId: item.productId,
                        availableStock: 0,
                        loading: true,
                    });
                }
            }

            setStockInfo((prev) => new Map([...prev, ...newStockInfo]));

            // Buscar estoque de cada produto
            for (const item of items) {
                try {
                    const response = await api.get(`/products/${item.productId}`);
                    const product = response.data;

                    // Calcular estoque total disponível em todas as lojas
                    const totalStock = product.stocks?.reduce((sum: number, stock: any) => sum + stock.quantity, 0) || 0;

                    setStockInfo((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(item.productId, {
                            productId: item.productId,
                            availableStock: totalStock,
                            loading: false,
                        });
                        return newMap;
                    });
                } catch (error) {
                    console.error(`Erro ao buscar estoque do produto ${item.productId}:`, error);
                    setStockInfo((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(item.productId, {
                            productId: item.productId,
                            availableStock: 0,
                            loading: false,
                        });
                        return newMap;
                    });
                }
            }
        };

        if (items.length > 0) {
            void loadStockInfo();
        }
    }, [items]);

    const confirmRemove = (productId: string, name: string) => {
        Alert.alert('Remover item', `Deseja remover ${name}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: () => removeItem(productId) },
        ]);
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bgMain }} edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}>
                <View className="flex-1 px-5 pt-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text style={{ color: colors.textMain }} className="text-3xl font-bold">
                            Seu carrinho
                        </Text>
                    </View>

                    {/* Items */}
                    {items.length === 0 ? (
                        <View className="flex-1 justify-center items-center">
                            <Text style={{ color: colors.textSecondary }} className="text-lg">
                                Seu carrinho está vazio.
                            </Text>
                        </View>
                    ) : (
                        <View className="mb-6">
                            {items.map((item) => (
                                <View
                                    key={item.productId}
                                    style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
                                    className="rounded-3xl p-4 mb-4 flex-row items-center border"
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
                                        <Text style={{ color: colors.textMain }} className="font-semibold text-base mb-1">
                                            {item.name}
                                        </Text>
                                        <Text style={{ color: colors.accentYellow }} className="font-bold text-lg mb-2">
                                            R$ {item.price.toFixed(2)}
                                        </Text>

                                        {/* Informação de estoque */}
                                        <View className="flex-row items-center">
                                            {stockInfo.get(item.productId)?.loading ? (
                                                <ActivityIndicator size="small" color={colors.accentGreen} />
                                            ) : (
                                                <>
                                                    {stockInfo.get(item.productId)?.availableStock ?? 0 > 0 ? (
                                                        <>
                                                            <Ionicons name="checkmark-circle" size={14} color={colors.accentGreen} />
                                                            <Text style={{ color: colors.accentGreen }} className="text-xs ml-1 font-semibold">
                                                                {stockInfo.get(item.productId)?.availableStock ?? 0} em estoque
                                                            </Text>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ionicons name="alert-circle" size={14} color={colors.accentRed} />
                                                            <Text style={{ color: colors.accentRed }} className="text-xs ml-1 font-semibold">
                                                                Fora de estoque
                                                            </Text>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {/* Controles de quantidade */}
                                    <View className="flex-row items-center mr-3">
                                        <TouchableOpacity
                                            onPress={() =>
                                                updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                                            }
                                            style={{ backgroundColor: colors.bgInput }}
                                            className="w-9 h-9 rounded-lg items-center justify-center"
                                        >
                                            <Minus size={16} color={colors.accentYellow} />
                                        </TouchableOpacity>

                                        <Text style={{ color: colors.textMain }} className="font-bold text-base mx-4 min-w-[24px] text-center">
                                            {item.quantity}
                                        </Text>

                                        <TouchableOpacity
                                            onPress={() =>
                                                updateQuantity(
                                                    item.productId,
                                                    Math.min(item.maxStock, item.quantity + 1)
                                                )
                                            }
                                            style={{ backgroundColor: colors.bgInput }}
                                            className="w-9 h-9 rounded-lg items-center justify-center"
                                        >
                                            <Plus size={16} color={colors.accentYellow} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Botão remover */}
                                    <TouchableOpacity
                                        onPress={() => confirmRemove(item.productId, item.name)}
                                        style={{ backgroundColor: colors.accentRed + '20' }}
                                        className="w-9 h-9 rounded-lg items-center justify-center"
                                    >
                                        <X size={18} color={colors.accentRed} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer com totais */}
            {items.length > 0 && (
                <View style={{ backgroundColor: colors.bgMain, borderTopColor: colors.borderColor }} className="px-4 pb-8 pt-4 border-t">
                    {/* Subtotal */}
                    <View className="flex-row justify-between mb-4">
                        <Text style={{ color: colors.textSecondary }} className="text-base">
                            Subtotal
                        </Text>
                        <Text style={{ color: colors.textMain }} className="font-semibold text-base">
                            R$ {subtotal.toFixed(2)}
                        </Text>
                    </View>

                    {/* Total destacado */}
                    <View style={{ backgroundColor: colors.accentYellow }} className="rounded-full py-4 px-6 mb-3 shadow-lg">
                        <View className="flex-row justify-between items-center">
                            <Text className="font-semibold text-sm" style={{ color: colors.bgMain }}>Total</Text>
                            <Text className="font-bold text-2xl" style={{ color: colors.bgMain }}>
                                R$ {subtotal.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Botão checkout */}
                    <TouchableOpacity
                        onPress={() => router.push('/checkout')}
                        style={{ backgroundColor: colors.accentYellow }}
                        className="rounded-full py-4 items-center"
                    >
                        <Text className="font-bold text-lg" style={{ color: colors.bgMain }}>
                            Proceed to Checkout
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
