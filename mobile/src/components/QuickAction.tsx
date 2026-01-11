import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface QuickActionProps {
    icon: LucideIcon;
    label: string;
    onPress?: () => void;
}

export const QuickAction = React.memo(({ icon: Icon, label, onPress }: QuickActionProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="items-center"
        style={styles.container}
        activeOpacity={0.7}
    >
        <View className="w-16 h-16 bg-card-input rounded-full items-center justify-center">
            <Icon size={32} color="#FDB813" strokeWidth={2} />
        </View>
        <Text
            className="text-xs text-white mt-2 text-center font-medium"
            numberOfLines={2}
            style={styles.label}
        >
            {label}
        </Text>
    </TouchableOpacity>
));

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
