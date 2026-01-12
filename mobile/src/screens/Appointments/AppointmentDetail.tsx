import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { useTheme } from '../../context/ThemeContext';
import { HomeHeader } from '../../components/HomeHeader';
import { SideMenu } from '../../components/SideMenu';
import { useCartStore } from '../../store/cartStore';

const AppointmentDetail = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDark } = useTheme();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const { totalItems } = useCartStore();

    useEffect(() => {
        if (id) {
            loadAppointment();
        }
    }, [id]);

    const loadAppointment = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await appointmentService.getById(id as string);
            setAppointment(data);
        } catch (err: any) {
            console.error('Erro ao carregar agendamento:', err);
            setError(err?.response?.data?.message || 'Erro ao carregar agendamento');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500';
            case 'CANCELLED':
                return 'bg-red-500';
            default:
                return 'bg-yellow-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Concluído';
            case 'CANCELLED':
                return 'Cancelado';
            default:
                return 'Agendado';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary-dark dark:bg-gray-50" edges={['top']}>
            <HomeHeader
                onMenuPress={() => setMenuVisible(true)}
                onCameraPress={() => console.log('Camera pressed')}
                onCartPress={() => router.push('/carrinho')}
                cartItemsCount={totalItems()}
            />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? '#D97706' : '#FFD600'} />
                    <Text className="text-white dark:text-hobby-text-secondary mt-4">Carregando detalhes...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={48} color={isDark ? '#EF4444' : '#DC2626'} />
                    <Text className="text-white dark:text-hobby-text-light text-center mt-4 text-lg">{error}</Text>
                    <Pressable
                        className="bg-hobby-yellow rounded-2xl px-6 py-3 mt-6"
                        onPress={loadAppointment}
                    >
                        <Text className="text-primary-dark font-bold">Tentar Novamente</Text>
                    </Pressable>
                    <Pressable
                        className="mt-4"
                        onPress={() => router.back()}
                    >
                        <Text className="text-hobby-yellow dark:text-hobby-accent-light">Voltar</Text>
                    </Pressable>
                </View>
            ) : appointment ? (
                <ScrollView className="flex-1 px-5 pt-4">
                    {/* Header com status */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Pressable onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={28} color={isDark ? '#1F2937' : '#FFFFFF'} />
                        </Pressable>
                        <View className="flex-1">
                            <Text className="text-white dark:text-hobby-text-light text-2xl font-bold">Detalhes do Agendamento</Text>
                        </View>
                        <View className={`${getStatusColor(appointment.status)} rounded-2xl px-3 py-2`}>
                            <Text className="text-white text-xs font-bold">{getStatusText(appointment.status)}</Text>
                        </View>
                    </View>

                    {/* Card da Loja */}
                    {appointment.store && (
                        <View className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-3xl p-4 mb-4">
                            <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-xs uppercase mb-2">Loja</Text>
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded-full mr-3 bg-hobby-yellow/20 items-center justify-center">
                                    <Ionicons name="storefront" size={20} color={isDark ? '#D97706' : '#FFD600'} />
                                </View>
                                <Text className="text-white dark:text-hobby-text-light text-lg font-bold flex-1">
                                    {appointment.store.name}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Card do Pet */}
                    {appointment.pet && (
                        <View className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-3xl p-4 mb-4">
                            <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-xs uppercase mb-2">Pet</Text>
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded-full mr-3 bg-hobby-yellow/20 items-center justify-center">
                                    <Ionicons name="paw" size={20} color={isDark ? '#D97706' : '#FFD600'} />
                                </View>
                                <Text className="text-hobby-yellow dark:text-hobby-accent-light text-lg font-bold">
                                    {appointment.pet.name}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Card do Serviço */}
                    {appointment.service && (
                        <View className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-3xl p-4 mb-4">
                            <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-xs uppercase mb-2">Serviço</Text>
                            <Text className="text-white dark:text-hobby-text-light text-lg font-bold mb-2">
                                {appointment.service.name}
                            </Text>
                            {appointment.service.price && (
                                <Text className="text-hobby-yellow dark:text-hobby-accent-light text-xl font-bold">
                                    R$ {Number(appointment.service.price).toFixed(2)}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Card de Data/Hora */}
                    <View className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-3xl p-4 mb-4">
                        <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-xs uppercase mb-2">Data e Hora</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="calendar" size={20} color={isDark ? '#D97706' : '#FFD600'} />
                            <Text className="text-white dark:text-hobby-text-light text-lg ml-2">
                                {new Date(appointment.startsAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="time" size={20} color={isDark ? '#D97706' : '#FFD600'} />
                            <Text className="text-white dark:text-hobby-text-light text-lg ml-2">
                                {new Date(appointment.startsAt).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Card de Profissional */}
                    {appointment.professional && (
                        <View className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-3xl p-4 mb-4">
                            <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-xs uppercase mb-2">Profissional</Text>
                            <Text className="text-white dark:text-hobby-text-light text-lg font-bold">
                                {appointment.professional.name}
                            </Text>
                        </View>
                    )}

                    {/* Notas */}
                    {appointment.notes && (
                        <View className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-3xl p-4 mb-4">
                            <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-xs uppercase mb-2">Observações</Text>
                            <Text className="text-white dark:text-hobby-text-light text-base">
                                {appointment.notes}
                            </Text>
                        </View>
                    )}

                    {/* Botões de Ação */}
                    {appointment.status === 'SCHEDULED' && (
                        <View className="mb-8">
                            <Pressable
                                className="bg-red-500 rounded-2xl py-4 items-center mb-3"
                                onPress={() => {
                                    // Implementar cancelamento
                                    console.log('Cancelar agendamento');
                                }}
                            >
                                <Text className="text-white font-bold text-lg">Cancelar Agendamento</Text>
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            ) : null}

            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={() => setMenuVisible(false)}
            />
        </SafeAreaView>
    );
};

export default AppointmentDetail;
