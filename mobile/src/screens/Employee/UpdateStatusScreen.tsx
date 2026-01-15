import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { appointmentService, Appointment } from '../../services/appointmentService';

export default function UpdateStatusScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { appointmentId } = useLocalSearchParams();

    // Verificar se o usuário é employee
    useEffect(() => {
        if (user && user.role !== 'EMPLOYEE') {
            Alert.alert(
                'Acesso Negado',
                'Apenas funcionários podem atualizar status de agendamentos.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/home'),
                    },
                ]
            );
        }
    }, [user]);

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [status, setStatus] = useState<'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('SCHEDULED');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const inputBgColor = isDark ? '#1F2937' : '#F3F4F6';
    const statusColors = {
        SCHEDULED: '#3B82F6',
        COMPLETED: '#10B981',
        CANCELLED: '#EF4444',
    };
    const statusLabels = {
        SCHEDULED: 'Agendado',
        COMPLETED: 'Concluído',
        CANCELLED: 'Cancelado',
    };

    useEffect(() => {
        loadAppointment();
    }, []);

    const loadAppointment = async () => {
        try {
            setLoading(true);
            if (typeof appointmentId === 'string') {
                const data = await appointmentService.getById(appointmentId);
                setAppointment(data);
                setStatus(data.status as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED');
                setNotes(data.notes || '');
            }
        } catch (error) {
            console.error('Erro ao carregar agendamento:', error);
            Alert.alert('Erro', 'Não foi possível carregar o agendamento');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!appointmentId || typeof appointmentId !== 'string') {
            Alert.alert('Erro', 'ID do agendamento inválido');
            return;
        }

        try {
            setUpdating(true);
            await appointmentService.updateAppointmentStatus(appointmentId, {
                status,
                notes: notes || undefined,
            });
            Alert.alert('Sucesso', 'Status atualizado com sucesso', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
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

    if (!appointment) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: bgColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 16,
                }}
            >
                <Text style={{ fontSize: 16, color: textColor }}>Agendamento não encontrado</Text>
            </View>
        );
    }

    const appointmentDate = new Date(appointment.startsAt);
    const timeStr = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const dateStr = appointmentDate.toLocaleDateString('pt-BR');

    return (
        <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
            <View style={{ padding: 16, paddingTop: 24 }}>
                {/* Header */}
                <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6' }}>← Voltar</Text>
                </Pressable>

                <Text style={{ fontSize: 22, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
                    Atualizar Status
                </Text>
                <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 24 }}>
                    {appointment.service?.name} • {appointment.pet?.name}
                </Text>

                {/* Appointment Info */}
                <View
                    style={{
                        backgroundColor: cardBgColor,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: borderColor,
                    }}
                >
                    <InfoRow label="Cliente" value={appointment.store?.name || 'N/A'} />
                    <InfoRow label="Serviço" value={appointment.service?.name || 'N/A'} />
                    <InfoRow label="Pet" value={`${appointment.pet?.name} (${appointment.store?.name})`} />
                    <InfoRow label="Data e Hora" value={`${timeStr} - ${dateStr}`} />
                    <InfoRow
                        label="Status Atual"
                        value={
                            status === 'SCHEDULED'
                                ? 'Agendado'
                                : status === 'COMPLETED'
                                    ? 'Concluído'
                                    : 'Cancelado'
                        }
                    />
                </View>

                {/* Status Selection */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 12 }}>
                        Novo Status
                    </Text>
                    {(['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                        <Pressable
                            key={st}
                            onPress={() => setStatus(st)}
                            style={{
                                backgroundColor: status === st ? statusColors[st] : cardBgColor,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12,
                                borderWidth: 2,
                                borderColor: status === st ? statusColors[st] : borderColor,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: status === st ? '#FFFFFF' : textColor,
                                }}
                            >
                                {statusLabels[st]}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Notes */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 12 }}>
                        Notas (opcional)
                    </Text>
                    <TextInput
                        style={{
                            backgroundColor: inputBgColor,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: borderColor,
                            padding: 12,
                            color: textColor,
                            minHeight: 100,
                            textAlignVertical: 'top',
                            fontSize: 14,
                        }}
                        placeholder="Adicione notas sobre o agendamento..."
                        placeholderTextColor="#8B92A9"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </View>

                {/* Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    <Pressable
                        onPress={() => router.back()}
                        disabled={updating}
                        style={{
                            flex: 1,
                            backgroundColor: cardBgColor,
                            paddingVertical: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: borderColor,
                            opacity: updating ? 0.6 : 1,
                        }}
                    >
                        <Text style={{ color: textColor, fontWeight: '600', fontSize: 16 }}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleUpdateStatus}
                        disabled={updating}
                        style={{
                            flex: 1,
                            backgroundColor: '#3B82F6',
                            paddingVertical: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            opacity: updating ? 0.6 : 1,
                        }}
                    >
                        {updating ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                                Salvar Alterações
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

interface InfoRowProps {
    label: string;
    value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
    const { isDark } = useTheme();
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const labelColor = '#8B92A9';

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#3F4558' : '#E5E7EB',
            }}
        >
            <Text style={{ fontSize: 14, color: labelColor }}>{label}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>{value}</Text>
        </View>
    );
}
