import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useCartStore } from '../src/store/cartStore';
import api from '../src/services/api';
import { useRouter } from 'expo-router';

export default function CheckoutScreen() {
    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const clear = useCartStore((s) => s.clear);
    const validate = useCartStore((s) => s.validateStockAndPrices);

    const [validating, setValidating] = useState(false);
    const [issues, setIssues] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            setValidating(true);
            try {
                const res = await validate();
                setIssues(res.issues);
                if (!res.valid) {
                    Alert.alert('Ajustes necessários', res.issues.join('\n'));
                }
            } catch {
                // ignore
            } finally {
                setValidating(false);
            }
        })();
    }, [validate]);

    const confirmOrder = async () => {
        try {
            // Exemplo simples de criação de pedido
            await api.post('/orders', { items, total: subtotal });
            clear();
            Alert.alert('Pedido criado', 'Seu pedido foi realizado com sucesso!');
            router.replace('/home');
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível finalizar o pedido.');
        }
    };

    return (
        <View className="flex-1 p-4">
            <Text className="text-2xl font-semibold mb-4">Checkout</Text>

            {issues.length > 0 && (
                <View className="bg-yellow-100 border border-yellow-300 rounded-xl p-3 mb-4">
                    <Text className="text-yellow-800">{issues.join('\n')}</Text>
                </View>
            )}

            <View className="mt-auto bg-white rounded-xl p-4">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-lg">Total</Text>
                    <Text className="text-lg font-semibold">R$ {subtotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity disabled={validating} onPress={confirmOrder} className="bg-black rounded-xl p-3">
                    <Text className="text-white text-center font-semibold">Confirmar pedido</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
