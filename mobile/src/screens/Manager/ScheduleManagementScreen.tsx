import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Alert,
    Modal,
    Platform,
    StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { managerService, WorkSchedule } from '../../services/managerService';
import { Ionicons } from '@expo/vector-icons';

export default function ScheduleManagementScreen() {
    const { isDark } = useTheme();
    const router = useRouter();
    const { userId, userName } = useLocalSearchParams<{ userId: string; userName: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [schedule, setSchedule] = useState<WorkSchedule[]>([]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<WorkSchedule | null>(null);
    const [tempDaySchedule, setTempDaySchedule] = useState<WorkSchedule | null>(null);
    const [showTimePicker, setShowTimePicker] = useState<{ visible: boolean; field: 'startTime' | 'endTime' | 'startBreak' | 'endBreak' }>({ visible: false, field: 'startTime' });

    // Styles
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';

    useEffect(() => {
        if (userId) {
            loadSchedule();
        }
    }, [userId]);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            const data = await managerService.getEmployeeSchedule(userId!);
            setSchedule(data);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar escala');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            await managerService.updateEmployeeSchedule(userId!, schedule);
            Alert.alert('Sucesso', 'Escala atualizada com sucesso', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar escala');
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (day: WorkSchedule) => {
        setSelectedDay(day);
        setTempDaySchedule({ ...day });
        setModalVisible(true);
    };

    const saveDayEdit = () => {
        if (!tempDaySchedule || !selectedDay) return;

        const updatedSchedule = schedule.map(d =>
            d.weekday === selectedDay.weekday ? tempDaySchedule : d
        );
        setSchedule(updatedSchedule);
        setModalVisible(false);
    };

    const weekStart = new Date();
    // Helper to get formatted time for picker
    const getTimeDate = (timeString?: string) => {
        const d = new Date();
        if (!timeString) return d;
        const [h, m] = timeString.split(':').map(Number);
        d.setHours(h, m, 0, 0);
        return d;
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        const field = showTimePicker.field;
        // Close picker on Android immediately
        if (Platform.OS === 'android') {
            setShowTimePicker({ ...showTimePicker, visible: false });
        }

        if (selectedDate && tempDaySchedule) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const newTime = `${hours}:${minutes}`;

            setTempDaySchedule({
                ...tempDaySchedule,
                [field]: newTime
            });
        }
    };

    const getWeekdayName = (dayIndex: number) => {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[dayIndex];
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <Stack.Screen options={{ title: `Escala - ${userName || 'Funcionário'}` }} />

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <Text style={{ fontSize: 16, color: '#8B92A9', marginBottom: 20 }}>
                    Defina os horários de trabalho e intervalos para cada dia da semana.
                </Text>

                {schedule.map((day) => (
                    <Pressable
                        key={day.weekday}
                        onPress={() => openEditModal(day)}
                        style={{
                            backgroundColor: cardBgColor,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: day.isDayOff ? borderColor : '#3B82F6',
                            opacity: day.isDayOff ? 0.8 : 1
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
                                    {getWeekdayName(day.weekday)}
                                </Text>
                                <Text style={{ fontSize: 14, color: day.isDayOff ? '#EF4444' : '#10B981', fontWeight: '600' }}>
                                    {day.isDayOff ? 'FOLGA' : `${day.startTime} - ${day.endTime}`}
                                </Text>
                            </View>

                            {!day.isDayOff && day.startBreak && (
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 12, color: '#8B92A9' }}>Intervalo</Text>
                                    <Text style={{ fontSize: 14, color: textColor }}>
                                        {day.startBreak} - {day.endBreak}
                                    </Text>
                                </View>
                            )}

                            <Ionicons name="chevron-forward" size={20} color="#8B92A9" />
                        </View>
                    </Pressable>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: borderColor, backgroundColor: bgColor }}>
                <Pressable
                    onPress={handleSaveAll}
                    disabled={saving}
                    style={{
                        backgroundColor: '#FF6B35',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Salvar Alterações</Text>
                    )}
                </Pressable>
            </View>

            {/* Modal de Edição */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: bgColor, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>
                                {tempDaySchedule && getWeekdayName(tempDaySchedule.weekday)}
                            </Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={textColor} />
                            </Pressable>
                        </View>

                        {tempDaySchedule && (
                            <ScrollView>
                                {/* Switch Folga */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
                                    <Text style={{ fontSize: 16, color: textColor }}>Dia de Folga</Text>
                                    <Pressable
                                        onPress={() => setTempDaySchedule({ ...tempDaySchedule, isDayOff: !tempDaySchedule.isDayOff })}
                                        style={{
                                            width: 50, height: 30, borderRadius: 15,
                                            backgroundColor: tempDaySchedule.isDayOff ? '#10B981' : '#E5E7EB',
                                            justifyContent: 'center', padding: 2
                                        }}
                                    >
                                        <View style={{
                                            width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF',
                                            alignSelf: tempDaySchedule.isDayOff ? 'flex-end' : 'flex-start'
                                        }} />
                                    </Pressable>
                                </View>

                                {!tempDaySchedule.isDayOff && (
                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>Jornada de Trabalho</Text>

                                        <View style={styles.timeRow}>
                                            <TimeInput
                                                label="Início"
                                                value={tempDaySchedule.startTime}
                                                onPress={() => setShowTimePicker({ visible: true, field: 'startTime' })}
                                                textColor={textColor} borderColor={borderColor}
                                            />
                                            <TimeInput
                                                label="Fim"
                                                value={tempDaySchedule.endTime}
                                                onPress={() => setShowTimePicker({ visible: true, field: 'endTime' })}
                                                textColor={textColor} borderColor={borderColor}
                                            />
                                        </View>

                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 16, marginTop: 20 }}>Intervalo</Text>

                                        <View style={styles.timeRow}>
                                            <TimeInput
                                                label="Início Pausa"
                                                value={tempDaySchedule.startBreak || '--:--'}
                                                onPress={() => setShowTimePicker({ visible: true, field: 'startBreak' })}
                                                textColor={textColor} borderColor={borderColor}
                                            />
                                            <TimeInput
                                                label="Fim Pausa"
                                                value={tempDaySchedule.endBreak || '--:--'}
                                                onPress={() => setShowTimePicker({ visible: true, field: 'endBreak' })}
                                                textColor={textColor} borderColor={borderColor}
                                            />
                                        </View>
                                    </View>
                                )}

                                <Pressable
                                    onPress={saveDayEdit}
                                    style={{
                                        backgroundColor: '#3B82F6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 30
                                    }}
                                >
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirmar Dia</Text>
                                </Pressable>
                            </ScrollView>
                        )}

                        {/* Date Pickers (Invisible/Modal based on OS) */}
                        {showTimePicker.visible && (
                            <DateTimePicker
                                value={getTimeDate(tempDaySchedule?.[showTimePicker.field] as string)}
                                mode="time"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onTimeChange}
                            />
                        )}
                        {/* iOS needs a confirmaton button for spinner which doesn't auto-close */}
                        {Platform.OS === 'ios' && showTimePicker.visible && (
                            <Pressable
                                onPress={() => setShowTimePicker({ ...showTimePicker, visible: false })}
                                style={{ backgroundColor: cardBgColor, padding: 10, alignItems: 'center', marginTop: 10 }}
                            >
                                <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>OK</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const TimeInput = ({ label, value, onPress, textColor, borderColor }: any) => (
    <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: '#8B92A9', marginBottom: 4 }}>{label}</Text>
        <Pressable
            onPress={onPress}
            style={{
                borderWidth: 1, borderColor, borderRadius: 8, padding: 12, alignItems: 'center'
            }}
        >
            <Text style={{ fontSize: 16, color: textColor, fontWeight: '500' }}>{value}</Text>
        </Pressable>
    </View>
);

const styles = StyleSheet.create({
    timeRow: {
        flexDirection: 'row',
        gap: 16,
    }
});
