import React, { useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { appointmentService, AppointmentDashboard } from '../../services/appointmentService';
import { router } from 'expo-router';

export default function EmployeeDashboardScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { dashboard, loading, error, refetch } = useDashboard();
    const [refreshing, setRefreshing] = React.useState(false);

    // Verificar se o usuário é employee
    useEffect(() => {
        if (user && user.role !== 'EMPLOYEE') {
            Alert.alert(
                'Acesso Negado',
                'Apenas funcionários podem acessar esta área.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/home'),
                    },
                ]
            );
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const handleUpdateStatus = (appointmentId: string) => {
        router.push({
            pathname: '/employee/update-status',
            params: { appointmentId },
        });
    };

    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const statusColors = {
        SCHEDULED: '#3B82F6',
        COMPLETED: '#10B981',
        CANCELLED: '#EF4444',
    };

    if (loading && !dashboard) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: bgColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: bgColor }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{ padding: 16, paddingTop: 24 }}>
                {/* Header */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>
                        Dashboard
                    </Text>
                    <Text style={{ fontSize: 16, color: '#8B92A9', marginBottom: 12 }}>
                        Bem-vindo, {dashboard?.employeeName}
                    </Text>
                </View>

                {error && (
                    <View
                        style={{
                            backgroundColor: '#FEE2E2',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ color: '#991B1B' }}>{error}</Text>
                    </View>
                )}

                {/* Stats */}
                {dashboard && (
                    <View style={{ marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                            <StatCard
                                label="Hoje"
                                value={dashboard.totalAppointmentsToday}
                                color="#3B82F6"
                                bgColor={isDark ? '#1E3A8A' : '#EFF6FF'}
                                textColor={textColor}
                            />
                            <StatCard
                                label="Concluídos"
                                value={dashboard.completedAppointmentsToday}
                                color="#10B981"
                                bgColor={isDark ? '#064E3B' : '#ECFDF5'}
                                textColor={textColor}
                            />
                            <StatCard
                                label="Cancelados"
                                value={dashboard.cancelledAppointmentsToday}
                                color="#EF4444"
                                bgColor={isDark ? '#7F1D1D' : '#FEF2F2'}
                                textColor={textColor}
                            />
                        </View>
                    </View>
                )}

                {/* Agendamentos de Hoje */}
                {dashboard && dashboard.todayAppointments.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                            Agendamentos de Hoje
                        </Text>
                        {dashboard.todayAppointments.map((apt) => (
                            <AppointmentCard
                                key={apt.id}
                                appointment={apt}
                                onUpdateStatus={() => handleUpdateStatus(apt.id)}
                                isDark={isDark}
                                bgColor={cardBgColor}
                                textColor={textColor}
                                borderColor={borderColor}
                                statusColors={statusColors}
                            />
                        ))}
                    </View>
                )}

                {/* Próximos Agendamentos */}
                {dashboard && dashboard.upcomingAppointments.length > 0 && (
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                            Próximos Agendamentos
                        </Text>
                        {dashboard.upcomingAppointments.map((apt) => (
                            <AppointmentCard
                                key={apt.id}
                                appointment={apt}
                                onUpdateStatus={() => handleUpdateStatus(apt.id)}
                                isDark={isDark}
                                bgColor={cardBgColor}
                                textColor={textColor}
                                borderColor={borderColor}
                                statusColors={statusColors}
                            />
                        ))}
                    </View>
                )}

                {/* Empty State */}
                {dashboard && dashboard.todayAppointments.length === 0 && dashboard.upcomingAppointments.length === 0 && (
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 48,
                        }}
                    >
                        <Text style={{ fontSize: 16, color: '#8B92A9', marginBottom: 8 }}>
                            Nenhum agendamento encontrado
                        </Text>
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>
                            Seus agendamentos aparecerão aqui
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

interface StatCardProps {
    label: string;
    value: number;
    color: string;
    bgColor: string;
    textColor: string;
}

function StatCard({ label, value, color, bgColor, textColor }: StatCardProps) {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: bgColor,
                borderRadius: 12,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: color,
            }}
        >
            <Text style={{ fontSize: 12, color: '#8B92A9', marginBottom: 8 }}>{label}</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: color }}>{value}</Text>
        </View>
    );
}

interface AppointmentCardProps {
    appointment: AppointmentDashboard;
    onUpdateStatus: () => void;
    isDark: boolean;
    bgColor: string;
    textColor: string;
    borderColor: string;
    statusColors: Record<string, string>;
}

function AppointmentCard({
    appointment,
    onUpdateStatus,
    isDark,
    bgColor,
    textColor,
    borderColor,
    statusColors,
}: AppointmentCardProps) {
    const appointmentDate = new Date(appointment.startsAt);
    const timeStr = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const dateStr = appointmentDate.toLocaleDateString('pt-BR');

    return (
        <Pressable onPress={onUpdateStatus} style={{ marginBottom: 12 }}>
            <View
                style={{
                    backgroundColor: bgColor,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: borderColor,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 4 }}>
                            {appointment.serviceName}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#8B92A9' }}>
                            {appointment.clientName}
                        </Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: statusColors[appointment.status],
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                        }}
                    >
                        <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '600' }}>
                            {appointment.status === 'SCHEDULED'
                                ? 'Agendado'
                                : appointment.status === 'COMPLETED'
                                    ? 'Concluído'
                                    : 'Cancelado'}
                        </Text>
                    </View>
                </View>

                <View style={{ marginBottom: 12, backgroundColor: isDark ? '#1A1F3A' : '#F3F4F6', borderRadius: 8, padding: 12 }}>
                    <Text style={{ fontSize: 13, color: '#8B92A9', marginBottom: 4 }}>
                        🕐 {timeStr} - {dateStr}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#8B92A9' }}>
                        🐾 {appointment.petName} ({appointment.petSpecies}) • ⏱ {appointment.serviceDuration} min
                    </Text>
                </View>

                {appointment.notes && (
                    <Text style={{ fontSize: 13, color: '#8B92A9', fontStyle: 'italic', marginBottom: 12 }}>
                        Notas: {appointment.notes}
                    </Text>
                )}

                <Pressable
                    onPress={onUpdateStatus}
                    style={{
                        backgroundColor: '#3B82F6',
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>
                        Atualizar Status
                    </Text>
                </Pressable>
            </View>
        </Pressable>
    );
}
