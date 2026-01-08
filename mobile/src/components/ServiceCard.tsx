import React from 'react';
import { View, Text, Image } from 'react-native';
import { twMerge } from 'tailwind-merge';

export interface ServiceCardProps {
    imageUrl: string;
    title: string;
    description: string;
    price: number | string;
    className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    imageUrl,
    title,
    description,
    price,
    className = '',
}) => (
    <View className={twMerge('flex-row items-center bg-background-light dark:bg-background-dark rounded-2xl p-4 shadow-glass', className)} style={{ gap: 16 }}>
        <Image
            source={{ uri: imageUrl }}
            className="w-16 h-16 rounded-full bg-background-dark"
            resizeMode="cover"
        />
        <View className="flex-1">
            <Text className="text-lg font-semibold text-background-dark dark:text-background-light">{title}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-300 mb-1">{description}</Text>
            <Text className="text-base font-bold text-brand-primary">R$ {price}</Text>
        </View>
    </View>
);
