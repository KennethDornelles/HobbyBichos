import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface UserGreetingProps {
    name: string;
    points: number;
    onPress?: () => void;
}

export const UserGreeting = React.memo(({ name, points, onPress }: UserGreetingProps) => (
    <View className="bg-card-bg px-6 py-5 mb-2">
        <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">Olá {name}</Text>
            <TouchableOpacity
                onPress={onPress}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
            >
                <View>
                    <Text className="text-xs text-text-secondary text-right">Saldo Hobby Club</Text>
                    <Text className="text-lg font-bold text-primary-yellow">{points} Pontos</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </View>
    </View>
));

UserGreeting.displayName = 'UserGreeting';
