import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SideMenu } from '../../components/SideMenu';
import { HomeHeader } from '../../components/HomeHeader';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { useTheme } from '../../context/ThemeContext';
import { appointmentService, Appointment } from '../../services/appointmentService';

export default function AppointmentList() {
    const router = useRouter();
    const { isDark } = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const { totalItems } = useCartStore();

    // Recarrega automaticamente quando a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            loadAppointments();
        }, [])
    );

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch (err: any) {
            console.error('Erro ao carregar agendamentos:', err);
            setError(err?.response?.data?.message || 'Erro ao carregar agendamentos');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await appointmentService.getAll();
            setAppointments(data);
            setError(null);
        } catch (err: any) {
            console.error('Erro ao atualizar agendamentos:', err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Filtra agendamentos pelo nome do pet ou serviço
    const filteredAppointments = appointments.filter(
        item =>
            item.pet?.name.toLowerCase().includes(search.toLowerCase()) ||
            item.service?.name.toLowerCase().includes(search.toLowerCase()) ||
            item.store?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-primary-dark dark:bg-gray-50" edges={["top", "left", "right"]}>
            <HomeHeader
                onMenuPress={() => setMenuVisible(true)}
                onCameraPress={() => console.log('Camera pressed')}
                onCartPress={() => router.push('/carrinho')}
                cartItemsCount={totalItems()}
                onSearchChange={setSearch}
            />
            <View className="flex-1 px-5 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
                <View className="mb-6">
                    <Text className="text-white dark:text-hobby-text-light text-2xl font-bold">Tela de Agendamentos</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={isDark ? '#D97706' : '#FFD600'} />
                        <Text className="text-white dark:text-hobby-text-secondary mt-4">Carregando agendamentos...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Ionicons name="alert-circle-outline" size={48} color={isDark ? '#EF4444' : '#DC2626'} />
                        <Text className="text-white dark:text-hobby-text-light text-center mt-4 text-lg">{error}</Text>
                        <Pressable
                            className="bg-hobby-yellow rounded-2xl px-6 py-3 mt-6"
                            onPress={loadAppointments}
                        >
                            <Text className="text-primary-dark font-bold">Tentar Novamente</Text>
                        </Pressable>
                    </View>
                ) : filteredAppointments.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Ionicons name="calendar-outline" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text className="text-white dark:text-hobby-text-light text-center mt-4 text-lg">
                            {search ? 'Nenhum agendamento encontrado' : 'Você ainda não tem agendamentos'}
                        </Text>
                        {!search && (
                            <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-center mt-2">
                                Toque no botão + para criar seu primeiro agendamento
                            </Text>
                        )}
                    </View>
                ) : (
                    <>
                        <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary mb-3">
                            {filteredAppointments.length} agendamento{filteredAppointments.length !== 1 ? 's' : ''} encontrado{filteredAppointments.length !== 1 ? 's' : ''}
                        </Text>
                        <ScrollView
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={isDark ? '#D97706' : '#FFD600'}
                                    colors={[isDark ? '#D97706' : '#FFD600']}
                                />
                            }
                        >
                            {filteredAppointments.map((item) => (
                                <Pressable
                                    key={item.id}
                                    className="flex-row items-center bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-3xl p-3 mb-3"
                                    onPress={() => router.push(`/appointments/${item.id}`)}
                                >
                                    <View className="w-14 h-14 rounded-full mr-3 bg-hobby-yellow/20 items-center justify-center">
                                        <Ionicons name="paw" size={24} color={isDark ? '#D97706' : '#FFD600'} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white dark:text-hobby-text-light text-lg font-bold">
                                            {item.store?.name || 'Loja'}
                                        </Text>
                                        <Text className="text-hobby-yellow dark:text-hobby-accent-light text-sm">
                                            {item.pet?.name || 'Pet'}
                                        </Text>
                                        <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-xs">
                                            {item.service?.name || 'Serviço'} - {new Date(item.startsAt).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                    <View className={`rounded-2xl px-3 py-1 ml-2 ${item.status === 'COMPLETED' ? 'bg-green-500/20' :
                                            item.status === 'CANCELLED' ? 'bg-red-500/20' :
                                                'bg-yellow-500/20'
                                        }`}>
                                        <Text className={`text-xs font-bold ${item.status === 'COMPLETED' ? 'text-green-500' :
                                                item.status === 'CANCELLED' ? 'text-red-500' :
                                                    'text-yellow-500'
                                            }`}>
                                            {item.status === 'COMPLETED' ? 'Concluído' :
                                                item.status === 'CANCELLED' ? 'Cancelado' :
                                                    'Agendado'}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </>
                )}

                {/* FAB */}
                <Pressable
                    onPress={() => router.push('/appointments/create')}
                    className="absolute right-6 bg-hobby-yellow"
                    style={{
                        bottom: insets.bottom + 24,
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#FFD600',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <Ionicons name="add" size={36} color="#23243A" />
                </Pressable>
            </View>
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={() => setMenuVisible(false)}
            />
        </SafeAreaView>
    );
}
