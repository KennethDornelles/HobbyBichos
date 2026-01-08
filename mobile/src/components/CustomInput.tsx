import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
    icon: React.ElementType;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ icon: Icon, placeholder, value, onChangeText, secureTextEntry, ...props }) => {
    const inputRef = React.useRef<TextInput>(null);
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#2E3047',
            borderRadius: 24,
            paddingHorizontal: 16,
            height: 56,
            marginBottom: 8,
        }}>
            <Icon name={placeholder === 'Password' ? 'lock-closed-outline' : 'mail-outline'} size={22} color="#FFD600" style={{ marginRight: 12 }} />
            <TextInput
                ref={inputRef}
                style={{ flex: 1, color: '#fff', fontSize: 18 }}
                placeholder={placeholder}
                placeholderTextColor="#A1A1AA"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                returnKeyType={secureTextEntry ? 'done' : 'next'}
                blurOnSubmit={!!secureTextEntry}
                {...props}
            />
        </View>
    );
};

export default CustomInput;
