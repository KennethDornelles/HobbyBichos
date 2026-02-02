import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { managerService, ManagerDashboard, LowStockItem, BenchmarkingData } from '../../services/managerService';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';

export default function ManagerDashboardScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [dashboard, setDashboard] = useState<ManagerDashboard | null>(null);
    const [benchmarking, setBenchmarking] = useState<BenchmarkingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({ city: '', state: '' });

    useEffect(() => {
        // Verificar se o usuário é MANAGER, OWNER ou SUPER_ADMIN
        if (user && user.role && !['MANAGER', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
            Alert.alert(
                'Acesso Negado',
                'Apenas gerentes, proprietários e administradores podem acessar esta área.',
                [{ text: 'OK', onPress: () => router.replace('/home') }]
            );
            return;
        }
        loadDashboard();
    }, [user]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [dashboardData, benchmarkingData] = await Promise.all([
                managerService.getDashboard(), // Dashboard backend doesn't support filters yet on main route, only financial/benchmarking
                managerService.getBenchmarking(undefined, undefined, appliedFilters.city, appliedFilters.state)
            ]);
            setDashboard(dashboardData);
            setBenchmarking(benchmarkingData);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar dashboard');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        setAppliedFilters({ city, state });
    };

    useEffect(() => {
        loadDashboard();
    }, [appliedFilters]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    }, []);

    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';

    if (loading && !dashboard) {
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
                        Dashboard Gerencial
                    </Text>
                    <Text style={{ fontSize: 16, color: '#8B92A9' }}>
                        Visão geral do negócio
                    </Text>
                </View>

                {/* Filtros */}
                <View style={{ marginBottom: 24, padding: 16, backgroundColor: cardBgColor, borderRadius: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>Filtrar por Região</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TextInput
                            placeholder="Cidade"
                            value={city}
                            onChangeText={setCity}
                            placeholderTextColor="#8B92A9"
                            style={{ flex: 1, backgroundColor: bgColor, borderRadius: 8, padding: 10, color: textColor, borderWidth: 1, borderColor }}
                        />
                        <TextInput
                            placeholder="UF"
                            value={state}
                            onChangeText={setState}
                            placeholderTextColor="#8B92A9"
                            style={{ width: 60, backgroundColor: bgColor, borderRadius: 8, padding: 10, color: textColor, borderWidth: 1, borderColor }}
                        />
                        <Pressable
                            onPress={applyFilters}
                            style={{ backgroundColor: '#FF6B35', borderRadius: 8, padding: 10, justifyContent: 'center' }}
                        >
                            <Ionicons name="search" size={20} color="#FFF" />
                        </Pressable>
                    </View>
                </View>

                {/* Cards de Resumo */}
                {dashboard && (
                    <>
                        <View style={{ marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                <StatCard
                                    label="Agendamentos Hoje"
                                    value={dashboard.summary.todayAppointments}
                                    icon="calendar"
                                    color="#3B82F6"
                                    bgColor={isDark ? '#1E3A8A' : '#EFF6FF'}
                                    textColor={textColor}
                                />
                                <StatCard
                                    label="Concluídos Hoje"
                                    value={dashboard.summary.completedToday}
                                    icon="checkmark-circle"
                                    color="#10B981"
                                    bgColor={isDark ? '#064E3B' : '#ECFDF5'}
                                    textColor={textColor}
                                />
                                <StatCard
                                    label="Pedidos do Mês"
                                    value={dashboard.summary.monthOrders}
                                    icon="cart"
                                    color="#8B5CF6"
                                    bgColor={isDark ? '#4C1D95' : '#F5F3FF'}
                                    textColor={textColor}
                                />
                                <StatCard
                                    label="Receita do Mês"
                                    value={`R$ ${dashboard.summary.monthRevenue.toFixed(2)}`}
                                    icon="cash"
                                    color="#F59E0B"
                                    bgColor={isDark ? '#78350F' : '#FFFBEB'}
                                    textColor={textColor}
                                />
                                <StatCard
                                    label="Serviços Ativos"
                                    value={dashboard.summary.activeServices}
                                    icon="construct"
                                    color="#EC4899"
                                    bgColor={isDark ? '#831843' : '#FDF2F8'}
                                    textColor={textColor}
                                />
                                <StatCard
                                    label="Funcionários"
                                    value={dashboard.summary.employees}
                                    icon="people"
                                    color="#06B6D4"
                                    bgColor={isDark ? '#164E63' : '#ECFEFF'}
                                    textColor={textColor}
                                />
                            </View>
                        </View>


                        {/* Benchmarking */}
                        {benchmarking.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                                    Ranking de Lojas
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {benchmarking.map((item, index) => (
                                        <View
                                            key={item.storeId}
                                            style={{
                                                width: 200,
                                                backgroundColor: cardBgColor,
                                                borderRadius: 12,
                                                padding: 16,
                                                marginRight: 12,
                                                borderWidth: 1,
                                                borderColor: index === 0 ? '#F59E0B' : borderColor
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 40, color: index === 0 ? '#F59E0B' : '#8B92A9', opacity: 0.3, position: 'absolute', right: 0, top: -10 }}>
                                                    #{index + 1}
                                                </Text>
                                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, maxWidth: '80%' }} numberOfLines={1}>
                                                    {item.storeName}
                                                </Text>
                                            </View>
                                            <Text style={{ fontSize: 12, color: '#8B92A9', marginBottom: 8 }}>
                                                {item.city}/{item.state}
                                            </Text>
                                            <View style={{ gap: 4 }}>
                                                <Text style={{ fontSize: 14, color: textColor }}>
                                                    <Text style={{ fontWeight: 'bold' }}>R$ {item.totalRevenue.toFixed(2)}</Text>
                                                </Text>
                                                <Text style={{ fontSize: 12, color: '#8B92A9' }}>
                                                    {item.orderCount} pedidos
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Alertas de Estoque Baixo */}
                        {dashboard.lowStockItems.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>
                                        Alertas de Estoque
                                    </Text>
                                    <Pressable
                                        style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                                        onPress={() => Alert.alert('Estoque Crítico', 'Estes produtos estão abaixo do limite mínimo definido.')}
                                    >
                                        <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: 'bold' }}>CRÍTICO</Text>
                                    </Pressable>
                                </View>
                                {dashboard.lowStockItems.map((item: LowStockItem) => (
                                    <View
                                        key={item.id}
                                        style={{
                                            backgroundColor: isDark ? '#3D1C1C' : '#FFF5F5',
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: isDark ? '#7F1D1D' : '#FEE2E2',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                                                {item.name}
                                            </Text>
                                            <Text style={{ fontSize: 13, color: '#8B92A9', marginTop: 2 }}>
                                                {item.sku ? `SKU: ${item.sku}` : 'Sem SKU'}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626' }}>
                                                {item.quantity} un
                                            </Text>
                                            <Text style={{ fontSize: 11, color: '#991B1B' }}>
                                                Mín: {item.minStock}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Ações Rápidas */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                                Ações Rápidas
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                <QuickActionButton
                                    label="Gestão de Serviços"
                                    icon="construct"
                                    onPress={() => router.push('/manager/services')}
                                    bgColor={cardBgColor}
                                    textColor={textColor}
                                    borderColor={borderColor}
                                />
                                <QuickActionButton
                                    label="Produtos / Estoque"
                                    icon="cube"
                                    onPress={() => router.push('/manager/products')}
                                    bgColor={cardBgColor}
                                    textColor={textColor}
                                    borderColor={borderColor}
                                />
                                <QuickActionButton
                                    label="Financeiro"
                                    icon="analytics"
                                    onPress={() => router.push('/manager/financial')}
                                    bgColor={cardBgColor}
                                    textColor={textColor}
                                    borderColor={borderColor}
                                />
                                <QuickActionButton
                                    label="Relatórios"
                                    icon="document-text"
                                    onPress={() => router.push('/manager/reports')}
                                    bgColor={cardBgColor}
                                    textColor={textColor}
                                    borderColor={borderColor}
                                />
                                <QuickActionButton
                                    label="Equipe"
                                    icon="people"
                                    onPress={() => router.push('/manager/team')}
                                    bgColor={cardBgColor}
                                    textColor={textColor}
                                    borderColor={borderColor}
                                />
                            </View>
                        </View>

                        {/* Próximos Agendamentos */}
                        {dashboard.upcomingAppointments.length > 0 && (
                            <View>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                                    Próximos Agendamentos
                                </Text>
                                {dashboard.upcomingAppointments.map((apt) => (
                                    <View
                                        key={apt.id}
                                        style={{
                                            backgroundColor: cardBgColor,
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                                                {apt.service.name}
                                            </Text>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FF6B35' }}>
                                                R$ {apt.service.price.toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={{ gap: 4 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Ionicons name="person" size={16} color="#8B92A9" />
                                                <Text style={{ color: '#8B92A9' }}>{apt.user.name}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Ionicons name="paw" size={16} color="#8B92A9" />
                                                <Text style={{ color: '#8B92A9' }}>
                                                    {apt.pet.name} ({apt.pet.species})
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Ionicons name="time" size={16} color="#8B92A9" />
                                                <Text style={{ color: '#8B92A9' }}>
                                                    {new Date(apt.startsAt).toLocaleString('pt-BR')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </View>
        </ScrollView >
    );
}

// Componente StatCard
function StatCard({
    label,
    value,
    icon,
    color,
    bgColor,
    textColor,
}: {
    label: string;
    value: number | string;
    icon: any;
    color: string;
    bgColor: string;
    textColor: string;
}) {
    return (
        <View
            style={{
                backgroundColor: bgColor,
                borderRadius: 12,
                padding: 16,
                flex: 1,
                minWidth: '45%',
                gap: 8,
            }}
        >
            <Ionicons name={icon} size={24} color={color} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>
                {value}
            </Text>
            <Text style={{ fontSize: 12, color: '#8B92A9' }}>{label}</Text>
        </View>
    );
}

// Componente QuickActionButton
function QuickActionButton({
    label,
    icon,
    onPress,
    bgColor,
    textColor,
    borderColor,
}: {
    label: string;
    icon: any;
    onPress: () => void;
    bgColor: string;
    textColor: string;
    borderColor: string;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                backgroundColor: bgColor,
                borderRadius: 12,
                padding: 16,
                flex: 1,
                minWidth: '45%',
                borderWidth: 1,
                borderColor,
                opacity: pressed ? 0.7 : 1,
                alignItems: 'center',
                gap: 8,
            })}
        >
            <Ionicons name={icon} size={32} color="#FF6B35" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: textColor, textAlign: 'center' }}>
                {label}
            </Text>
        </Pressable>
    );
}
