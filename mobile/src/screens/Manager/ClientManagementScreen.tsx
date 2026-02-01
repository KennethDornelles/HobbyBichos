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
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userManagementService, UserData, CreateUserDto, UpdateUserDto } from '../../services/userManagementService';
import { Ionicons } from '@expo/vector-icons';

export default function ClientManagementScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [clients, setClients] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingClient, setEditingClient] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'CLIENT',
        birthDate: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (user && user.role && !['MANAGER', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
            Alert.alert('Acesso Negado', 'Apenas gerentes, proprietários e administradores podem acessar esta área.', [
                { text: 'OK', onPress: () => router.replace('/home') },
            ]);
            return;
        }
        loadClients();
    }, [user]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await userManagementService.getUsers('CLIENT');
            setClients(data);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadClients();
        setRefreshing(false);
    }, []);

    const openCreateModal = () => {
        setEditingClient(null);
        setFormData({ name: '', email: '', phone: '', password: '123456', role: 'CLIENT', birthDate: '' });
        setModalVisible(true);
    };

    const openEditModal = (client: UserData) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            phone: client.phone,
            password: '',
            birthDate: client.birthDate || '',
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }

        if (!editingClient && !('email' in formData && formData.email)) {
            Alert.alert('Erro', 'Email é obrigatório para novos clientes');
            return;
        }

        try {
            if (editingClient) {
                await userManagementService.updateUser(editingClient.id, formData as UpdateUserDto);
                Alert.alert('Sucesso', 'Cliente atualizado com sucesso');
            } else {
                await userManagementService.createUser({ ...formData, role: 'CLIENT' } as CreateUserDto);
                Alert.alert('Sucesso', 'Cliente criado com sucesso');
            }
            setModalVisible(false);
            loadClients();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar cliente');
        }
    };

    const handleDelete = (client: UserData) => {
        Alert.alert('Confirmar', `Deseja realmente remover ${client.name}?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await userManagementService.deleteUser(client.id);
                        Alert.alert('Sucesso', 'Cliente removido');
                        loadClients();
                    } catch (error: any) {
                        Alert.alert('Erro', error.message);
                    }
                },
            },
        ]);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setFormData({ ...formData, birthDate: selectedDate.toISOString() });
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const inputBgColor = isDark ? '#1A1F3A' : '#FFFFFF';

    if (loading && clients.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={{ padding: 16, paddingTop: 60 }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <View>
                            <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>Gestão de Clientes</Text>
                            <Text style={{ fontSize: 16, color: '#8B92A9' }}>{clients.length} cliente(s)</Text>
                        </View>
                        <Pressable onPress={openCreateModal} style={{ backgroundColor: '#FF6B35', borderRadius: 12, padding: 12 }}>
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    {/* Lista de clientes */}
                    {clients.map((client) => (
                        <View
                            key={client.id}
                            style={{
                                backgroundColor: cardBgColor,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor,
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 4 }}>
                                        {client.name}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 4 }}>{client.email}</Text>
                                    <Text style={{ fontSize: 14, color: '#8B92A9' }}>{client.phone}</Text>
                                </View>
                                <View style={{ gap: 8 }}>
                                    <Pressable onPress={() => openEditModal(client)}>
                                        <Ionicons name="create-outline" size={24} color="#3B82F6" />
                                    </Pressable>
                                    <Pressable onPress={() => handleDelete(client)}>
                                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Modal de criação/edição */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View
                        style={{
                            backgroundColor: bgColor,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 20,
                            maxHeight: '80%',
                        }}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginBottom: 20 }}>
                                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                            </Text>

                            <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>Nome *</Text>
                            <TextInput
                                style={{
                                    backgroundColor: inputBgColor,
                                    borderWidth: 1,
                                    borderColor,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: textColor,
                                    marginBottom: 16,
                                }}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Nome completo"
                                placeholderTextColor="#8B92A9"
                            />

                            {!editingClient && (
                                <>
                                    <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>Email *</Text>
                                    <TextInput
                                        style={{
                                            backgroundColor: inputBgColor,
                                            borderWidth: 1,
                                            borderColor,
                                            borderRadius: 8,
                                            padding: 12,
                                            color: textColor,
                                            marginBottom: 16,
                                        }}
                                        value={'email' in formData ? formData.email : ''}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        placeholder="email@exemplo.com"
                                        placeholderTextColor="#8B92A9"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </>
                            )}

                            <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>Telefone *</Text>
                            <TextInput
                                style={{
                                    backgroundColor: inputBgColor,
                                    borderWidth: 1,
                                    borderColor,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: textColor,
                                    marginBottom: 16,
                                }}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="(00) 00000-0000"
                                placeholderTextColor="#8B92A9"
                                keyboardType="phone-pad"
                            />

                            <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>Data de Nascimento</Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                style={{
                                    backgroundColor: inputBgColor,
                                    borderWidth: 1,
                                    borderColor,
                                    borderRadius: 8,
                                    padding: 12,
                                    marginBottom: 16,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: formData.birthDate ? textColor : '#8B92A9' }}>
                                    {formData.birthDate ? formatDate(formData.birthDate) : 'Selecionar data'}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color="#8B92A9" />
                            </Pressable>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={formData.birthDate ? new Date(formData.birthDate) : new Date(2000, 0, 1)}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                />
                            )}

                            <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>
                                Senha {editingClient ? '(deixe em branco para manter)' : '*'}
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: inputBgColor,
                                    borderWidth: 1,
                                    borderColor,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: textColor,
                                    marginBottom: 24,
                                }}
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                placeholder={editingClient ? 'Nova senha' : '123456'}
                                placeholderTextColor="#8B92A9"
                                secureTextEntry
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Pressable
                                    onPress={() => setModalVisible(false)}
                                    style={{ flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: cardBgColor, borderWidth: 1, borderColor }}
                                >
                                    <Text style={{ textAlign: 'center', fontWeight: '600', color: textColor }}>Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleSave}
                                    style={{ flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: '#FF6B35' }}
                                >
                                    <Text style={{ textAlign: 'center', fontWeight: '600', color: '#FFFFFF' }}>
                                        {editingClient ? 'Salvar' : 'Criar'}
                                    </Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
