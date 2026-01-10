import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
    position?: 'absolute' | 'relative';
    top?: number;
    right?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
    position = 'absolute', 
    top = 48, 
    right = 32 
}) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <View style={[
            styles.container,
            position === 'absolute' && { position: 'absolute', top, right, zIndex: 10 }
        ]}>
            <TouchableOpacity
                onPress={toggleTheme}
                style={[
                    styles.button,
                    { backgroundColor: isDark ? '#23243A' : '#FFD600' }
                ]}
            >
                <Ionicons 
                    name={isDark ? 'sunny-outline' : 'moon-outline'} 
                    size={24} 
                    color={isDark ? '#FFD600' : '#23243A'} 
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
    },
    button: {
        borderRadius: 20,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});
