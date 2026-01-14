import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface QuickActionProps {
    icon: LucideIcon;
    label: string;
    onPress?: () => void;
}

export const QuickAction = React.memo(({ icon: Icon, label, onPress }: QuickActionProps) => {
    const colors = useThemeColors();

    return (
        <TouchableOpacity
            onPress={onPress}
            className="items-center"
            style={styles.container}
            activeOpacity={0.7}
        >
            <View
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.bgInput }}
            >
                <Icon size={32} color={colors.accentYellow} strokeWidth={2} />
            </View>
            <Text
                className="text-xs mt-2 text-center font-medium"
                numberOfLines={2}
                style={[styles.label, { color: colors.textMain }]}
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
