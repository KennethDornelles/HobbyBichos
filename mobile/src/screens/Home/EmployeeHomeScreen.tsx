import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    LucideIcon,
    Package,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { HomeHeader } from '../../components/HomeHeader';
import { Ionicons } from '@expo/vector-icons';
import { QuickAction } from '../../components/QuickAction';
import { ActionCard } from '../../components/ActionCard';
import { SideMenu } from '../../components/SideMenu';
import { useUserStore } from '../../store/userStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';

interface QuickActionItem {
    id: string;
    icon: LucideIcon;
    label: string;
}

interface ActionCardItem {
    id: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    route?: string;
}

const employeeQuickActions: QuickActionItem[] = [
    { id: '1', icon: Calendar, label: 'Agendamentos' },
    { id: '2', icon: CheckCircle, label: 'Concluir Serviço' },
    { id: '3', icon: Clock, label: 'Em Progresso' },
];

const employeeMainActions: ActionCardItem[] = [
    {
        id: '1',
        title: 'Meus Agendamentos',
        subtitle: 'Ver todos os agendamentos',
        icon: Calendar,
        route: '/employee/dashboard',
    },
    {
        id: '2',
        title: 'Atualizar Status',
        subtitle: 'Marcar serviço como concluído',
        icon: CheckCircle,
        route: '/employee/update-status',
    },
    {
        id: '3',
        title: 'Pedidos da Loja',
        subtitle: 'Ver pedidos para processar',
        icon: Package,
        route: '/employee/store-orders',
    },
];

export default function EmployeeHomeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { name, role, loadUserProfile } = useUserStore();
    const { setUser } = useAuth();
    // ✅ Só chamar dashboard se for EMPLOYEE
    const { dashboard, loading, error, refetch } = useDashboard();
    const [menuVisible, setMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();

    // Verificar se o usuário tem permissão para acessar esta tela (compartilhada entre funcionários e gestores)
    useEffect(() => {
        const allowedRoles = ['EMPLOYEE', 'MANAGER', 'OWNER', 'SUPER_ADMIN'];
        // Se o perfil já carregou e o role não é permitido, redireciona
        if (role && !allowedRoles.includes(role)) {
            Alert.alert(
                'Acesso Restrito',
                'Esta área é destinada apenas para funcionários e gestores.',
                [{ text: 'OK', onPress: () => router.replace('/home') }]
            );
        }
    }, [role]);

    // Carregar perfil do usuário autenticado ao montar
    useEffect(() => {
        void loadUserProfile();
    }, [loadUserProfile]);

    // Sincronizar usuário para o contexto de autenticação (para SideMenu e outras telas)
    useEffect(() => {
        if (name && name !== 'Visitante') {
            setUser({
                id: '',
                name,
                email: '',
                role: role || 'EMPLOYEE',
            });
        }
    }, [name, role, setUser]);

    const handleQuickAction = (id: string) => {
        if (id === '1') {
            router.push('/employee/dashboard');
        } else if (id === '2') {
            router.push('/employee/update-status');
        }
    };

    const handleCardAction = (route?: string) => {
        if (route) {
            router.push(route as any);
        }
    };

    const handleMenuSelect = (label: string) => {
        setMenuVisible(false);
        console.log('Menu item selected:', label);
    };

    const handleCameraPress = () => {
        router.push('/scanner');
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.bgMain }}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bgMain }}>
                <HomeHeader
                    onMenuPress={() => setMenuVisible(true)}
                    onCameraPress={handleCameraPress}
                    hideCart
                />
            </SafeAreaView>

            {/* Side Menu */}
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={handleMenuSelect}
            />

            {/* Conteúdo rolável */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                style={{ backgroundColor: colors.bgMain }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            >
                {/* Saudação */}
                <View className="px-4 py-6">
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
                        Bem-vindo!
                    </Text>
                    <Text style={{ color: colors.textMain }} className="text-3xl font-bold mt-2">
                        Olá, {name?.split(' ')[0]}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-2">
                        Painel de atendimentos e serviços
                    </Text>
                </View>

                {/* Ações Rápidas */}
                <View style={{ backgroundColor: colors.bgCard }} className="py-6 mb-2">
                    <FlatList
                        horizontal
                        data={employeeQuickActions}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        scrollEnabled={true}
                        renderItem={({ item }) => (
                            <QuickAction
                                icon={item.icon}
                                label={item.label}
                                onPress={() => handleQuickAction(item.id)}
                            />
                        )}
                    />
                </View>

                {/* Cards Principais */}
                <View className="px-4 py-2">
                    {employeeMainActions.map((action) => (
                        <ActionCard
                            key={action.id}
                            title={action.title}
                            subtitle={action.subtitle}
                            icon={action.icon}
                            onPress={() => handleCardAction(action.route)}
                        />
                    ))}
                </View>

                {/* Estatísticas do Dia */}
                <View className="px-4 py-4 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text style={{ color: colors.textMain }} className="text-xl font-bold">📊 Estatísticas do Dia</Text>
                    </View>

                    {/* Loading state */}
                    {loading && (
                        <View className="items-center py-8">
                            <ActivityIndicator size="large" color={colors.accentYellow} />
                            <Text style={{ color: colors.textSecondary }} className="text-sm mt-2">
                                Carregando dados...
                            </Text>
                        </View>
                    )}

                    {/* Error state */}
                    {error && !loading && (
                        <EmptyState
                            title="Erro ao carregar dados"
                            description={error}
                            icon={AlertCircle}
                            actionLabel="Tentar Novamente"
                            onAction={refetch}
                        />
                    )}

                    {/* Empty state (no dashboard data) */}
                    {!loading && !error && !dashboard && (
                        <EmptyState
                            title="Nenhum dado disponível"
                            description="Não há estatísticas disponíveis para visualização no momento."
                            icon={Package}
                        />
                    )}

                    {/* Stats Cards */}
                    {!loading && dashboard && (
                        <FlatList
                            scrollEnabled={false}
                            data={[
                                {
                                    id: '1',
                                    icon: Calendar,
                                    label: 'Agendamentos Hoje',
                                    value: dashboard.totalAppointmentsToday || 0,
                                    color: '#3B82F6',
                                },
                                {
                                    id: '2',
                                    icon: CheckCircle,
                                    label: 'Concluídos',
                                    value: dashboard.completedAppointmentsToday || 0,
                                    color: '#10B981',
                                },
                                {
                                    id: '3',
                                    icon: Clock,
                                    label: 'Em Progresso',
                                    value: dashboard.todayAppointments?.filter(apt => apt.status === 'IN_PROGRESS').length || 0,
                                    color: '#F59E0B',
                                },
                                {
                                    id: '4',
                                    icon: AlertCircle,
                                    label: 'Pendentes',
                                    value: dashboard.todayAppointments?.filter(apt => apt.status === 'SCHEDULED').length || 0,
                                    color: '#EF4444',
                                },
                            ]}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 12 }}
                            contentContainerStyle={{ gap: 12 }}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View
                                    className="flex-1 p-4 rounded-lg"
                                    style={{
                                        backgroundColor: colors.bgCard,
                                        borderLeftWidth: 4,
                                        borderLeftColor: item.color,
                                    }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
                                                {item.label}
                                            </Text>
                                            <Text style={{ color: item.color }} className="text-2xl font-bold mt-2">
                                                {item.value}
                                            </Text>
                                        </View>
                                        <item.icon size={24} color={item.color} opacity={0.3} />
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
