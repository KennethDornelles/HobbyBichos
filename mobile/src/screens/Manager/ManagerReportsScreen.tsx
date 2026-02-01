import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { managerService, EmployeePerformance, AppointmentInDepth } from '../../services/managerService';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import { BarChart2, Star, TrendingUp, Users, Calendar, CheckCircle, XCircle, PieChart } from 'lucide-react-native';

export default function ManagerReportsScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [performance, setPerformance] = useState<EmployeePerformance[]>([]);
    const [appointmentDepth, setAppointmentDepth] = useState<AppointmentInDepth | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user && user.role && !['MANAGER', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
            Alert.alert('Acesso Negado', 'Apenas gerentes, proprietários e administradores podem acessar esta área.', [
                { text: 'OK', onPress: () => router.replace('/home') },
            ]);
            return;
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [performanceData, depthData] = await Promise.all([
                managerService.getEmployeePerformance(),
                managerService.getAppointmentInDepth(
                    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
                    new Date().toISOString()
                ),
            ]);
            setPerformance(performanceData.employees);
            setAppointmentDepth(depthData);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar relatórios');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';

    if (loading && performance.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: bgColor }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{ padding: 16, paddingTop: 60 }}>
                {/* Header */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>
                        Relatórios e Performance
                    </Text>
                    <Text style={{ fontSize: 16, color: '#8B92A9' }}>
                        Performance da equipe
                    </Text>
                </View>

                {/* Horários de Pico */}
                {appointmentDepth && appointmentDepth.peakHours.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                            Horários de Pico (Últimos 30 dias)
                        </Text>
                        <View style={{ backgroundColor: cardBgColor, borderRadius: 12, padding: 16, borderWidth: 1, borderColor }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 }}>
                                {appointmentDepth.peakHours.map((item) => {
                                    const maxHeight = 80;
                                    const maxCount = Math.max(...appointmentDepth.peakHours.map(h => h.count));
                                    const height = maxCount > 0 ? (item.count / maxCount) * maxHeight : 0;

                                    return (
                                        <View key={item.hour} style={{ flex: 1, alignItems: 'center' }}>
                                            <View
                                                style={{
                                                    width: '100%',
                                                    height: Math.max(height, 2),
                                                    backgroundColor: '#FF6B35',
                                                    borderRadius: 4,
                                                    opacity: item.count === maxCount ? 1 : 0.6
                                                }}
                                            />
                                            <Text style={{ fontSize: 10, color: '#8B92A9', marginTop: 4 }}>{item.hour}h</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}

                {/* Performance dos Funcionários */}
                {performance.length > 0 ? (
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                            Performance dos Funcionários
                        </Text>
                        {performance.map((emp) => (
                            <View
                                key={emp.employee.id}
                                style={{
                                    backgroundColor: cardBgColor,
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor,
                                }}
                            >
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>
                                        {emp.employee.name}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#8B92A9' }}>
                                        {emp.employee.role === 'MANAGER' ? 'Gerente' : 'Funcionário'}
                                    </Text>
                                </View>

                                {/* Estatísticas */}
                                <View style={{ gap: 12 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: '#8B92A9' }}>Agendamentos Totais</Text>
                                        <Text style={{ fontWeight: '600', color: textColor }}>
                                            {emp.stats.totalAppointments}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: '#8B92A9' }}>Concluídos</Text>
                                        <Text style={{ fontWeight: '600', color: '#10B981' }}>
                                            {emp.stats.completedAppointments}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: '#8B92A9' }}>Cancelados</Text>
                                        <Text style={{ fontWeight: '600', color: '#EF4444' }}>
                                            {emp.stats.cancelledAppointments}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: '#8B92A9' }}>Taxa de Conclusão</Text>
                                        <Text style={{ fontWeight: '600', color: textColor }}>
                                            {emp.stats.completionRate.toFixed(1)}%
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            paddingTop: 12,
                                            borderTopWidth: 1,
                                            borderTopColor: borderColor,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Ionicons name="star" size={16} color="#F59E0B" />
                                            <Text style={{ color: '#8B92A9' }}>Avaliação Média</Text>
                                        </View>
                                        <Text style={{ fontWeight: '600', color: textColor }}>
                                            {emp.stats.averageRating.toFixed(1)} ({emp.stats.totalReviews} avaliações)
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <EmptyState
                        title="Nenhum dado disponível"
                        description="Não há registros de atividades para o período selecionado."
                        icon={PieChart}
                    />
                )}
            </View>
        </ScrollView>
    );
}
