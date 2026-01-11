import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';

interface ActionCardProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    onPress?: () => void;
}

export const ActionCard = React.memo(({ title, subtitle, icon: Icon, onPress }: ActionCardProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center p-4 rounded-xl mb-3 bg-card-bg"
        activeOpacity={0.7}
    >
        <View className="w-12 h-12 rounded-xl items-center justify-center mr-4">
            <Icon size={32} color="#FDB813" strokeWidth={2} />
        </View>
        <View className="flex-1">
            <Text className="text-base font-bold text-white">{title}</Text>
            <Text className="text-sm text-text-secondary mt-0.5">{subtitle}</Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
));

ActionCard.displayName = 'ActionCard';
