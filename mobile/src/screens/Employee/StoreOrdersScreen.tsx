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
import { Package, ShoppingBag } from 'lucide-react-native';
import api from '../../services/api';
import { useThemeColors } from '../../hooks/useThemeColors';

interface Order {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'WAITING_PAYMENT' | 'PAID' | 'DELIVERED';
    totalAmount: number;
    clientName: string;
    createdAt: string;
    items: Array<{
        id: string;
        productName: string;
        quantity: number;
        price: number;
    }>;
}

export default function StoreOrdersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mapear status para botão de ação
    const getActionButton = (status: string) => {
        switch (status) {
            case 'PENDING':
            case 'WAITING_PAYMENT':
                return { text: 'Processar', color: colors.accentYellow };
            case 'PAID':
            case 'PROCESSING':
                return { text: 'Ver Detalhes', color: colors.accentYellow };
            case 'COMPLETED':
            case 'DELIVERED':
                return { text: 'Concluído', color: colors.accentGreen };
            case 'CANCELLED':
                return { text: 'Cancelado', color: colors.textSecondary };
            default:
                return { text: 'Ver', color: colors.textSecondary };
        }
    };

    // Mapear status para texto do card
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
            case 'WAITING_PAYMENT':
                return { title: 'Aguardando Pagamento', subtitle: 'Cliente deve confirmar' };
            case 'PAID':
                return { title: 'Pedido Pago', subtitle: 'Pronto para processar' };
            case 'PROCESSING':
                return { title: 'Em Processamento', subtitle: 'Preparando pedido' };
            case 'COMPLETED':
            case 'DELIVERED':
                return { title: 'Entregue', subtitle: 'Pedido concluído' };
            case 'CANCELLED':
                return { title: 'Cancelado', subtitle: 'Pedido cancelado' };
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
            console.log('Buscando pedidos da loja...');
            const response = await api.get<Order[]>('/orders');
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

    // Finalizar pedido
    const handleFinishOrder = async (orderId: string, orderNumber: string) => {
        Alert.alert(
            'Finalizar Pedido',
            `Confirmar finalização do pedido ${orderNumber}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Finalizar',
                    style: 'default',
                    onPress: async () => {
                        try {
                            await api.patch(`/orders/${orderId}/finish`);
                            Alert.alert('Sucesso', 'Pedido finalizado com sucesso');
                            await loadOrders();
                        } catch (err: any) {
                            console.error('Erro ao finalizar pedido:', err);
                            const errorMsg = err?.response?.data?.message || 'Não foi possível finalizar o pedido';
                            Alert.alert('Erro', errorMsg);
                        }
                    },
                },
            ]
        );
    };

    // Render item do pedido
    const renderOrderItem = ({ item }: { item: Order }) => {
        const statusInfo = getStatusInfo(item.status);
        const actionButton = getActionButton(item.status);
        const canFinish = item.status === 'PROCESSING' || item.status === 'PAID';

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
                            <Text style={{ color: colors.textSecondary }} className="text-sm mt-0.5">Pedido #{item.orderNumber}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">Cliente: {item.clientName}</Text>
                        </View>
                    </View>

                    {/* Botão de Ação */}
                    <TouchableOpacity
                        onPress={() => Alert.alert('Detalhes', `Pedido ${item.orderNumber}`)}
                        style={{ backgroundColor: actionButton.color }}
                        className="rounded-full px-5 py-2.5 active:opacity-80"
                    >
                        <Text style={{ color: colors.bgMain }} className="text-sm font-semibold">{actionButton.text}</Text>
                    </TouchableOpacity>
                </View>

                {/* Info adicional - Total */}
                <View className="flex-row items-center justify-between mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.borderColorLight }}>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">Total do pedido</Text>
                    <Text style={{ color: colors.textMain }} className="text-base font-bold">{formatCurrency(item.totalAmount)}</Text>
                </View>

                {/* Botão de finalizar (se aplicável) */}
                {canFinish && (
                    <TouchableOpacity
                        onPress={() => handleFinishOrder(item.id, item.orderNumber)}
                        style={{ backgroundColor: colors.accentGreen }}
                        className="mt-3 rounded-full py-2 active:opacity-70"
                    >
                        <Text style={{ color: '#fff' }} className="font-semibold text-center text-sm">Finalizar Pedido</Text>
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
                Nenhum pedido na loja
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mt-2 mb-8 leading-5">
                Os pedidos aparecerão aqui quando os clientes fizerem compras
            </Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={{ backgroundColor: colors.bgMain }} className="flex-1 items-center justify-center" edges={['top', 'bottom']}>
                <ActivityIndicator size="large" color={colors.accentYellow} />
                <Text style={{ color: colors.textSecondary }} className="mt-4 font-medium">Carregando pedidos da loja...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ backgroundColor: colors.bgMain }} className="flex-1" edges={['top', 'bottom']}>
            {/* Header */}
            <View style={{ backgroundColor: colors.bgCard }} className="px-5 pt-6 pb-4">
                <Text style={{ color: colors.textMain }} className="text-2xl font-bold">Pedidos da Loja</Text>
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
                            colors={[colors.accentYellow]}
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
