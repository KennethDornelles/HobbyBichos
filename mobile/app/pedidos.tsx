import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ShoppingBag, AlertCircle } from 'lucide-react-native';
import api from '../src/services/api';
import type { OrderListResponse, OrderListItem } from '../src/types/order.types';

export default function OrdersListScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mapear status para cores
    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            WAITING_PAYMENT: 'bg-yellow-100 text-yellow-800',
            PAID: 'bg-green-100 text-green-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            DELIVERED: 'bg-emerald-100 text-emerald-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Mapear status para texto legível
    const getStatusText = (status: string): string => {
        const texts: Record<string, string> = {
            WAITING_PAYMENT: 'Aguardando Pagamento',
            PAID: 'Pago',
            PROCESSING: 'Processando',
            DELIVERED: 'Entregue',
            CANCELLED: 'Cancelado',
        };
        return texts[status] || status;
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
            const response = await api.get<OrderListResponse>('/orders');
            setOrders(response.data.orders);
            console.log('Pedidos carregados:', response.data.orders.length);
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

    // Render item do pedido
    const renderOrderItem = ({ item }: { item: OrderListItem }) => {
        const shortId = item.id.substring(0, 8).toUpperCase();

        return (
            <TouchableOpacity
                onPress={() => router.push(`/pedidos/${item.id}`)}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-100 active:opacity-70"
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800">Pedido {shortId}</Text>
                        <Text className="text-xs text-gray-500 mt-1">{item.id}</Text>
                    </View>
                    <View className={`rounded-full px-3 py-1 ${getStatusColor(item.status)}`}>
                        <Text className="text-xs font-semibold">{getStatusText(item.status)}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                    <Text className="text-gray-600 text-sm">{formatDate(item.createdAt)}</Text>
                    <View className="bg-yellow-50 rounded-lg px-3 py-2">
                        <Text className="text-yellow-800 font-bold text-base">
                            {formatCurrency(item.total)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Empty state
    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center p-6">
            <ShoppingBag size={64} color="#d1d5db" />
            <Text className="text-xl font-bold text-gray-800 mt-4 text-center">
                Você ainda não fez nenhum pedido
            </Text>
            <Text className="text-gray-600 text-center mt-2 mb-6">
                Explore nossos produtos e faça seu primeiro pedido!
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/produtos')}
                className="bg-blue-500 rounded-xl p-4 px-8"
            >
                <Text className="text-white font-bold text-center">Ir para Produtos</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-600 mt-4">Carregando seus pedidos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-100 p-4">
                <Text className="text-3xl font-bold text-gray-800">Meus Pedidos</Text>
                <Text className="text-gray-600 text-sm mt-1">
                    {orders.length} pedido{orders.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Erro */}
            {error && !refreshing && (
                <View className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded-lg flex-row">
                    <AlertCircle size={20} color="#dc2626" style={{ marginRight: 12 }} />
                    <View className="flex-1">
                        <Text className="text-red-800 font-semibold">Erro</Text>
                        <Text className="text-red-700 text-sm mt-1">{error}</Text>
                    </View>
                </View>
            )}

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
                            colors={['#3b82f6']}
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
                            colors={['#3b82f6']}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}
