import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { managerService, ServiceWithStats } from '../../services/managerService';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';

export default function ServicesManagementScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [services, setServices] = useState<ServiceWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<ServiceWithStats | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        durationMin: '30',
        isActive: true,
    });

    useEffect(() => {
        if (user && user.role && !['MANAGER', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
            Alert.alert('Acesso Negado', 'Apenas gerentes, proprietários e administradores podem acessar esta área.', [
                { text: 'OK', onPress: () => router.replace('/home') },
            ]);
            return;
        }
        loadServices();
    }, [user]);

    const loadServices = async () => {
        try {
            setLoading(true);
            const data = await managerService.getServices();
            setServices(data);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar serviços');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadServices();
        setRefreshing(false);
    }, []);

    const openCreateModal = () => {
        setEditingService(null);
        setFormData({ name: '', price: '', durationMin: '30', isActive: true });
        setModalVisible(true);
    };

    const openEditModal = (service: ServiceWithStats) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            price: Number(service.price).toString(),
            durationMin: service.durationMin.toString(),
            isActive: service.isActive,
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }

        try {
            const data = {
                name: formData.name,
                price: parseFloat(formData.price),
                durationMin: parseInt(formData.durationMin),
                isActive: formData.isActive,
            };

            if (editingService) {
                await managerService.updateService(editingService.id, data);
                Alert.alert('Sucesso', 'Serviço atualizado com sucesso');
            } else {
                await managerService.createService(data);
                Alert.alert('Sucesso', 'Serviço criado com sucesso');
            }

            setModalVisible(false);
            loadServices();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar serviço');
        }
    };

    const handleDeactivate = (service: ServiceWithStats) => {
        Alert.alert(
            'Confirmar',
            `Deseja realmente ${service.isActive ? 'desativar' : 'ativar'} o serviço "${service.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            if (service.isActive) {
                                await managerService.deactivateService(service.id);
                            } else {
                                await managerService.updateService(service.id, { isActive: true });
                            }
                            loadServices();
                        } catch (error: any) {
                            Alert.alert('Erro', error.message);
                        }
                    },
                },
            ]
        );
    };

    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const inputBgColor = isDark ? '#1A1F3A' : '#FFFFFF';

    if (loading && services.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <ScrollView
                style={{ flex: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={{ padding: 16, paddingTop: 60 }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <View>
                            <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>
                                Gestão de Serviços
                            </Text>
                            <Text style={{ fontSize: 16, color: '#8B92A9' }}>
                                {services.length} serviço(s) cadastrado(s)
                            </Text>
                        </View>
                        <Pressable
                            onPress={openCreateModal}
                            style={{
                                backgroundColor: '#FF6B35',
                                borderRadius: 12,
                                padding: 12,
                            }}
                        >
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    {/* Lista de Serviços */}
                    {services.length > 0 ? (
                        services.map((service) => (
                            <View
                                key={service.id}
                                style={{
                                    backgroundColor: cardBgColor,
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor,
                                    opacity: service.isActive ? 1 : 0.5,
                                }}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>
                                            {service.name}
                                        </Text>
                                        <Text style={{ fontSize: 16, color: '#FF6B35', fontWeight: '600', marginBottom: 8 }}>
                                            R$ {Number(service.price).toFixed(2)}
                                        </Text>
                                        <Text style={{ fontSize: 14, color: '#8B92A9' }}>
                                            Duração: {service.durationMin} min
                                        </Text>
                                        {!service.isActive && (
                                            <Text style={{ fontSize: 14, color: '#EF4444', fontWeight: '600', marginTop: 4 }}>
                                                INATIVO
                                            </Text>
                                        )}
                                    </View>
                                    <View style={{ gap: 8 }}>
                                        <Pressable onPress={() => openEditModal(service)}>
                                            <Ionicons name="create-outline" size={24} color="#3B82F6" />
                                        </Pressable>
                                        <Pressable onPress={() => handleDeactivate(service)}>
                                            <Ionicons
                                                name={service.isActive ? 'close-circle-outline' : 'checkmark-circle-outline'}
                                                size={24}
                                                color={service.isActive ? '#EF4444' : '#10B981'}
                                            />
                                        </Pressable>
                                    </View>
                                </View>

                                {/* Estatísticas */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        gap: 16,
                                        paddingTop: 12,
                                        borderTopWidth: 1,
                                        borderTopColor: borderColor,
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 12, color: '#8B92A9', marginBottom: 4 }}>
                                            Agendamentos
                                        </Text>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                                            {service.stats.appointmentCount}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 12, color: '#8B92A9', marginBottom: 4 }}>
                                            Receita Total
                                        </Text>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                                            R$ {Number(service.stats.totalRevenue).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <EmptyState
                            title="Nenhum serviço encontrado"
                            description="Você ainda não tem serviços cadastrados para esta loja."
                            actionLabel="Criar Primeiro Serviço"
                            onAction={openCreateModal}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Modal de Criação/Edição */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 }}>
                    <View
                        style={{
                            backgroundColor: bgColor,
                            borderRadius: 16,
                            padding: 24,
                            maxHeight: '80%',
                        }}
                    >
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginBottom: 24 }}>
                            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                        </Text>

                        <ScrollView>
                            {/* Nome */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, color: textColor, marginBottom: 8, fontWeight: '600' }}>
                                    Nome do Serviço *
                                </Text>
                                <TextInput
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="Ex: Banho e Tosa"
                                    placeholderTextColor="#8B92A9"
                                    style={{
                                        backgroundColor: inputBgColor,
                                        borderWidth: 1,
                                        borderColor,
                                        borderRadius: 8,
                                        padding: 12,
                                        color: textColor,
                                    }}
                                />
                            </View>

                            {/* Preço */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, color: textColor, marginBottom: 8, fontWeight: '600' }}>
                                    Preço (R$) *
                                </Text>
                                <TextInput
                                    value={formData.price}
                                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                                    placeholder="0.00"
                                    placeholderTextColor="#8B92A9"
                                    keyboardType="decimal-pad"
                                    style={{
                                        backgroundColor: inputBgColor,
                                        borderWidth: 1,
                                        borderColor,
                                        borderRadius: 8,
                                        padding: 12,
                                        color: textColor,
                                    }}
                                />
                            </View>

                            {/* Duração */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, color: textColor, marginBottom: 8, fontWeight: '600' }}>
                                    Duração (minutos)
                                </Text>
                                <TextInput
                                    value={formData.durationMin}
                                    onChangeText={(text) => setFormData({ ...formData, durationMin: text })}
                                    placeholder="30"
                                    placeholderTextColor="#8B92A9"
                                    keyboardType="number-pad"
                                    style={{
                                        backgroundColor: inputBgColor,
                                        borderWidth: 1,
                                        borderColor,
                                        borderRadius: 8,
                                        padding: 12,
                                        color: textColor,
                                    }}
                                />
                            </View>

                            {/* Status */}
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 14, color: textColor, marginBottom: 8, fontWeight: '600' }}>
                                    Status
                                </Text>
                                <Pressable
                                    onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 4,
                                            borderWidth: 2,
                                            borderColor: formData.isActive ? '#10B981' : borderColor,
                                            backgroundColor: formData.isActive ? '#10B981' : 'transparent',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {formData.isActive && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                                    </View>
                                    <Text style={{ color: textColor }}>Serviço Ativo</Text>
                                </Pressable>
                            </View>

                            {/* Botões */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Pressable
                                    onPress={() => setModalVisible(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: cardBgColor,
                                        borderRadius: 8,
                                        padding: 16,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor,
                                    }}
                                >
                                    <Text style={{ color: textColor, fontWeight: '600' }}>Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleSave}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#FF6B35',
                                        borderRadius: 8,
                                        padding: 16,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Salvar</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
