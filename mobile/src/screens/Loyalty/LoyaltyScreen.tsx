import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Gift, Sparkles, Heart } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../store/userStore';
import { api } from '../../../api'; // Importar API helper
import { StampCard } from '../../components/StampCard';

interface Reward {
    id: string;
    title: string;
    description: string;
    cost: number;
    icon: 'bath' | 'discount' | 'grooming' | 'vet';
    available: boolean;
}

const REWARDS: Reward[] = [
    {
        id: '1',
        title: 'Banho Grátis',
        description: 'Banho completo para pets até 15kg',
        cost: 500,
        icon: 'bath',
        available: true,
    },
    {
        id: '2',
        title: '5% Desconto',
        description: 'Em produtos de higiene',
        cost: 250,
        icon: 'discount',
        available: true,
    },
    {
        id: '3',
        title: 'Tosa Grátis',
        description: 'Tosa higiênica completa',
        cost: 1000,
        icon: 'grooming',
        available: false,
    },
    {
        id: '4',
        title: 'Consulta Veterinária',
        description: 'Consulta básica gratuita',
        cost: 1500,
        icon: 'vet',
        available: false,
    },
];

export default function LoyaltyScreen() {
    const router = useRouter();
    const { points, name, setPoints } = useUserStore(); // Assumindo que setPoints existe
    const userId = `USER${Date.now()}`;
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Calcular selos (Ex: 1 selo a cada 50 pontos)
    // Se o backend enviar essa lógica, melhor. Por enquanto, hardcoded.
    const POINTS_PER_STAMP = 50;
    const filledSlots = Math.floor(points / POINTS_PER_STAMP);
    const totalSlots = 10;
    const pointsToNext = POINTS_PER_STAMP - (points % POINTS_PER_STAMP);

    const fetchLoyaltyData = async () => {
        try {
            // Se já tivermos dados, não bloqueia a tela com loading, só refresh
            if (!points && !refreshing) setLoading(true);

            // TODO: Ajustar endpoint conforme implementado na API
            const response = await api.get('/loyalty/account');
            if (response.data && response.data.currentPoints !== undefined) {
                setPoints(response.data.currentPoints);
            }
        } catch (error) {
            console.error('Erro ao buscar dados de fidelidade:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Busca inicial
        fetchLoyaltyData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLoyaltyData();
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header com botão voltar */}
            <SafeAreaView edges={['top']} className="bg-primary-dark z-10">
                <View className="px-4 py-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.back()}
                            className="mr-4 active:opacity-70"
                        >
                            <ArrowLeft size={24} color="#FFD600" />
                        </Pressable>
                        <View>
                            <Text className="text-white font-bold text-xl">Hobby Club</Text>
                            <Text className="text-gray-400 text-xs">Seu clube de vantagens</Text>
                        </View>
                    </View>

                    <View className="bg-white/10 px-3 py-1 rounded-full">
                        <Text className="text-primary-yellow font-bold text-sm">
                            {points} pts
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C4DFF" />
                }
            >
                {/* Background Decorativo Superior */}
                <View className="bg-primary-dark h-24 w-full absolute top-0" />

                {/* Área do Cartão (Sobreposta) */}
                <View className="px-4 pt-2 mb-6">
                    <StampCard
                        totalSlots={totalSlots}
                        filledSlots={filledSlots}
                        rewardName="Banho Grátis (500 pts)"
                    />

                    <View className="mt-2 items-center">
                        <Text className="text-gray-500 text-xs">
                            Faltam {pointsToNext} pontos para o próximo selo!
                        </Text>
                    </View>
                </View>

                {/* Seção de Recompensas */}
                <View className="px-4 pb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-primary-dark font-bold text-lg">
                            Recompensas
                        </Text>
                        <Text className="text-primary-purple text-sm font-semibold">
                            Ver todas
                        </Text>
                    </View>

                    {REWARDS.map((reward) => (
                        <RewardCard
                            key={reward.id}
                            reward={reward}
                            userPoints={points}
                        />
                    ))}
                </View>

                {/* QR Code */}
                <View className="mx-4 mb-6 bg-white p-6 rounded-3xl shadow-sm items-center border border-gray-100">
                    <Text className="text-primary-dark font-bold text-lg mb-2">
                        Seu Cartão Digital
                    </Text>
                    <Text className="text-gray-500 text-sm mb-4 text-center">
                        Apresente este QR Code no caixa para pontuar
                    </Text>
                    <QRCode
                        value={userId}
                        size={150}
                        color="#10142D"
                        backgroundColor="white"
                    />
                    <Text className="text-gray-400 text-xs mt-4">
                        ID: {userId}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

// ========================================
// Componente de Card de Recompensa
// ========================================
interface RewardCardProps {
    reward: Reward;
    userPoints: number;
}

function RewardCard({ reward, userPoints }: RewardCardProps) {
    const canRedeem = userPoints >= reward.cost && reward.available;

    const getIcon = () => {
        switch (reward.icon) {
            case 'bath':
                return <Sparkles size={32} color="#FFD600" />;
            case 'discount':
                return <Gift size={32} color="#FFD600" />;
            case 'grooming':
                return <Award size={32} color="#FFD600" />;
            case 'vet':
                return <Heart size={32} color="#FFD600" />;
            default:
                return <Gift size={32} color="#FFD600" />;
        }
    };

    return (
        <Pressable
            className={`bg-card-bg rounded-3xl p-4 mb-4 flex-row items-center ${canRedeem ? 'active:opacity-80' : 'opacity-50'
                }`}
            disabled={!canRedeem}
            onPress={() => {
                if (canRedeem) {
                    console.log(`Resgatar recompensa: ${reward.title}`);
                    // TODO: Implementar lógica de resgate
                }
            }}
        >
            {/* Ícone da Recompensa */}
            <View className="w-16 h-16 bg-primary-dark rounded-2xl items-center justify-center mr-4">
                {getIcon()}
            </View>

            {/* Conteúdo Central */}
            <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                    {reward.title}
                </Text>
                <Text className="text-gray-400 text-sm">
                    {reward.description}
                </Text>
                <View className="flex-row items-center mt-2">
                    <Award size={16} color="#FFD600" />
                    <Text className="text-primary-yellow font-semibold text-sm ml-1">
                        {reward.cost} pontos
                    </Text>
                </View>
            </View>

            {/* Botão ou Status de Resgate */}
            <View className="items-center justify-center">
                {canRedeem ? (
                    <View className="bg-primary-yellow rounded-full px-4 py-2">
                        <Text className="text-primary-dark font-bold text-sm">
                            Resgatar
                        </Text>
                    </View>
                ) : (
                    <View className="opacity-50">
                        <Text className="text-gray-500 text-xs text-center">
                            Bloqueado
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}
