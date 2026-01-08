import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ReviewStarsProps {
    rating: number;
    max?: number;
    onRate?: (value: number) => void;
    size?: number;
    className?: string;
}

export const ReviewStars: React.FC<ReviewStarsProps> = ({
    rating,
    max = 5,
    onRate,
    size = 24,
    className = '',
}) => (
    <View className={className} style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: max }).map((_, i) => {
            const filled = i < rating;
            return onRate ? (
                <Pressable key={i} onPress={() => onRate(i + 1)}>
                    <Ionicons
                        name={filled ? 'star' : 'star-outline'}
                        size={size}
                        color={filled ? '#FFD600' : '#E5E7EB'}
                    />
                </Pressable>
            ) : (
                <Ionicons
                    key={i}
                    name={filled ? 'star' : 'star-outline'}
                    size={size}
                    color={filled ? '#FFD600' : '#E5E7EB'}
                />
            );
        })}
    </View>
);
