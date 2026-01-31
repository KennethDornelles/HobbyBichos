import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { PawPrint, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StampCardProps {
    totalSlots?: number;
    filledSlots: number;
    rewardName?: string;
}

export function StampCard({ totalSlots = 10, filledSlots = 0, rewardName }: StampCardProps) {
    // Garantir que filledSlots não exceda totalSlots
    const currentStamps = Math.min(filledSlots, totalSlots);

    return (
        <View className="w-full bg-[#FAFAF8] rounded-3xl p-6 shadow-lg border border-gray-200 relative overflow-hidden">
            {/* Efeito de papel/textura (simulado com gradiente sutil) */}
            <LinearGradient
                colors={['rgba(0,0,0,0.02)', 'transparent']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 20 }}
            />

            {/* Cabeçalho do Cartão */}
            <View className="flex-row justify-between items-start mb-6">
                <View>
                    <Text className="text-primary-dark font-bold text-xl">Hobby Card</Text>
                    <Text className="text-gray-500 text-sm">
                        {rewardName || "Complete para ganhar um prêmio!"}
                    </Text>
                </View>
                <View className="bg-primary-yellow px-3 py-1 rounded-full">
                    <Text className="text-primary-dark font-bold text-xs">
                        {currentStamps}/{totalSlots}
                    </Text>
                </View>
            </View>

            {/* Grid de Selos */}
            <View className="flex-row flex-wrap justify-between gap-y-4">
                {Array.from({ length: totalSlots }).map((_, index) => {
                    const isStamped = index < currentStamps;
                    const isLast = index === totalSlots - 1;

                    return (
                        <View
                            key={index}
                            className="w-[18%] aspect-square items-center justify-center relative"
                        >
                            {/* Círculo do Slot */}
                            <View
                                className={`w-full h-full rounded-full border-2 items-center justify-center ${isStamped
                                        ? 'border-primary-dark bg-secondary-purple/10'
                                        : 'border-gray-200 bg-gray-50 border-dashed'
                                    }`}
                            >
                                {isStamped ? (
                                    <PawPrint
                                        size={24}
                                        color="#7C4DFF"
                                        fill="#7C4DFF"
                                        style={{
                                            transform: [{ rotate: `${Math.random() * 20 - 10}deg` }],
                                            opacity: 0.9,
                                        }}
                                    />
                                ) : isLast ? (
                                    <Star size={20} color="#FFD600" fill="#FFD600" />
                                ) : (
                                    <Text className="text-gray-300 font-bold text-xs">{index + 1}</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Rodapé/Status */}
            <View className="mt-6 border-t border-gray-100 pt-4">
                <Text className="text-gray-400 text-xs text-center">
                    Cada R$ 50 em serviços = 1 Carimbo
                </Text>
            </View>
        </View>
    );
}
