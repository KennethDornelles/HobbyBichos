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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ShoppingBag, Package } from 'lucide-react-native';
import api from '../src/services/api';
import { useThemeColors } from '../src/hooks/useThemeColors';
import type { OrderListItem } from '../src/types/order.types';

export default function OrdersListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mapear status para botão de ação
    const getActionButton = (status: string) => {
        switch (status) {
            case 'WAITING_PAYMENT':
                return { text: 'Pagar', color: colors.accentYellow };
            case 'PAID':
                return { text: 'Rastrear', color: colors.accentYellow };
            case 'PROCESSING':
                return { text: 'Acompanhar', color: colors.accentYellow };
            case 'DELIVERED':
                return { text: 'Recebido', color: colors.accentGreen };
            default:
                return { text: 'Ver', color: colors.textSecondary };
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
            <View style={{ backgroundColor: colors.bgCard }} className="rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-center justify-between">
                    {/* Ícone e Info */}
                    <View className="flex-row items-center flex-1">
                        <View style={{ backgroundColor: colors.accentYellow + '20' }} className="w-12 h-12 rounded-xl items-center justify-center mr-3">
                            <Package size={24} color={colors.accentYellow} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: colors.textMain }} className="text-base font-bold">{statusInfo.title}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-sm mt-0.5">Pedido #{shortId}</Text>
                        </View>
                    </View>

                    {/* Botão de Ação */}
                    <TouchableOpacity
                        onPress={() => router.push(`/pedidos/${item.id}`)}
                        style={{ backgroundColor: actionButton.color }}
                        className="rounded-full px-5 py-2.5 active:opacity-80"
                    >
                        <Text style={{ color: colors.bgMain }} className="text-sm font-semibold">{actionButton.text}</Text>
                    </TouchableOpacity>
                </View>

                {/* Botão de cancelar (se aplicável) */}
                {canCancel && (
                    <TouchableOpacity
                        onPress={() => handleCancelOrder(item.id, shortId)}
                        style={{ borderColor: colors.accentRed + '50' }}
                        className="mt-3 border rounded-full py-2 active:opacity-70"
                    >
                        <Text style={{ color: colors.accentRed }} className="font-semibold text-center text-sm">Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Empty state
    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center p-8">
            <ShoppingBag size={72} color={colors.textMuted} />
            <Text style={{ color: colors.textMain }} className="text-xl font-bold mt-6 text-center">
                Você ainda não fez nenhum pedido
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mt-2 mb-8 leading-5">
                Explore nossos produtos e faça seu primeiro pedido!
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/loja')}
                style={{ backgroundColor: colors.accentYellow }}
                className="rounded-full py-3.5 px-10 active:opacity-80"
            >
                <Text style={{ color: colors.bgMain }} className="font-bold text-base">Ir para Produtos</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={{ backgroundColor: colors.bgMain }} className="flex-1 items-center justify-center" edges={['top', 'bottom']}>
                <ActivityIndicator size="large" color={colors.accentYellow} />
                <Text style={{ color: colors.textSecondary }} className="mt-4 font-medium">Carregando seus pedidos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ backgroundColor: colors.bgMain }} className="flex-1" edges={['top', 'bottom']}>
            {/* Header */}
            <View style={{ backgroundColor: colors.bgCard }} className="px-5 pt-6 pb-4">
                <Text style={{ color: colors.textMain }} className="text-2xl font-bold">Meus Pedidos</Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                    {orders.length} pedido{orders.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Lista de pedidos */}
            {orders.length > 0 ? (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
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
                            colors={[colors.accentYellow]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}
