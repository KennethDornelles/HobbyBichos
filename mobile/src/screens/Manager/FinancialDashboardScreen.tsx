import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Alert,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { managerService, RevenueData, TopProduct, TopService, CustomerMetrics } from '../../services/managerService';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import { BarChart, Users as UsersIcon, TrendingUp, Package } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function FinancialDashboardScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const router = useRouter();

    // Guard contra renderização sem usuário (evita crash no logout)
    if (!user) return null;
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [topServices, setTopServices] = useState<TopService[]>([]);
    const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user) return;

        if (user.role && !['MANAGER', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
            Alert.alert('Acesso Negado', 'Apenas gerentes, proprietários e administradores podem acessar esta área.', [
                { text: 'OK', onPress: () => router.replace('/home') },
            ]);
            return;
        }
        loadData();
    }, [user, selectedPeriod]);

    const loadData = async () => {
        try {
            const [revenueData, products, services, customers] = await Promise.all([
                managerService.getRevenue(selectedPeriod),
                managerService.getTopProducts(5),
                managerService.getTopServices(5),
                managerService.getCustomerMetrics(
                    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
                    new Date().toISOString()
                ),
            ]);
            setRevenue(revenueData);
            setTopProducts(products);
            setTopServices(services);
            setCustomerMetrics(customers);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [selectedPeriod]);

    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';

    const periodOptions = [
        { value: 'today', label: 'Hoje' },
        { value: 'week', label: 'Semana' },
        { value: 'month', label: 'Mês' },
        { value: 'year', label: 'Ano' },
    ];

    if (loading && !revenue) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: bgColor }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{ padding: 16, paddingTop: 60 }}>
                {/* Header */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>
                        Dashboard Financeiro
                    </Text>
                    <Text style={{ fontSize: 16, color: '#8B92A9' }}>
                        Acompanhe suas finanças
                    </Text>
                </View>

                {/* Filtro de Período */}
                <View style={{ marginBottom: 24 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {periodOptions.map((option) => (
                                <Pressable
                                    key={option.value}
                                    onPress={() => setSelectedPeriod(option.value as any)}
                                    style={{
                                        backgroundColor: selectedPeriod === option.value ? '#FF6B35' : cardBgColor,
                                        borderRadius: 20,
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                        borderWidth: 1,
                                        borderColor: selectedPeriod === option.value ? '#FF6B35' : borderColor,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: selectedPeriod === option.value ? '#FFFFFF' : textColor,
                                            fontWeight: '600',
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {revenue && (
                    <>
                        {/* Card de Receita Principal */}
                        <View
                            style={{
                                backgroundColor: '#FF6B35',
                                borderRadius: 16,
                                padding: 24,
                                marginBottom: 24,
                            }}
                        >
                            <Text style={{ fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginBottom: 8 }}>
                                Receita Total
                            </Text>
                            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 }}>
                                R$ {revenue.total.toFixed(2)}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontSize: 12, color: '#FFFFFF', opacity: 0.8, marginBottom: 4 }}>
                                        Pedidos
                                    </Text>
                                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                                        {revenue.orderCount}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 12, color: '#FFFFFF', opacity: 0.8, marginBottom: 4 }}>
                                        Crescimento
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons
                                            name={parseFloat(revenue.growth) >= 0 ? 'trending-up' : 'trending-down'}
                                            size={18}
                                            color="#FFFFFF"
                                        />
                                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                                            {Math.abs(parseFloat(revenue.growth)).toFixed(1)}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Comparação com Período Anterior */}
                        <View
                            style={{
                                backgroundColor: cardBgColor,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 24,
                                borderWidth: 1,
                                borderColor,
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 12 }}>
                                Comparação de Período
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#8B92A9', marginBottom: 4 }}>
                                        Período Atual
                                    </Text>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981' }}>
                                        R$ {revenue.total.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 12, color: '#8B92A9', marginBottom: 4 }}>
                                        Período Anterior
                                    </Text>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#8B92A9' }}>
                                        R$ {revenue.previousTotal.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Métricas de Clientes (Advanced) */}
                        {customerMetrics && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                                    Métricas de Clientes (30 dias)
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1, backgroundColor: cardBgColor, padding: 16, borderRadius: 12, borderWidth: 1, borderColor }}>
                                        <UsersIcon size={20} color="#8B5CF6" />
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                                            {customerMetrics.totalCustomers || 0}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#8B92A9' }}>Total de Clientes</Text>
                                    </View>
                                    <View style={{ flex: 1, backgroundColor: cardBgColor, padding: 16, borderRadius: 12, borderWidth: 1, borderColor }}>
                                        <TrendingUp size={20} color="#10B981" />
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginTop: 8 }}>
                                            {(customerMetrics.retentionRate || 0).toFixed(1)}%
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#8B92A9' }}>Taxa de Retenção</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Top Produtos */}
                        {topProducts.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                                    Top Produtos
                                </Text>
                                {topProducts.map((product, index) => (
                                    <View
                                        key={product.productId}
                                        style={{
                                            backgroundColor: cardBgColor,
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 8,
                                            borderWidth: 1,
                                            borderColor,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 16,
                                                    backgroundColor: '#FF6B35',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                    {index + 1}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 4 }}>
                                                    {product.productName}
                                                </Text>
                                                <Text style={{ fontSize: 14, color: '#8B92A9' }}>
                                                    {product.totalSold} vendidos
                                                </Text>
                                            </View>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>
                                                R$ {product.revenue.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Top Serviços */}
                        {topServices.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                                    Top Serviços
                                </Text>
                                {topServices.map((service, index) => (
                                    <View
                                        key={service.serviceId}
                                        style={{
                                            backgroundColor: cardBgColor,
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 8,
                                            borderWidth: 1,
                                            borderColor,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 16,
                                                    backgroundColor: '#3B82F6',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                    {index + 1}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 4 }}>
                                                    {service.serviceName}
                                                </Text>
                                                <Text style={{ fontSize: 14, color: '#8B92A9' }}>
                                                    {service.totalAppointments} agendamentos
                                                </Text>
                                            </View>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>
                                                R$ {service.revenue.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Ações */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                                Relatórios Detalhados
                            </Text>
                            <Pressable
                                onPress={() => router.push('/manager/reports')}
                                style={{
                                    backgroundColor: cardBgColor,
                                    borderRadius: 12,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Ionicons name="document-text" size={24} color="#FF6B35" />
                                    <View>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                                            Ver Relatórios Completos
                                        </Text>
                                        <Text style={{ fontSize: 14, color: '#8B92A9' }}>
                                            Análises detalhadas e exportação
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#8B92A9" />
                            </Pressable>
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
}
