import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Ionicons } from '@expo/vector-icons';

export interface StandardButtonProps {
    title: string;
    onPress: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
    disabled?: boolean;
}

export const StandardButton: React.FC<StandardButtonProps> = ({
    title,
    onPress,
    icon,
    variant = 'primary',
    className = '',
    disabled = false,
}) => (
    <Pressable
        onPress={onPress}
        disabled={disabled}
        className={twMerge(
            'flex-row items-center justify-center rounded-2xl px-6 py-3',
            variant === 'primary'
                ? 'bg-brand-primary'
                : 'bg-brand-secondary',
            disabled && 'opacity-50',
            className
        )}
        style={{ gap: 8 }}
    >
        {icon && <View>{icon}</View>}
        <Text className={twMerge('text-base font-bold', variant === 'primary' ? 'text-background-dark' : 'text-white')}>{title}</Text>
    </Pressable>
);
