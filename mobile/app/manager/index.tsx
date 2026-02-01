import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, Text, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HomeHeader } from '../../src/components/HomeHeader';
import { QuickAction } from '../../src/components/QuickAction';
import { ActionCard } from '../../src/components/ActionCard';
import { SideMenu } from '../../src/components/SideMenu';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useAuth } from '../../src/context/AuthContext';
import { managerService } from '../../src/services/managerService';
import { Calendar, BarChart4, Wrench, Wallet, Users, Package, AlertTriangle, UserCog, ArrowLeftRight } from 'lucide-react-native';

interface QuickActionItem {
    id: string;
    icon: any;
    label: string;
    route?: string;
}

interface ActionCardItem {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    route?: string;
}

const managerQuickActions: QuickActionItem[] = [
    { id: '1', icon: BarChart4, label: 'Dashboard', route: '/manager/dashboard' },
    { id: '2', icon: Wrench, label: 'Serviços', route: '/manager/services' },
    { id: '3', icon: Wallet, label: 'Financeiro', route: '/manager/financial' },
    { id: '4', icon: Users, label: 'Equipe', route: '/manager/team' },
    { id: '5', icon: UserCog, label: 'Clientes', route: '/manager/clients' },
    { id: '6', icon: ArrowLeftRight, label: 'Estoques', route: '/manager/stock-transfer' },
];

const managerMainActions: ActionCardItem[] = [
    {
        id: '1',
        title: 'Visão Geral',
        subtitle: 'Métricas e próximos agendamentos',
        icon: BarChart4,
        route: '/manager/dashboard',
    },
    {
        id: '2',
        title: 'Gestão de Serviços',
        subtitle: 'Criar, editar e desativar',
        icon: Wrench,
        route: '/manager/services',
    },
    {
        id: '3',
        title: 'Financeiro',
        subtitle: 'Receitas e rankings',
        icon: Wallet,
        route: '/manager/financial',
    },
    {
        id: '4',
        title: 'Relatórios',
        subtitle: 'Performance da equipe',
        icon: Users,
        route: '/manager/reports',
    },
    {
        id: '5',
        title: 'Gestão da Equipe',
        subtitle: 'Funcionários e gerentes',
        icon: Users,
        route: '/manager/team',
    },
    {
        id: '6',
        title: 'Gestão de Clientes',
        subtitle: 'Cadastro e edição',
        icon: UserCog,
        route: '/manager/clients',
    },
    {
        id: '7',
        title: 'Transferência de Estoque',
        subtitle: 'Mover produtos entre lojas',
        icon: ArrowLeftRight,
        route: '/manager/stock-transfer',
    },
];

export default function ManagerHomeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<{
        todayAppointments: number;
        completedToday?: number;
        monthOrders?: number;
        monthRevenue: number;
        activeServices: number;
        employees: number;
        openOrders?: number;
        outOfStockProducts?: number;
        lowStockProducts?: number;
    } | null>(null);

    useEffect(() => {
        if (user && user.role && !['MANAGER', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
            Alert.alert('Acesso Negado', 'Apenas gerentes, proprietários e administradores podem acessar esta área.', [
                { text: 'OK', onPress: () => router.replace('/home') },
            ]);
            return;
        }
        void loadSummary();
    }, [user]);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const data = await managerService.getDashboard();
            setSummary(data.summary);
        } catch (error: any) {
            console.error('Erro ao carregar resumo:', error);
            Alert.alert('Erro', 'Não foi possível carregar o resumo gerencial. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (route?: string) => {
        if (route) router.push(route as any);
    };

    const handleCardAction = (route?: string) => {
        if (route) router.push(route as any);
    };

    const handleMenuSelect = (label: string) => {
        setMenuVisible(false);
    };

    const handleCameraPress = () => {
        router.push('/scanner');
    };

    const firstName = user?.name?.split(' ')[0] ?? 'Gestor';
    // DEBUG: Exibir role atual
    const debugRole = user?.role || 'N/A';

    return (
        <View className="flex-1" style={{ backgroundColor: colors.bgMain }}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bgMain }}>
                <HomeHeader onMenuPress={() => setMenuVisible(true)} onCameraPress={handleCameraPress} hideCart />
            </SafeAreaView>

            {/* Side Menu */}
            <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} onSelect={handleMenuSelect} />

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
                        Olá, {firstName}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-2">
                        Atalhos gerenciais e visão geral
                    </Text>
                </View>

                {/* Ações Rápidas */}
                <View style={{ backgroundColor: colors.bgCard }} className="py-6 mb-2">
                    <FlatList
                        horizontal
                        data={managerQuickActions}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        scrollEnabled={true}
                        renderItem={({ item }) => (
                            <QuickAction icon={item.icon} label={item.label} onPress={() => handleQuickAction(item.route)} />
                        )}
                    />
                </View>

                {/* Cards Principais */}
                <View className="px-4 py-2">
                    {managerMainActions.map((action) => (
                        <ActionCard
                            key={action.id}
                            title={action.title}
                            subtitle={action.subtitle}
                            icon={action.icon}
                            onPress={() => handleCardAction(action.route)}
                        />
                    ))}
                </View>

                {/* Estatísticas resumidas */}
                <View className="px-4 py-4 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text style={{ color: colors.textMain }} className="text-xl font-bold">📊 Visão Resumida</Text>
                    </View>

                    {!loading && summary && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
                            {[
                                { id: '1', icon: Calendar, label: 'Agendamentos Hoje', value: summary.todayAppointments, color: '#3B82F6' },
                                { id: '2', icon: Calendar, label: 'Concluídos Hoje', value: summary.completedToday ?? 0, color: '#2563EB' },
                                { id: '3', icon: Wallet, label: 'Receita do Mês', value: `R$ ${Number(summary.monthRevenue).toFixed(2)}`, color: '#10B981' },
                                { id: '4', icon: BarChart4, label: 'Pedidos do Mês', value: summary.monthOrders ?? 0, color: '#22C55E' },
                                { id: '5', icon: Wrench, label: 'Serviços Ativos', value: summary.activeServices, color: '#8B5CF6' },
                                { id: '6', icon: Users, label: 'Funcionários', value: summary.employees, color: '#F59E0B' },
                                { id: '7', icon: BarChart4, label: 'Pedidos Abertos', value: summary.openOrders ?? 0, color: '#F97316' },
                                { id: '8', icon: Package, label: 'Sem Estoque', value: summary.outOfStockProducts ?? 0, color: '#EF4444' },
                                { id: '9', icon: AlertTriangle, label: 'Estoque Baixo', value: summary.lowStockProducts ?? 0, color: '#EAB308' },
                            ].map((item) => (
                                <View
                                    key={item.id}
                                    style={{
                                        width: '50%',
                                        padding: 6,
                                    }}
                                >
                                    <View
                                        className="p-4 rounded-lg"
                                        style={{
                                            backgroundColor: colors.bgCard,
                                            borderLeftWidth: 4,
                                            borderLeftColor: item.color,
                                            minHeight: 80,
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1">
                                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-medium uppercase">
                                                    {item.label}
                                                </Text>
                                                <Text
                                                    style={{ color: item.color }}
                                                    className="text-xl font-bold mt-1"
                                                    numberOfLines={1}
                                                    adjustsFontSizeToFit
                                                >
                                                    {item.value}
                                                </Text>
                                            </View>
                                            <View style={{ marginLeft: 4 }}>
                                                <item.icon size={20} color={item.color} opacity={0.3} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
