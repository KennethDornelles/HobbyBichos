import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    TextInput,
    FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../src/store/cartStore';
import api from '../src/services/api';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, MapPin } from 'lucide-react-native';
import { useThemeColors } from '../src/hooks/useThemeColors';
import type { CreateOrderResponse } from '../src/types/order.types';

interface Store {
    id: string;
    name: string;
    address: string;
    city: string;
    whatsappNumber: string;
}

const PAYMENT_METHODS = ['creditcard', 'pix', 'debit'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    creditcard: 'Cartão de Crédito',
    pix: 'PIX',
    debit: 'Débito',
};

export default function CheckoutScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const clear = useCartStore((s) => s.clear);
    const insets = useSafeAreaInsets();

    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [loadingStores, setLoadingStores] = useState(true);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
    const [creating, setCreating] = useState(false);

    // Carregar lojas ao montar
    useEffect(() => {
        const loadStores = async () => {
            try {
                const response = await api.get<Store[]>('/stores');
                setStores(response.data);
                // Selecionar primeira loja por padrão
                if (response.data.length > 0) {
                    setSelectedStoreId(response.data[0].id);
                }
            } catch (error) {
                console.error('Erro ao carregar lojas:', error);
                Alert.alert('Erro', 'Não foi possível carregar as lojas disponíveis');
            } finally {
                setLoadingStores(false);
            }
        };
        loadStores();
    }, []);

    // Criar pedido e redirecionar para WhatsApp
    const handleCreateOrder = async () => {
        if (items.length === 0) {
            Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho antes de prosseguir.');
            return;
        }

        if (!selectedStoreId) {
            Alert.alert('Loja não selecionada', 'Por favor, selecione uma loja.');
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

            console.log('Criando pedido com:', { storeId: selectedStoreId, items: orderItems });

            // Backend apenas aceita: storeId, items, petId, appointmentId
            const response = await api.post<CreateOrderResponse>('/orders', {
                storeId: selectedStoreId,
                items: orderItems,
            });

            const { order, paymentAction } = response.data;

            console.log('Pedido criado:', order.id);
            console.log('WhatsApp Link recebido:', paymentAction.whatsappLink);
            console.log('Decodificado:', decodeURIComponent(paymentAction.whatsappLink));

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
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bgMain }} edges={['top', 'bottom']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: insets.bottom + 16
                }}
            >
                <View className="flex-1 px-5 py-6">
                    {/* Header */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mb-6"
                    >
                        <ArrowLeft size={24} color={colors.textMain} />
                        <Text style={{ color: colors.textMain }} className="text-lg font-semibold ml-3">Checkout method</Text>
                    </TouchableOpacity>

                    {/* Seção de Loja - Antes do Endereço */}
                    <View className="mb-8">
                        <Text style={{ color: colors.textMain }} className="font-bold text-lg mb-4">Selecione a Loja</Text>
                        {loadingStores ? (
                            <View className="items-center py-4">
                                <ActivityIndicator size="large" color={colors.accentYellow} />
                            </View>
                        ) : stores.length === 0 ? (
                            <View style={{ backgroundColor: colors.accentRed + '10', borderColor: colors.accentRed + '30' }} className="border rounded-lg p-3">
                                <Text style={{ color: colors.accentRed }} className="text-sm">Nenhuma loja disponível</Text>
                            </View>
                        ) : (
                            <FlatList
                                scrollEnabled={false}
                                data={stores}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setSelectedStoreId(item.id)}
                                        style={{
                                            borderColor: selectedStoreId === item.id ? colors.accentYellow : colors.borderColor,
                                            backgroundColor: selectedStoreId === item.id ? colors.accentYellow + '10' : colors.bgCard
                                        }}
                                        className="border-2 rounded-lg p-3 mb-2 flex-row items-start"
                                    >
                                        <View
                                            style={{
                                                borderColor: selectedStoreId === item.id ? colors.accentYellow : colors.borderColor,
                                                backgroundColor: selectedStoreId === item.id ? colors.accentYellow : colors.bgCard
                                            }}
                                            className="w-5 h-5 rounded-full border-2 mr-3 mt-1 flex items-center justify-center"
                                        >
                                            {selectedStoreId === item.id && (
                                                <View style={{ backgroundColor: colors.bgMain }} className="w-2 h-2 rounded-full" />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: colors.textMain }} className="font-semibold text-sm">
                                                {item.name}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <MapPin size={12} color={colors.textSecondary} />
                                                <Text style={{ color: colors.textSecondary }} className="text-xs ml-1">
                                                    {item.address}, {item.city}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>

                    {/* Seção de Endereço */}
                    <View className="mb-8">
                        <Text style={{ color: colors.textMain }} className="font-bold text-lg mb-4">Shipping address</Text>
                        <View style={{ borderColor: colors.borderColor, backgroundColor: colors.bgInput }} className="border rounded-2xl px-4 py-3">
                            <TextInput
                                placeholder="Shipping address"
                                placeholderTextColor={colors.textMuted}
                                value={shippingAddress}
                                onChangeText={setShippingAddress}
                                style={{ color: colors.textMain, fontSize: 16 }}
                                className="font-medium"
                            />
                        </View>
                    </View>

                    {/* Seção de Pagamento */}
                    <View className="mb-8">
                        <Text style={{ color: colors.textMain }} className="font-bold text-lg mb-4">Payment</Text>

                        {/* Métodos de Pagamento - Horizontal */}
                        <View className="flex-row gap-3 mb-6">
                            {PAYMENT_METHODS.map((method) => (
                                <TouchableOpacity
                                    key={method}
                                    onPress={() => setPaymentMethod(method)}
                                    style={{
                                        borderColor: paymentMethod === method ? colors.accentYellow : colors.borderColor,
                                        backgroundColor: paymentMethod === method ? colors.accentYellow + '10' : colors.bgInput
                                    }}
                                    className="px-4 py-3 rounded-xl flex-1 items-center border-2"
                                >
                                    <Text
                                        style={{
                                            color: paymentMethod === method ? colors.accentYellow : colors.textSecondary
                                        }}
                                        className="font-semibold text-sm"
                                    >
                                        {PAYMENT_LABELS[method]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Card do Estabelecimento - Payment method */}
                        <View style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }} className="rounded-2xl p-4 mb-6 border">
                            <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mb-3">Payment method</Text>
                            <Text style={{ color: colors.textMain }} className="font-bold text-lg mb-4">
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
                                                    ? colors.accentYellow
                                                    : colors.borderColor,
                                            backgroundColor:
                                                paymentMethod === 'creditcard'
                                                    ? colors.accentYellow
                                                    : 'transparent',
                                        }}
                                    />
                                    <Text style={{ color: colors.textMain }} className="text-sm">Crédito/Débito</Text>
                                </View>
                                <View className="flex-row items-center gap-2 py-2">
                                    <View
                                        className="w-4 h-4 rounded border-2"
                                        style={{
                                            borderColor:
                                                paymentMethod === 'pix'
                                                    ? colors.accentYellow
                                                    : colors.borderColor,
                                            backgroundColor:
                                                paymentMethod === 'pix'
                                                    ? colors.accentYellow
                                                    : 'transparent',
                                        }}
                                    />
                                    <Text style={{ color: colors.textMain }} className="text-sm">PIX</Text>
                                </View>
                            </View>
                        </View>

                        {/* Info Card */}
                        <View style={{ backgroundColor: colors.bgInput, borderColor: colors.borderColor }} className="border rounded-xl p-4 mb-8">
                            <Text style={{ color: colors.textSecondary }} className="text-sm leading-5">
                                💳 Seus dados de pagamento são processados de forma segura.
                                Após a confirmação, você receberá um link para finalizar o pagamento
                                via WhatsApp com a loja.
                            </Text>
                        </View>
                    </View>

                    {/* Resumo do Pedido */}
                    {items.length > 0 && (
                        <View style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }} className="border rounded-2xl p-4 mb-6">
                            <View style={{ borderBottomColor: colors.borderColor }} className="mb-3 pb-3 border-b">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text style={{ color: colors.textSecondary }} className="font-semibold">Subtotal</Text>
                                    <Text style={{ color: colors.textMain }} className="font-semibold">
                                        R$ {subtotal.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text style={{ color: colors.textMain }} className="text-lg font-bold">Total</Text>
                                <Text style={{ color: colors.textMain }} className="text-xl font-bold">
                                    R$ {subtotal.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Botão Confirm Order */}
                    <TouchableOpacity
                        disabled={creating || items.length === 0 || !shippingAddress.trim() || !selectedStoreId || loadingStores}
                        onPress={handleCreateOrder}
                        style={{
                            backgroundColor: (creating || items.length === 0 || !shippingAddress.trim() || !selectedStoreId || loadingStores)
                                ? colors.borderColor
                                : colors.accentYellow
                        }}
                        className="p-4 rounded-2xl flex-row items-center justify-center mb-6"
                    >
                        {creating && <ActivityIndicator color={colors.bgMain} style={{ marginRight: 8 }} />}
                        <MessageCircle
                            size={20}
                            color={
                                creating || items.length === 0 || !shippingAddress.trim() || !selectedStoreId || loadingStores
                                    ? colors.textMuted
                                    : colors.bgMain
                            }
                            style={{ marginRight: 8 }}
                        />
                        <Text
                            style={{
                                color: (creating || items.length === 0 || !shippingAddress.trim() || !selectedStoreId || loadingStores)
                                    ? colors.textMuted
                                    : colors.bgMain
                            }}
                            className="font-bold text-center text-lg"
                        >
                            {creating ? 'Processando...' : 'Confirm order'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
