import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle, Truck, AlertCircle, MessageCircle } from 'lucide-react-native';
import api from '../../src/services/api';
import type { OrderDetailsResponse } from '../../src/types/order.types';

interface StatusConfig {
    text: string;
    color: string;
    icon: React.ReactNode;
    bgColor: string;
}

export default function OrderDetailsScreen() {
    const router = useRouter();
    const { id: orderId } = useLocalSearchParams<{ id: string }>();

    const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mapear status para cores e ícones
    const getStatusConfig = (status: string): StatusConfig => {
        const configs: Record<string, StatusConfig> = {
            WAITING_PAYMENT: {
                text: 'Aguardando Pagamento',
                color: '#ca8a04',
                bgColor: '#fef3c7',
                icon: <Clock size={20} color="#ca8a04" />,
            },
            PAID: {
                text: 'Pagamento Confirmado',
                color: '#16a34a',
                bgColor: '#dcfce7',
                icon: <CheckCircle size={20} color="#16a34a" />,
            },
            PROCESSING: {
                text: 'Processando',
                color: '#2563eb',
                bgColor: '#dbeafe',
                icon: <CheckCircle size={20} color="#2563eb" />,
            },
            DELIVERED: {
                text: 'Entregue',
                color: '#059669',
                bgColor: '#d1fae5',
                icon: <Truck size={20} color="#059669" />,
            },
            CANCELLED: {
                text: 'Cancelado',
                color: '#dc2626',
                bgColor: '#fee2e2',
                icon: <AlertCircle size={20} color="#dc2626" />,
            },
        };
        return configs[status] || configs.WAITING_PAYMENT;
    };

    // Formatar valor monetário em BRL
    const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Formatar data em pt-BR
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Buscar detalhes do pedido
    useEffect(() => {
        (async () => {
            if (!orderId) {
                setError('ID do pedido não fornecido');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                console.log('Buscando pedido:', orderId);
                const response = await api.get<OrderDetailsResponse>(`/orders/${orderId}`);
                setOrder(response.data);
                console.log('Pedido carregado:', response.data);
            } catch (err: any) {
                console.error('Erro ao carregar pedido:', err);
                const errorMsg = err?.response?.data?.message || 'Não foi possível carregar o pedido. Tente novamente.';
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        })();
    }, [orderId]);

    // Abrir WhatsApp
    const handleOpenWhatsapp = async () => {
        if (!order?.paymentAction?.whatsappLink) {
            Alert.alert('Erro', 'Link do WhatsApp não disponível');
            return;
        }
        try {
            const supported = await Linking.canOpenURL(order.paymentAction.whatsappLink);
            if (supported) {
                await Linking.openURL(order.paymentAction.whatsappLink);
            } else {
                Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
            }
        } catch (error) {
            console.error('Erro ao abrir WhatsApp:', error);
            Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-600 mt-4">Carregando pedido...</Text>
            </SafeAreaView>
        );
    }

    if (error || !order) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 p-4 items-center justify-center">
                    <AlertCircle size={48} color="#ef4444" />
                    <Text className="text-gray-800 font-semibold mt-4 text-center">Pedido não encontrado</Text>
                    <Text className="text-gray-600 text-center mt-2">{error || 'Ocorreu um erro ao carregar o pedido'}</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-blue-500 rounded-xl p-3 mt-6 px-6"
                    >
                        <Text className="text-white font-semibold">Voltar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const shortOrderId = order.id.substring(0, 8).toUpperCase();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">Pedido {shortOrderId}</Text>
                    <Text className="text-xs text-gray-600">{order.id}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className="p-4">
                    {/* Badge de Status */}
                    <View
                        className="rounded-xl p-4 mb-6 flex-row items-center"
                        style={{ backgroundColor: statusConfig.bgColor }}
                    >
                        {statusConfig.icon}
                        <View className="ml-3 flex-1">
                            <Text className="font-semibold" style={{ color: statusConfig.color }}>
                                {statusConfig.text}
                            </Text>
                            <Text className="text-xs mt-1" style={{ color: statusConfig.color }}>
                                {formatDate(order.createdAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Card de alerta para aguardando pagamento */}
                    {order.status === 'WAITING_PAYMENT' && (
                        <View className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
                            <View className="flex-row items-center mb-3">
                                <Clock size={20} color="#ca8a04" style={{ marginRight: 8 }} />
                                <Text className="text-amber-900 font-bold flex-1">Finalize o Pagamento</Text>
                            </View>
                            <Text className="text-amber-800 text-sm mb-4 leading-5">
                                Envie a confirmação de pagamento pelo WhatsApp da loja para que seu pedido seja processado.
                            </Text>
                            <TouchableOpacity
                                onPress={handleOpenWhatsapp}
                                className="bg-green-500 rounded-lg p-3 flex-row items-center justify-center"
                            >
                                <MessageCircle size={18} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-semibold">Abrir WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Seção de Itens */}
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Itens do Pedido</Text>
                    <View className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                                <View key={item.id}>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-1">
                                            <Text className="text-gray-800 font-semibold mb-1">{item.productId}</Text>
                                            <Text className="text-sm text-gray-600">
                                                {item.quantity}x {formatCurrency(item.price)}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-800 font-bold">
                                            {formatCurrency(item.price * item.quantity)}
                                        </Text>
                                    </View>
                                    {idx < (order.items?.length || 0) - 1 && (
                                        <View className="border-t border-gray-100 my-3" />
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-600 text-center py-4">Nenhum item neste pedido</Text>
                        )}
                    </View>

                    {/* Resumo Total */}
                    <View className="bg-white rounded-xl p-4 border border-gray-100">
                        <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
                            <Text className="text-gray-600 font-semibold">Subtotal</Text>
                            <Text className="text-gray-800 font-semibold">{formatCurrency(order.total)}</Text>
                        </View>
                        <View className="flex-row justify-between items-center mt-3">
                            <Text className="text-lg text-gray-800 font-bold">Total</Text>
                            <Text className="text-2xl text-gray-800 font-bold">{formatCurrency(order.total)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
