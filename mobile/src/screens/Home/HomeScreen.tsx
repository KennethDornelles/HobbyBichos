import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { HomeHeader } from '../../components/HomeHeader';
import { UserGreeting } from '../../components/UserGreeting';
import { QuickAction } from '../../components/QuickAction';
import { ActionCard } from '../../components/ActionCard';
import { SideMenu } from '../../components/SideMenu';
import { useUserStore } from '../../store/userStore';
import { useCartStore } from '../../store/cartStore';

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
    { id: '3', icon: CreditCard, label: 'Cartão Fidelidade' },
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
        route: '/servicos',
    },
    {
        id: '3',
        title: 'Meus Pedidos',
        subtitle: 'Acompanhar compras',
        icon: Package,
        route: '/pedidos',
    },
];

export default function HomeScreen() {
    const router = useRouter();
    const { name, points, loadUserProfile, loading } = useUserStore();
    const { totalItems } = useCartStore();
    const [menuVisible, setMenuVisible] = useState(false);

    // Carregar perfil do usuário autenticado ao montar
    useEffect(() => {
        void loadUserProfile();
    }, [loadUserProfile]);

    const handleQuickAction = (id: string) => {
        // Implementar navegação para cada ação
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
        <View className="flex-1 bg-primary-dark">
            {/* Header com busca integrado ao SafeAreaView */}
            <SafeAreaView edges={['top']} className="bg-primary-dark">
                <HomeHeader
                    onMenuPress={() => setMenuVisible(true)}
                    onCameraPress={() => console.log('Camera pressed')}
                    onCartPress={() => router.push('/carrinho')}
                    cartItemsCount={totalItems()}
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
            >
                {/* Saudação com Saldo Hobby Club */}
                <UserGreeting name={name} points={points} onPress={handleRewards} />

                {/* Ações Rápidas */}
                <View className="bg-card-bg py-6 mb-2">
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

                    {/* Card Premium */}
                    <ActionCard
                        title="Hobby Premium"
                        subtitle="Acesso a benefícios exclusivos"
                        icon={Heart}
                        onPress={() => router.push('/premium')}
                    />
                </View>

                {/* Seção Lojas */}
                <View className="px-4 py-4 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-white">Lojas</Text>
                        <TouchableOpacity onPress={() => router.push('/lojas')} activeOpacity={0.7}>
                            <Text className="text-sm text-primary-yellow font-semibold">Mais lojas</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Aqui você pode adicionar um FlatList horizontal com cards de lojas */}
                </View>
            </ScrollView>
        </View>
    );
}
