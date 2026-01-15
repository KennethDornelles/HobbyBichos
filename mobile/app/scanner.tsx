import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useUserStore } from '../src/store/userStore';
import ScannerScreen from '../src/screens/ScannerScreen';

/**
 * Rota protegida do scanner
 * Apenas EMPLOYEE, ADMIN e outros não-clientes podem acessar
 */
export default function ScannerRoute() {
    const { role } = useUserStore();

    // Bloquear acesso para clientes
    if (role === 'CLIENT') {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                    Acesso negado
                </Text>
                <Text style={{ color: '#ccc', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 }}>
                    O scanner está disponível apenas para funcionários.
                </Text>
            </View>
        );
    }

    // Permitir acesso para EMPLOYEE, ADMIN, etc.
    return <ScannerScreen />;
}
