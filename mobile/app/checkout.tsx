import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useCartStore } from '../src/store/cartStore';
import api from '../src/services/api';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import type { CreateOrderResponse } from '../src/types/order.types';

const STORE_ID = 'store1'; // Store padrão (integrado com seed)
const PAYMENT_METHODS = ['creditcard', 'pix', 'debit'];
const PAYMENT_LABELS = {
    creditcard: 'Cartão de Crédito',
    pix: 'PIX',
    debit: 'Débito',
};

export default function CheckoutScreen() {
    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const clear = useCartStore((s) => s.clear);

    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('pix');
    const [creating, setCreating] = useState(false);

    // Criar pedido e redirecionar para WhatsApp
    const handleCreateOrder = async () => {
        if (items.length === 0) {
            Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho antes de prosseguir.');
            return;
        }

        if (!shippingAddress.trim()) {
            Alert.alert('Endereço necessário', 'Por favor, insira seu endereço de entrega.');
            return;
        }

        setCreating(true);
        try {
            const orderItems = items.map((item) => ({
                productId: item.productId,
                serviceId: null,
                quantity: item.quantity,
                price: item.price,
            }));

            console.log('Criando pedido com:', { storeId: STORE_ID, items: orderItems, paymentMethod });

            const response = await api.post<CreateOrderResponse>('/orders', {
                storeId: STORE_ID,
                items: orderItems,
                shippingAddress,
                paymentMethod,
            });

            const { order, paymentAction } = response.data;

            console.log('Pedido criado:', order.id);

            clear();

            router.replace({
                pathname: '/pedido-criado',
                params: {
                    orderId: order.id,
                    whatsappLink: paymentAction.whatsappLink,
                    pixKey: paymentAction.pixKey || '',
                    total: paymentAction.orderTotal.toString(),
                },
            });
        } catch (error: any) {
            console.error('Erro ao criar pedido:', error);
            const errorMessage =
                error?.response?.data?.message ||
                'Não foi possível finalizar o pedido. Tente novamente.';
            Alert.alert('Erro', errorMessage);
        } finally {
            setCreating(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 px-5 py-6">
                    {/* Header */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mb-6"
                    >
                        <ArrowLeft size={24} color="#1A1B2E" />
                        <Text className="text-gray-800 text-lg font-semibold ml-3">Checkout method</Text>
                    </TouchableOpacity>

                    {/* Seção de Endereço */}
                    <View className="mb-8">
                        <Text className="text-gray-800 font-bold text-lg mb-4">Shipping address</Text>
                        <View className="border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50">
                            <TextInput
                                placeholder="Shipping address"
                                placeholderTextColor="#999"
                                value={shippingAddress}
                                onChangeText={setShippingAddress}
                                className="text-gray-800 font-medium"
                                style={{ fontSize: 16 }}
                            />
                        </View>
                    </View>

                    {/* Seção de Pagamento */}
                    <View className="mb-8">
                        <Text className="text-gray-800 font-bold text-lg mb-4">Payment</Text>

                        {/* Métodos de Pagamento - Horizontal */}
                        <View className="flex-row gap-3 mb-6">
                            {PAYMENT_METHODS.map((method) => (
                                <TouchableOpacity
                                    key={method}
                                    onPress={() => setPaymentMethod(method)}
                                    className={`px-4 py-3 rounded-xl flex-1 items-center border-2 ${paymentMethod === method
                                            ? 'border-yellow-400 bg-yellow-50'
                                            : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <Text
                                        className={`font-semibold text-sm ${paymentMethod === method
                                                ? 'text-yellow-600'
                                                : 'text-gray-600'
                                            }`}
                                    >
                                        {PAYMENT_LABELS[method]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Card do Estabelecimento - Payment method */}
                        <View className="bg-gray-900 rounded-2xl p-4 mb-6">
                            <Text className="text-gray-400 text-xs font-semibold mb-3">Payment method</Text>
                            <Text className="text-white font-bold text-lg mb-4">
                                Checkout card
                            </Text>

                            {/* Métodos selecionáveis */}
                            <View className="gap-2">
                                <View className="flex-row items-center gap-2 py-2">
                                    <View
                                        className="w-4 h-4 rounded border-2"
                                        style={{
                                            borderColor:
                                                paymentMethod === 'creditcard'
                                                    ? '#FFB800'
                                                    : '#666',
                                            backgroundColor:
                                                paymentMethod === 'creditcard'
                                                    ? '#FFB800'
                                                    : 'transparent',
                                        }}
                                    />
                                    <Text className="text-white text-sm">Crédito/Débito</Text>
                                </View>
                                <View className="flex-row items-center gap-2 py-2">
                                    <View
                                        className="w-4 h-4 rounded border-2"
                                        style={{
                                            borderColor:
                                                paymentMethod === 'pix'
                                                    ? '#FFB800'
                                                    : '#666',
                                            backgroundColor:
                                                paymentMethod === 'pix'
                                                    ? '#FFB800'
                                                    : 'transparent',
                                        }}
                                    />
                                    <Text className="text-white text-sm">9FF8aaA PIX</Text>
                                </View>
                            </View>
                        </View>

                        {/* Info Card */}
                        <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
                            <Text className="text-gray-700 text-sm leading-5">
                                The toolon tuhe npe bretors, frui inily itdy anclyrodion tectalify. Inopun to namd do
                                qelut a fett cri shed empelo yeyr. Docnode.
                            </Text>
                        </View>
                    </View>

                    {/* Resumo do Pedido */}
                    {items.length > 0 && (
                        <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                            <View className="mb-3 pb-3 border-b border-gray-200">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-600 font-semibold">Subtotal</Text>
                                    <Text className="text-gray-800 font-semibold">
                                        R$ {subtotal.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-lg text-gray-800 font-bold">Total</Text>
                                <Text className="text-xl text-gray-800 font-bold">
                                    R$ {subtotal.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Botão Confirm Order */}
                    <TouchableOpacity
                        disabled={creating || items.length === 0 || !shippingAddress.trim()}
                        onPress={handleCreateOrder}
                        className={`p-4 rounded-2xl flex-row items-center justify-center mb-6 ${creating || items.length === 0 || !shippingAddress.trim()
                                ? 'bg-gray-300'
                                : 'bg-yellow-400'
                            }`}
                    >
                        {creating && <ActivityIndicator color="#1A1B2E" style={{ marginRight: 8 }} />}
                        <MessageCircle
                            size={20}
                            color={
                                creating || items.length === 0 || !shippingAddress.trim()
                                    ? '#999'
                                    : '#1A1B2E'
                            }
                            style={{ marginRight: 8 }}
                        />
                        <Text
                            className={`font-bold text-center text-lg ${creating || items.length === 0 || !shippingAddress.trim()
                                    ? 'text-gray-600'
                                    : 'text-gray-900'
                                }`}
                        >
                            {creating ? 'Processando...' : 'Confirm order'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
