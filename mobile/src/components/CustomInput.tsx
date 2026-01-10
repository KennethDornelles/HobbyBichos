import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
    icon: React.ElementType;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    isDark?: boolean;
    iconName?: string;
    rightIcon?: React.ReactNode;
}

const CustomInput: React.FC<CustomInputProps> = ({
    icon: Icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    isDark = true,
    iconName,
    rightIcon,
    ...props
}) => {
    const inputRef = React.useRef<TextInput>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Determina o nome do ícone baseado no placeholder
    const getIconName = () => {
        if (iconName) return iconName;
        if (placeholder.toLowerCase().includes('password') || placeholder.toLowerCase().includes('senha')) {
            return 'lock-closed-outline';
        }
        if (placeholder.toLowerCase().includes('email') || placeholder.toLowerCase().includes('e-mail')) {
            return 'mail-outline';
        }
        if (placeholder.toLowerCase().includes('name') || placeholder.toLowerCase().includes('nome')) {
            return 'person-outline';
        }
        return 'mail-outline';
    };

    const backgroundColor = isDark ? '#2E3047' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#111827';
    const placeholderColor = isDark ? '#A1A1AA' : '#9CA3AF';
    const borderColor = isDark ? 'transparent' : '#E5E7EB';

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: backgroundColor,
            borderRadius: 24,
            paddingHorizontal: 16,
            height: 56,
            marginBottom: 8,
            borderWidth: isDark ? 0 : 1,
            borderColor: borderColor,
        }}>
            <Icon name={getIconName()} size={22} color="#FFD600" style={{ marginRight: 12 }} />
            <TextInput
                ref={inputRef}
                style={{ flex: 1, color: textColor, fontSize: 16 }}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry && !showPassword}
                returnKeyType={secureTextEntry ? 'done' : 'next'}
                blurOnSubmit={!!secureTextEntry}
                {...props}
            />
            {secureTextEntry && (
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ marginLeft: 8 }}
                >
                    <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={22}
                        color={isDark ? '#A1A1AA' : '#6B7280'}
                    />
                </TouchableOpacity>
            )}
            {rightIcon && !secureTextEntry && (
                <View style={{ marginLeft: 8 }}>
                    {rightIcon}
                </View>
            )}
        </View>
    );
};

export default CustomInput;
