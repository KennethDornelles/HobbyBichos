import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SideMenu } from '../../components/SideMenu';
import { HomeHeader } from '../../components/HomeHeader';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { appointmentService, Appointment } from '../../services/appointmentService';

export default function AppointmentList() {
    const router = useRouter();
    const colors = useThemeColors();
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
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bgMain }} edges={["top", "left", "right"]}>
            <HomeHeader
                onMenuPress={() => setMenuVisible(true)}
                onCameraPress={() => console.log('Camera pressed')}
                onCartPress={() => router.push('/carrinho')}
                cartItemsCount={totalItems()}
                onSearchChange={setSearch}
            />
            <View className="flex-1 px-5 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
                <View className="mb-6">
                    <Text className="text-2xl font-bold" style={{ color: colors.textMain }}>Tela de Agendamentos</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.accentYellow} />
                        <Text className="mt-4" style={{ color: colors.textSecondary }}>Carregando agendamentos...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Ionicons name="alert-circle-outline" size={48} color={colors.accentRed} />
                        <Text className="text-center mt-4 text-lg" style={{ color: colors.textMain }}>{error}</Text>
                        <Pressable
                            className="rounded-2xl px-6 py-3 mt-6"
                            style={{ backgroundColor: colors.accentYellow }}
                            onPress={loadAppointments}
                        >
                            <Text className="font-bold" style={{ color: colors.bgMain }}>Tentar Novamente</Text>
                        </Pressable>
                    </View>
                ) : filteredAppointments.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
                        <Text className="text-center mt-4 text-lg" style={{ color: colors.textMain }}>
                            {search ? 'Nenhum agendamento encontrado' : 'Você ainda não tem agendamentos'}
                        </Text>
                        {!search && (
                            <Text className="text-center mt-2" style={{ color: colors.textSecondary }}>
                                Toque no botão + para criar seu primeiro agendamento
                            </Text>
                        )}
                    </View>
                ) : (
                    <>
                        <Text className="mb-3" style={{ color: colors.textSecondary }}>
                            {filteredAppointments.length} agendamento{filteredAppointments.length !== 1 ? 's' : ''} encontrado{filteredAppointments.length !== 1 ? 's' : ''}
                        </Text>
                        <ScrollView
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={colors.accentYellow}
                                    colors={[colors.accentYellow]}
                                />
                            }
                        >
                            {filteredAppointments.map((item) => (
                                <Pressable
                                    key={item.id}
                                    className="flex-row items-center rounded-3xl p-3 mb-3"
                                    style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}
                                    onPress={() => router.push(`/appointments/${item.id}`)}
                                >
                                    <View className="w-14 h-14 rounded-full mr-3 items-center justify-center" style={{ backgroundColor: colors.accentYellow + '33' }}>
                                        <Ionicons name="paw" size={24} color={colors.accentYellow} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold" style={{ color: colors.textMain }}>
                                            {item.store?.name || 'Loja'}
                                        </Text>
                                        <Text className="text-sm" style={{ color: colors.accentYellow }}>
                                            {item.pet?.name || 'Pet'}
                                        </Text>
                                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                            {item.service?.name || 'Serviço'} - {new Date(item.startsAt).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                    <View className="rounded-2xl px-3 py-1 ml-2" style={{ backgroundColor: item.status === 'COMPLETED' ? colors.accentGreen + '33' : item.status === 'CANCELLED' ? colors.accentRed + '33' : colors.accentYellow + '33' }}>
                                        <Text className="text-xs font-bold" style={{ color: item.status === 'COMPLETED' ? colors.accentGreen : item.status === 'CANCELLED' ? colors.accentRed : colors.accentYellow }}>
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
                    className="absolute right-6"
                    style={{
                        bottom: insets.bottom + 24,
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.accentYellow,
                        shadowColor: colors.accentYellow,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <Ionicons name="add" size={36} color={colors.bgMain} />
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
