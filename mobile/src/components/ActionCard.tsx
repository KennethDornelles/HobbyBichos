import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface ActionCardProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    onPress?: () => void;
}

export const ActionCard = React.memo(({ title, subtitle, icon: Icon, onPress }: ActionCardProps) => {
    const { isDark } = useTheme();
    const iconColor = isDark ? '#FDB813' : '#D97706';

    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center p-4 rounded-xl mb-3 bg-card-bg dark:bg-white dark:border dark:border-hobby-border-light"
            activeOpacity={0.7}
        >
            <View className="w-12 h-12 rounded-xl items-center justify-center mr-4">
                <Icon size={32} color={iconColor} strokeWidth={2} />
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-white dark:text-hobby-text-light">{title}</Text>
                <Text className="text-sm text-text-secondary dark:text-hobby-text-secondary mt-0.5">{subtitle}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );
});

ActionCard.displayName = 'ActionCard';
