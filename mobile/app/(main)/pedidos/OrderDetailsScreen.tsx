import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Linking,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle, Truck, AlertCircle, MessageCircle, MapPin, RefreshCw } from 'lucide-react-native';
import api from "@/services/api";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { OrderDetailsResponse } from "@/types/order.types";

interface StatusConfig {
    text: string;
    color: string;
    icon: React.ReactNode;
    bgColor: string;
}

export default function OrderDetailsScreen() {
    const router = useRouter();
    const { id: orderId } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTracking, setShowTracking] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Usar hook de tracking com polling adaptativo
    const { order: trackedOrder, loading: trackingLoading, lastUpdate } = useDeliveryTracking(
        orderId || '',
    );

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

    // Buscar detalhes do pedido (carregamento inicial)
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

    // Atualizar dados do pedido com tracking em tempo real
    useEffect(() => {
        if (trackedOrder) {
            setOrder(trackedOrder);
        }
    }, [trackedOrder]);

    // Abrir WhatsApp
    const handleOpenWhatsapp = async () => {
        if (!order?.paymentAction?.whatsappLink) {
            Alert.alert('Erro', 'Link do WhatsApp não disponível');
            return;
        }
        try {
            // Android 11+ visibility rules often block canOpenURL for unlisted schemes.
            // Direct openURL works by letting the OS handle the intent resolution.
            await Linking.openURL(order.paymentAction.whatsappLink);
        } catch (error) {
            console.error('Erro ao abrir WhatsApp:', error);
            Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
        }
    };

    // Atualizar status para teste
    const handleUpdateStatusForTest = async () => {
        if (!orderId) return;

        const statuses = ['WAITING_PAYMENT', 'PAID', 'PROCESSING', 'DELIVERED'];
        const currentIndex = statuses.indexOf(order?.status || 'WAITING_PAYMENT');
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        setUpdatingStatus(true);
        try {
            const response = await api.patch(`/orders/${orderId}/test-status`, {
                status: nextStatus,
            });
            setOrder(response.data);
            Alert.alert('Sucesso', `Status atualizado para: ${nextStatus}`);
        } catch (err: any) {
            console.error('Erro ao atualizar status:', err);
            const errorMsg = err?.response?.data?.message || 'Erro ao atualizar status';
            Alert.alert('Erro', errorMsg);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bgMain, paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <StatusBar barStyle="light-content" backgroundColor={colors.bgMain} />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accentYellow} />
                    <Text style={{ color: colors.textSecondary }} className="mt-4">Carregando pedido...</Text>
                </View>
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bgMain, paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <StatusBar barStyle="light-content" backgroundColor={colors.bgMain} />
                <View className="flex-1 p-4 items-center justify-center">
                    <AlertCircle size={48} color="#ef4444" />
                    <Text style={{ color: colors.textMain }} className="font-semibold mt-4 text-center">Pedido não encontrado</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-center mt-2">{error || 'Ocorreu um erro ao carregar o pedido'}</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ backgroundColor: colors.accentYellow }}
                        className="rounded-xl p-3 mt-6 px-6"
                    >
                        <Text className="text-white font-semibold">Voltar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const shortOrderId = order.id.substring(0, 8).toUpperCase();

    return (
        <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bgCard} />

            {/* Header */}
            <View style={{ backgroundColor: colors.bgCard, paddingTop: insets.top }}>
                <View style={{ backgroundColor: colors.bgCard, borderBottomColor: colors.borderColor }} className="flex-row items-center p-4 border-b">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ArrowLeft size={24} color={colors.textMain} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text style={{ color: colors.textMain }} className="text-lg font-bold">Pedido {shortOrderId}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-xs">{order.id}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: insets.bottom + 20
                }}
            >
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
                        <View style={{ backgroundColor: colors.bgInput, borderColor: colors.borderColor }} className="border rounded-xl p-4 mb-6">
                            <View className="flex-row items-center mb-3">
                                <Clock size={20} color="#ca8a04" style={{ marginRight: 8 }} />
                                <Text style={{ color: colors.textMain }} className="font-bold flex-1">Finalize o Pagamento</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary }} className="text-sm mb-4 leading-5">
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

                    {/* Card de Rastreamento */}
                    {(order.status === 'PROCESSING' || order.status === 'DELIVERED') && (
                        <View style={{ backgroundColor: colors.bgInput, borderColor: colors.borderColor }} className="border rounded-xl p-4 mb-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center flex-1">
                                    <MapPin size={20} color={colors.accentYellow} style={{ marginRight: 8 }} />
                                    <View className="flex-1">
                                        <Text style={{ color: colors.textMain }} className="font-bold">Rastreamento</Text>
                                        {lastUpdate && (
                                            <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">
                                                Atualizado: {lastUpdate.toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                })}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {trackingLoading && (
                                    <ActivityIndicator size="small" color={colors.accentYellow} />
                                )}
                            </View>
                            <Text style={{ color: colors.textSecondary }} className="text-sm mb-4 leading-5">
                                {order.status === 'PROCESSING'
                                    ? 'Seu pedido está sendo preparado e em breve sairá para entrega'
                                    : 'Acompanhe o status da entrega em tempo real'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowTracking(!showTracking)}
                                style={{ backgroundColor: colors.accentYellow }}
                                className="rounded-lg p-3 flex-row items-center justify-center"
                            >
                                <Truck size={18} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-semibold">
                                    {showTracking ? 'Ocultar' : 'Ver'} Rastreamento
                                </Text>
                            </TouchableOpacity>

                            {showTracking && (
                                <View className="mt-4 bg-white rounded-lg p-3 border border-blue-200">
                                    <Text className="text-gray-600 text-xs mb-2">
                                        Clique em "Acompanhar Entrega" para ver o mapa em tempo real
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            router.push({
                                                pathname: '/googlemaps-test',
                                                params: { orderId: order.id, status: 'delivery' },
                                            } as any);
                                        }}
                                        className="bg-green-500 rounded-lg p-3 flex-row items-center justify-center"
                                    >
                                        <Truck size={16} color="white" style={{ marginRight: 8 }} />
                                        <Text className="text-white font-semibold text-sm">
                                            Acompanhar Entrega
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Seção de Itens */}
                    <Text style={{ color: colors.textMain }} className="text-lg font-semibold mb-3">Itens do Pedido</Text>
                    <View style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }} className="rounded-xl p-4 mb-6 border">
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                                <View key={item.id}>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-1">
                                            <Text style={{ color: colors.textMain }} className="font-semibold mb-1">{item.productId}</Text>
                                            <Text style={{ color: colors.textSecondary }} className="text-sm">
                                                {item.quantity}x {formatCurrency(item.price)}
                                            </Text>
                                        </View>
                                        <Text style={{ color: colors.textMain }} className="font-bold">
                                            {formatCurrency(item.price * item.quantity)}
                                        </Text>
                                    </View>
                                    {idx < (order.items?.length || 0) - 1 && (
                                        <View style={{ borderColor: colors.borderColor }} className="border-t my-3" />
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: colors.textSecondary }} className="text-center py-4">Nenhum item neste pedido</Text>
                        )}
                    </View>

                    {/* Botão de teste */}
                    <TouchableOpacity
                        onPress={handleUpdateStatusForTest}
                        disabled={updatingStatus}
                        style={{ backgroundColor: colors.textSecondary }}
                        className="rounded-xl p-4 mb-6 flex-row items-center justify-center"
                    >
                        <RefreshCw size={18} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-semibold">
                            {updatingStatus ? 'Atualizando...' : 'Testar Próximo Status'}
                        </Text>
                    </TouchableOpacity>

                    {/* Resumo Total */}
                    <View style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }} className="rounded-xl p-4 border">
                        <View style={{ borderColor: colors.borderColor }} className="flex-row justify-between items-center pb-3 border-b">
                            <Text style={{ color: colors.textSecondary }} className="font-semibold">Subtotal</Text>
                            <Text style={{ color: colors.textMain }} className="font-semibold">{formatCurrency(order.total)}</Text>
                        </View>
                        <View className="flex-row justify-between items-center mt-3">
                            <Text style={{ color: colors.textMain }} className="text-lg font-bold">Total</Text>
                            <Text style={{ color: colors.textMain }} className="text-2xl font-bold">{formatCurrency(order.total)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}