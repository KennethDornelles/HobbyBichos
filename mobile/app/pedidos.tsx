import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ShoppingBag, Package } from 'lucide-react-native';
import api from '../src/services/api';
import type { OrderListItem } from '../src/types/order.types';

export default function OrdersListScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mapear status para botão de ação
    const getActionButton = (status: string) => {
        switch (status) {
            case 'WAITING_PAYMENT':
                return { text: 'Pagar', color: 'bg-[#1A1B2E]' };
            case 'PAID':
                return { text: 'Rastrear', color: 'bg-[#1A1B2E]' };
            case 'PROCESSING':
                return { text: 'Acompanhar', color: 'bg-[#1A1B2E]' };
            case 'DELIVERED':
                return { text: 'Recebido', color: 'bg-green-600' };
            default:
                return { text: 'Ver', color: 'bg-gray-600' };
        }
    };

    // Mapear status para texto do card
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'WAITING_PAYMENT':
                return { title: 'Aguardando Pagamento', subtitle: 'Confirme o pagamento' };
            case 'PAID':
                return { title: 'Pedido Pago', subtitle: 'Em preparação' };
            case 'PROCESSING':
                return { title: 'Em Processamento', subtitle: 'Preparando pedido' };
            case 'DELIVERED':
                return { title: 'Entregue', subtitle: 'Pedido concluído' };
            default:
                return { title: 'Pedido', subtitle: 'Status: ' + status };
        }
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
        });
    };

    // Buscar pedidos
    const loadOrders = async () => {
        try {
            setError(null);
            console.log('Buscando pedidos...');
            const response = await api.get<OrderListItem[]>('/orders');
            setOrders(response.data);
            console.log('Pedidos carregados:', response.data.length);
        } catch (err: any) {
            console.error('Erro ao carregar pedidos:', err);
            const errorMsg = err?.response?.data?.message || 'Não foi possível carregar os pedidos';
            setError(errorMsg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Carregar ao montar
    useEffect(() => {
        loadOrders();
    }, []);

    // Recarregar quando a tela fica em foco
    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    // Pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
    };

    // Cancelar pedido
    const handleCancelOrder = async (orderId: string, shortId: string) => {
        Alert.alert(
            'Cancelar Pedido',
            `Tem certeza que deseja cancelar o pedido ${shortId}?`,
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.patch(`/orders/${orderId}/cancel`);
                            Alert.alert('Sucesso', 'Pedido cancelado com sucesso');
                            await loadOrders();
                        } catch (err: any) {
                            console.error('Erro ao cancelar pedido:', err);
                            const errorMsg = err?.response?.data?.message || 'Não foi possível cancelar o pedido';
                            Alert.alert('Erro', errorMsg);
                        }
                    },
                },
            ]
        );
    };

    // Render item do pedido
    const renderOrderItem = ({ item }: { item: OrderListItem }) => {
        const shortId = item.id.substring(0, 8).toUpperCase();
        const statusInfo = getStatusInfo(item.status);
        const actionButton = getActionButton(item.status);
        const canCancel = item.status !== 'CANCELLED' && item.status !== 'DELIVERED';

        return (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-center justify-between">
                    {/* Ícone e Info */}
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center mr-3">
                            <Package size={24} color="#f97316" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900">{statusInfo.title}</Text>
                            <Text className="text-sm text-gray-500 mt-0.5">Pedido #{shortId}</Text>
                        </View>
                    </View>

                    {/* Botão de Ação */}
                    <TouchableOpacity
                        onPress={() => router.push(`/pedidos/${item.id}`)}
                        className={`${actionButton.color} rounded-full px-5 py-2.5 active:opacity-80`}
                    >
                        <Text className="text-white text-sm font-semibold">{actionButton.text}</Text>
                    </TouchableOpacity>
                </View>

                {/* Botão de cancelar (se aplicável) */}
                {canCancel && (
                    <TouchableOpacity
                        onPress={() => handleCancelOrder(item.id, shortId)}
                        className="mt-3 border border-red-300 rounded-full py-2 active:opacity-70"
                    >
                        <Text className="text-red-600 font-semibold text-center text-sm">Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Empty state
    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center p-8">
            <ShoppingBag size={72} color="#d1d5db" />
            <Text className="text-xl font-bold text-gray-900 mt-6 text-center">
                Você ainda não fez nenhum pedido
            </Text>
            <Text className="text-gray-500 text-center mt-2 mb-8 leading-5">
                Explore nossos produtos e faça seu primeiro pedido!
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/loja')}
                className="bg-[#1A1B2E] rounded-full py-3.5 px-10 active:opacity-80"
            >
                <Text className="text-white font-bold text-base">Ir para Produtos</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center" edges={['top', 'bottom']}>
                <ActivityIndicator size="large" color="#1A1B2E" />
                <Text className="text-gray-600 mt-4 font-medium">Carregando seus pedidos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="bg-white px-5 pt-6 pb-4">
                <Text className="text-2xl font-bold text-gray-900">Meus Pedidos</Text>
                <Text className="text-gray-500 text-sm mt-1">
                    {orders.length} pedido{orders.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Lista de pedidos */}
            {orders.length > 0 ? (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#1A1B2E']}
                        />
                    }
                />
            ) : (
                <FlatList
                    data={[]}
                    renderItem={renderOrderItem}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#1A1B2E']}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}
