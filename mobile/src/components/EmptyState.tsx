import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LucideIcon, Search } from 'lucide-react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = Search,
    title,
    description,
    actionLabel,
    onAction,
    style,
}) => {
    const colors = useThemeColors();

    return (
        <View
            className="items-center justify-center p-8 rounded-2xl"
            style={[{ backgroundColor: colors.bgCard }, style]}
        >
            <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.bgMain }}
            >
                <Icon size={40} color={colors.accentYellow} opacity={0.8} />
            </View>

            <Text
                className="text-lg font-bold text-center mb-2"
                style={{ color: colors.textMain }}
            >
                {title}
            </Text>

            {description && (
                <Text
                    className="text-sm text-center mb-6 leading-5"
                    style={{ color: colors.textSecondary }}
                >
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    activeOpacity={0.7}
                    className="px-6 py-3 rounded-full"
                    style={{ backgroundColor: colors.accentYellow }}
                >
                    <Text className="text-black font-bold">
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
