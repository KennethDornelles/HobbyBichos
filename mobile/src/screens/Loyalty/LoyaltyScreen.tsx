import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Gift, Sparkles, Heart } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../store/userStore';

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
        cost: 100,
        icon: 'bath',
        available: true,
    },
    {
        id: '2',
        title: '5% Desconto',
        description: 'Em produtos de higiene',
        cost: 50,
        icon: 'discount',
        available: true,
    },
    {
        id: '3',
        title: 'Tosa Grátis',
        description: 'Tosa higiênica completa',
        cost: 150,
        icon: 'grooming',
        available: false,
    },
    {
        id: '4',
        title: 'Consulta Veterinária',
        description: 'Consulta básica gratuita',
        cost: 200,
        icon: 'vet',
        available: false,
    },
];

export default function LoyaltyScreen() {
    const router = useRouter();
    const { points, name } = useUserStore();
    const userId = `USER${Date.now()}`; // Gerar ID único para QR Code

    return (
        <View className="flex-1 bg-primary-dark">
            {/* Header com botão voltar */}
            <SafeAreaView edges={['top']} className="bg-primary-dark">
                <View className="px-4 py-4 flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="mr-4 active:opacity-70"
                    >
                        <ArrowLeft size={24} color="#FFD600" />
                    </Pressable>
                    <Text className="text-white font-bold text-2xl">
                        Hobby Club
                    </Text>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                {/* Card de Pontos com Gradiente */}
                <View className="px-4 py-6">
                    <LinearGradient
                        colors={['#FFD600', '#FFAA00', '#FF8A65']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 30 }}
                        className="p-8 items-center"
                    >
                        <Text className="text-primary-dark text-lg mb-2">
                            Seus Pontos
                        </Text>
                        <Text className="text-primary-dark font-bold text-6xl">
                            {points}
                        </Text>
                        <View className="flex-row items-center mt-3">
                            <Sparkles size={20} color="#10142D" />
                            <Text className="text-primary-dark font-semibold text-base ml-2">
                                Continue acumulando!
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Seção de Recompensas */}
                <View className="px-4 pb-6">
                    <Text className="text-white font-bold text-xl mb-4">
                        Resgatar Recompensas
                    </Text>

                    {REWARDS.map((reward) => (
                        <RewardCard
                            key={reward.id}
                            reward={reward}
                            userPoints={points}
                        />
                    ))}
                </View>

                {/* QR Code dentro do ScrollView */}
                <View className="px-4 pb-6">
                    <LinearGradient
                        colors={['#FFD600', '#FFF176']}
                        style={{
                            borderRadius: 30,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                        className="p-6 items-center"
                    >
                        <Text className="text-primary-dark font-bold text-lg mb-3">
                            Apresente na Loja
                        </Text>
                        <View className="bg-white p-4 rounded-2xl">
                            <QRCode
                                value={userId}
                                size={120}
                                color="#10142D"
                                backgroundColor="white"
                            />
                        </View>
                        <Text className="text-primary-dark text-sm mt-3">
                            Válido em todas as 6 unidades
                        </Text>
                    </LinearGradient>
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
