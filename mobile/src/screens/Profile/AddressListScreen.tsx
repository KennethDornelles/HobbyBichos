import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { addressService, Address } from '../../services/addressService';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import { useFocusEffect } from '@react-navigation/native';

export default function AddressListScreen() {
    const { isDark } = useTheme();
    const router = useRouter();

    // Theme Colors
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const textSecondary = '#8B92A9';

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressService.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar seus endereços.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAddresses();
        setRefreshing(false);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja remover este endereço?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await addressService.deleteAddress(id);
                            loadAddresses();
                        } catch (error) {
                            Alert.alert('Erro', 'Falha ao remover endereço.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <View style={{ padding: 16, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>Meus Endereços</Text>
                <Pressable
                    onPress={() => router.push('/profile/addresses/new')}
                    style={{ backgroundColor: '#FF6B35', padding: 8, borderRadius: 8 }}
                >
                    <Ionicons name="add" size={24} color="#FFF" />
                </Pressable>
            </View>

            {loading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1, paddingHorizontal: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {addresses.length > 0 ? (
                        addresses.map((addr) => (
                            <View key={addr.id} style={{
                                backgroundColor: cardBgColor,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: borderColor
                            }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{addr.title}</Text>
                                        {addr.isDefault && (
                                            <View style={{ backgroundColor: '#10B98120', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                                <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>PADRÃO</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <Pressable onPress={() => router.push(`/profile/addresses/${addr.id}`)}>
                                            <Ionicons name="create-outline" size={20} color="#3B82F6" />
                                        </Pressable>
                                        <Pressable onPress={() => handleDelete(addr.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </Pressable>
                                    </View>
                                </View>

                                <Text style={{ color: textSecondary, fontSize: 14 }}>
                                    {addr.street}, {addr.number} {addr.complement ? `- ${addr.complement}` : ''}
                                </Text>
                                <Text style={{ color: textSecondary, fontSize: 14 }}>
                                    {addr.district} - {addr.city}/{addr.state}
                                </Text>
                                <Text style={{ color: textSecondary, fontSize: 14 }}>
                                    CEP: {addr.zipCode}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <EmptyState
                            title="Nenhum endereço"
                            description="Cadastre um endereço para facilitar seus pedidos."
                            actionLabel="Adicionar Endereço"
                            onAction={() => router.push('/profile/addresses/new')}
                        />
                    )}
                </ScrollView>
            )}
        </View>
    );
}
