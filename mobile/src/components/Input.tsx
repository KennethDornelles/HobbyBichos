import React from 'react';
import { View, TextInput, TextInputProps, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { twMerge } from 'tailwind-merge';

interface InputProps extends TextInputProps {
    icon?: React.ReactNode;
    label?: string;
    className?: string;
}

export const Input: React.FC<InputProps> = ({ icon, label, className = '', ...props }) => (
    <View className={twMerge('w-full mb-4', className)}>
        {label && <Text className="mb-1 ml-2 text-base font-medium text-background-dark dark:text-background-light">{label}</Text>}
        <View
            className="flex-row items-center rounded-2xl px-4 py-3"
            style={{
                gap: 8,
                backgroundColor: props.editable === false
                    ? '#E5E7EB'
                    : undefined,
            }}
        >
            {icon && <View>{icon}</View>}
            <TextInput
                className="flex-1 text-base text-background-dark dark:text-background-light"
                placeholderTextColor="#A1A1AA"
                style={[
                    { color: '#23243A' },
                    props.style
                ]}
                {...props}
            />
        </View>
    </View>
);
