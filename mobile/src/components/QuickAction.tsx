import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface QuickActionProps {
    icon: LucideIcon;
    label: string;
    onPress?: () => void;
}

export const QuickAction = React.memo(({ icon: Icon, label, onPress }: QuickActionProps) => {
    const { isDark } = useTheme();
    const iconColor = isDark ? '#FDB813' : '#D97706'; // Laranja mais escuro no light mode

    return (
        <TouchableOpacity
            onPress={onPress}
            className="items-center"
            style={styles.container}
            activeOpacity={0.7}
        >
            <View className="w-16 h-16 bg-card-input dark:bg-gray-200 rounded-full items-center justify-center">
                <Icon size={32} color={iconColor} strokeWidth={2} />
            </View>
            <Text
                className="text-xs text-white dark:text-hobby-text-light mt-2 text-center font-medium"
                numberOfLines={2}
                style={styles.label}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        width: 80,
        marginHorizontal: 8,
    },
    label: {
        width: 80,
    },
});

QuickAction.displayName = 'QuickAction';
