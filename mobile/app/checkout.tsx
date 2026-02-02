import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../src/store/cartStore';
import api from '../src/services/api';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, MessageCircle, MapPin, Plus } from 'lucide-react-native';
import { useThemeColors } from '../src/hooks/useThemeColors';
import type { CreateOrderResponse } from '../src/types/order.types';
import { addressService, Address } from '../src/services/addressService';

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

    // Address State
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
    const [creating, setCreating] = useState(false);

    // Carregar lojas ao montar
    useEffect(() => {
        const loadStores = async () => {
            try {
                const response = await api.get<Store[]>('/stores');
                setStores(response.data);
                if (response.data.length > 0) {
                    setSelectedStoreId(response.data[0].id);
                }
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar as lojas disponíveis');
            } finally {
                setLoadingStores(false);
            }
        };
        loadStores();
    }, []);

    // Carregar endereços (usa focus effect para atualizar ao voltar da tela de criação)
    useFocusEffect(
        useCallback(() => {
            const loadAddresses = async () => {
                try {
                    setLoadingAddresses(true);
                    const data = await addressService.getAddresses();
                    setAddresses(data);

                    // Se já tem selecionado, mantem. Se não, pega o default ou o primeiro
                    if (!selectedAddressId && data.length > 0) {
                        const defaultAddr = data.find(a => a.isDefault);
                        setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0].id);
                    }
                } catch (error) {
                    console.log('Erro ao carregar endereços', error);
                } finally {
                    setLoadingAddresses(false);
                }
            };
            loadAddresses();
        }, [selectedAddressId])
    );

    const handleCreateOrder = async () => {
        if (items.length === 0) {
            Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho antes de prosseguir.');
            return;
        }

        if (!selectedStoreId) {
            Alert.alert('Loja não selecionada', 'Por favor, selecione uma loja.');
            return;
        }

        if (!selectedAddressId) {
            Alert.alert('Endereço necessário', 'Por favor, selecione ou cadastre um endereço de entrega.');
            return;
        }

        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddress) return;

        // Formatar endereço string para enviar ao backend
        const shippingAddressString = `${selectedAddress.street}, ${selectedAddress.number} ${selectedAddress.complement ? `(${selectedAddress.complement})` : ''} - ${selectedAddress.district}, ${selectedAddress.city}/${selectedAddress.state}, CEP: ${selectedAddress.zipCode}`;

        setCreating(true);
        try {
            const orderItems = items.map((item) => ({
                productId: item.productId,
                serviceId: null,
                quantity: item.quantity,
                price: item.price,
            }));

            const response = await api.post<CreateOrderResponse>('/orders', {
                storeId: selectedStoreId,
                items: orderItems,
                shippingAddress: shippingAddressString // Enviando string formatada
            });

            const { order, paymentAction } = response.data;

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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}>
                <View className="flex-1 px-5 py-6">
                    {/* Header */}
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
                        <ArrowLeft size={24} color={colors.textMain} />
                        <Text style={{ color: colors.textMain }} className="text-lg font-semibold ml-3">Checkout</Text>
                    </TouchableOpacity>

                    {/* LOJA */}
                    <View className="mb-8">
                        <Text style={{ color: colors.textMain }} className="font-bold text-lg mb-4">Selecione a Loja</Text>
                        {loadingStores ? (
                            <ActivityIndicator size="small" color={colors.accentYellow} />
                        ) : stores.map(store => (
                            <TouchableOpacity
                                key={store.id}
                                onPress={() => setSelectedStoreId(store.id)}
                                style={{
                                    borderColor: selectedStoreId === store.id ? colors.accentYellow : colors.borderColor,
                                    backgroundColor: selectedStoreId === store.id ? colors.accentYellow + '10' : colors.bgCard
                                }}
                                className="border-2 rounded-lg p-3 mb-2 flex-row items-start"
                            >
                                <View
                                    style={{
                                        borderColor: selectedStoreId === store.id ? colors.accentYellow : colors.borderColor,
                                        backgroundColor: selectedStoreId === store.id ? colors.accentYellow : colors.bgCard
                                    }}
                                    className="w-5 h-5 rounded-full border-2 mr-3 mt-1 flex items-center justify-center"
                                >
                                    {selectedStoreId === store.id && <View style={{ backgroundColor: colors.bgMain }} className="w-2 h-2 rounded-full" />}
                                </View>
                                <View className="flex-1">
                                    <Text style={{ color: colors.textMain }} className="font-semibold text-sm">{store.name}</Text>
                                    <Text style={{ color: colors.textSecondary }} className="text-xs">{store.city}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ENDEREÇO */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text style={{ color: colors.textMain }} className="font-bold text-lg">Endereço de Entrega</Text>
                            <TouchableOpacity onPress={() => router.push('/profile/addresses/new')} className="flex-row items-center">
                                <Plus size={16} color={colors.accentYellow} />
                                <Text style={{ color: colors.accentYellow }} className="text-sm font-semibold ml-1">Novo</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingAddresses ? (
                            <ActivityIndicator size="small" color={colors.accentYellow} />
                        ) : addresses.length === 0 ? (
                            <View style={{ backgroundColor: colors.bgInput, borderColor: colors.borderColor }} className="border rounded-lg p-4 items-center">
                                <Text style={{ color: colors.textSecondary }} className="mb-2">Nenhum endereço cadastrado</Text>
                                <TouchableOpacity onPress={() => router.push('/profile/addresses/new')} style={{ backgroundColor: colors.accentYellow }} className="px-4 py-2 rounded-lg">
                                    <Text style={{ color: colors.bgMain }} className="font-bold">Cadastrar Endereço</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            addresses.map(addr => (
                                <TouchableOpacity
                                    key={addr.id}
                                    onPress={() => setSelectedAddressId(addr.id)}
                                    style={{
                                        borderColor: selectedAddressId === addr.id ? colors.accentYellow : colors.borderColor,
                                        backgroundColor: selectedAddressId === addr.id ? colors.accentYellow + '10' : colors.bgCard
                                    }}
                                    className="border-2 rounded-lg p-3 mb-2 flex-row items-start"
                                >
                                    <View
                                        style={{
                                            borderColor: selectedAddressId === addr.id ? colors.accentYellow : colors.borderColor,
                                            backgroundColor: selectedAddressId === addr.id ? colors.accentYellow : colors.bgCard
                                        }}
                                        className="w-5 h-5 rounded-full border-2 mr-3 mt-1 flex items-center justify-center"
                                    >
                                        {selectedAddressId === addr.id && <View style={{ backgroundColor: colors.bgMain }} className="w-2 h-2 rounded-full" />}
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2">
                                            <Text style={{ color: colors.textMain }} className="font-semibold text-sm">{addr.title}</Text>
                                            {addr.isDefault && <Text style={{ color: colors.accentGreen, fontSize: 10 }} className="font-bold bg-green-900/20 px-1 rounded">PADRÃO</Text>}
                                        </View>
                                        <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">
                                            {addr.street}, {addr.number} - {addr.district}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary }} className="text-xs">
                                            {addr.city}/{addr.state} - {addr.zipCode}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {/* PAGAMENTO */}
                    <View className="mb-8">
                        <Text style={{ color: colors.textMain }} className="font-bold text-lg mb-4">Pagamento</Text>
                        <View className="flex-row gap-3">
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
                                    <Text style={{ color: paymentMethod === method ? colors.accentYellow : colors.textSecondary }} className="font-semibold text-sm">
                                        {PAYMENT_LABELS[method]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* TOTAL E BOTÃO */}
                    {items.length > 0 && (
                        <View style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }} className="border rounded-2xl p-4 mb-6">
                            <View className="flex-row justify-between items-center">
                                <Text style={{ color: colors.textMain }} className="text-lg font-bold">Total</Text>
                                <Text style={{ color: colors.textMain }} className="text-xl font-bold">R$ {subtotal.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        disabled={creating || items.length === 0 || !selectedAddressId || !selectedStoreId}
                        onPress={handleCreateOrder}
                        style={{
                            backgroundColor: (creating || items.length === 0 || !selectedAddressId || !selectedStoreId)
                                ? colors.borderColor
                                : colors.accentYellow
                        }}
                        className="p-4 rounded-2xl flex-row items-center justify-center mb-6"
                    >
                        {creating && <ActivityIndicator color={colors.bgMain} style={{ marginRight: 8 }} />}
                        <Text
                            style={{
                                color: (creating || items.length === 0 || !selectedAddressId || !selectedStoreId)
                                    ? colors.textMuted
                                    : colors.bgMain
                            }}
                            className="font-bold text-center text-lg"
                        >
                            {creating ? 'Processando...' : 'Confirmar Pedido'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
