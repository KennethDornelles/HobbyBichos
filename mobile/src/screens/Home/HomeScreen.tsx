import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Clock,
    Tag,
    CreditCard,
    Star,
    Scissors,
    ShoppingCart,
    Package,
    Heart,
    LucideIcon,
    MapPin,
    Clock3,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { HomeHeader } from '../../components/HomeHeader';
import { UserGreeting } from '../../components/UserGreeting';
import { QuickAction } from '../../components/QuickAction';
import { ActionCard } from '../../components/ActionCard';
import { SideMenu } from '../../components/SideMenu';
import { useUserStore } from '../../store/userStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useNearbyPetShops } from '../../hooks/useNearbyPetShops';
import { useAuth } from '../../context/AuthContext';

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

const quickActions: QuickActionItem[] = [
    { id: '1', icon: Clock, label: 'Delivery Rápido' },
    { id: '2', icon: Tag, label: 'Promoções' },
    { id: '4', icon: Star, label: 'Clube Hobby' },
    { id: '5', icon: Scissors, label: 'Serviços Pet' },
];

const mainActions: ActionCardItem[] = [
    {
        id: '1',
        title: 'Comprar',
        subtitle: 'Produtos para seu pet',
        icon: ShoppingCart,
        route: '/loja',
    },
    {
        id: '2',
        title: 'Agendar Serviço',
        subtitle: 'Banho, tosa e mais',
        icon: Scissors,
        route: '/appointments/create',
    },
    {
        id: '3',
        title: 'Meus Pedidos',
        subtitle: 'Acompanhar compras',
        icon: Package,
        route: '/pedidos',
    },
];

export default function ClientHomeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { name, role, points, loadUserProfile, loading } = useUserStore();
    const { setUser } = useAuth();
    const { totalItems } = useCartStore();
    const [menuVisible, setMenuVisible] = useState(false);
    const { shops, loading: shopsLoading, error: shopsError } = useNearbyPetShops(5, true);
    const insets = useSafeAreaInsets();

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
                role,
            });
        }
    }, [name, role, setUser]);

    const handleQuickAction = (id: string) => {
        // Implementar navegação para cada ação
        if (id === '5') {
            // Serviços Pet - navegar para listagem de agendamentos
            router.push('/appointments');
            return;
        }
        console.log('Quick action pressed:', id);
    };

    const handleCardAction = (route?: string) => {
        if (route) {
            router.push(route as any);
        }
    };

    const handleRewards = () => {
        router.push('/loyalty'); // Navegar para tela de detalhamento de pontos
    };

    const handleMenuSelect = (label: string) => {
        setMenuVisible(false);
        console.log('Menu item selected:', label);
        // Implementar navegação baseada no label
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.bgMain }}>
            {/* Header com busca integrado ao SafeAreaView */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bgMain }}>
                <HomeHeader
                    onMenuPress={() => setMenuVisible(true)}
                    onCartPress={() => router.push('/carrinho')}
                    cartItemsCount={totalItems()}
                    hideCamera={true}
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
                {/* Saudação com Saldo Hobby Club */}
                <UserGreeting name={name} points={points} onPress={handleRewards} />

                {/* Ações Rápidas */}
                <View style={{ backgroundColor: colors.bgCard }} className="py-6 mb-2">
                    <FlatList
                        horizontal
                        data={quickActions}
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
                    {mainActions.map((action) => (
                        <ActionCard
                            key={action.id}
                            title={action.title}
                            subtitle={action.subtitle}
                            icon={action.icon}
                            onPress={() => handleCardAction(action.route)}
                        />
                    ))}
                </View>

                {/* Seção Lojas */}
                <View className="px-4 py-4 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text style={{ color: colors.textMain }} className="text-xl font-bold">🏪 Lojas Próximas</Text>
                        <TouchableOpacity onPress={() => router.push('/googlemaps-test')} activeOpacity={0.7}>
                            <Text style={{ color: colors.accentYellow }} className="text-sm font-semibold">Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Loading state */}
                    {shopsLoading && (
                        <View className="items-center py-8">
                            <ActivityIndicator size="large" color={colors.accentYellow} />
                            <Text style={{ color: colors.textSecondary }} className="text-sm mt-2">
                                Buscando lojas próximas...
                            </Text>
                        </View>
                    )}

                    {/* Error state */}
                    {shopsError && !shopsLoading && (
                        <View style={{ backgroundColor: colors.bgCard }} className="p-3 rounded-lg mb-3">
                            <Text style={{ color: colors.accentYellow }} className="text-sm">
                                ⚠️ Habilite a localização para ver lojas próximas
                            </Text>
                        </View>
                    )}

                    {/* Lojas list */}
                    {!shopsLoading && shops.length > 0 && (
                        <FlatList
                            horizontal
                            data={shops}
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                            scrollEnabled={true}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => router.push('/googlemaps-test')}
                                    activeOpacity={0.7}
                                    style={{
                                        backgroundColor: colors.bgCard,
                                        borderRadius: 12,
                                        padding: 12,
                                        width: 160,
                                        borderLeftWidth: 3,
                                        borderLeftColor: colors.accentYellow,
                                    }}
                                >
                                    <Text style={{ color: colors.textMain }} className="font-bold text-sm mb-2">
                                        {item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name}
                                    </Text>
                                    <View className="flex-row items-center mb-1">
                                        <MapPin size={14} color={colors.accentYellow} />
                                        <Text style={{ color: colors.textSecondary }} className="text-xs ml-1">
                                            {item.distance}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Clock3 size={14} color={colors.accentYellow} />
                                        <Text style={{ color: colors.textSecondary }} className="text-xs ml-1">
                                            {item.duration}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    {/* Empty state */}
                    {!shopsLoading && shops.length === 0 && !shopsError && (
                        <View style={{ backgroundColor: colors.bgCard }} className="p-4 rounded-lg items-center">
                            <Text style={{ color: colors.textSecondary }} className="text-sm">
                                Nenhuma loja encontrada
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
