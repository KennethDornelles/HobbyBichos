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
import api from '../../services/api';
import { userManagementService, UserData, CreateUserDto, UpdateUserDto } from '../../services/userManagementService';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';

export default function TeamManagementScreen() {
    const { isDark } = useTheme();
    const { user, isLoading: authLoading, updateUser } = useAuth();
    const router = useRouter();

    // Guard contra renderização sem usuário
    if (!user && !authLoading) return null;

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'EMPLOYEE',
        birthDate: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Cores e estilos
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const inputBgColor = isDark ? '#1A1F3A' : '#FFFFFF';

    // Verificação de permissões - só calcula se user existe
    const canManageAllRoles = user?.role === 'OWNER' || user?.role === 'SUPER_ADMIN';

    // Efeito de verificação de acesso e carregamento inicial
    useEffect(() => {
        // Se ainda está carregando auth, não faz nada
        if (authLoading) return;

        // Se não tem usuário após carregar, redireciona
        if (!user) {
            router.replace('/login');
            return;
        }

        // Verifica permissões
        if (!['MANAGER', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
            Alert.alert(
                'Acesso Negado',
                'Apenas gerentes, proprietários e administradores podem acessar esta área.',
                [{ text: 'OK', onPress: () => router.replace('/home') }]
            );
            return;
        }

        // Carrega os usuários
        loadUsers();
    }, [user, authLoading]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userManagementService.getUsers();

            // Filtra usuários baseado nas permissões
            const filtered = data.filter((u) => {
                if (canManageAllRoles) {
                    // OWNER e SUPER_ADMIN veem todos
                    return ['EMPLOYEE', 'MANAGER', 'OWNER'].includes(u.role);
                } else if (user?.role === 'MANAGER') {
                    // MANAGER só vê EMPLOYEE
                    return u.role === 'EMPLOYEE';
                }
                // Outros não veem nada
                return false;
            });

            setUsers(filtered);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar equipe');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    }, [canManageAllRoles]);

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '123456',
            role: 'EMPLOYEE',
            birthDate: '',
        });
        setModalVisible(true);
    };

    const openEditModal = (userItem: UserData) => {
        setEditingUser(userItem);
        setFormData({
            name: userItem.name,
            phone: userItem.phone,
            password: '',
            role: userItem.role as any,
            birthDate: userItem.birthDate || '',
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }

        if (!editingUser && !('email' in formData && formData.email)) {
            Alert.alert('Erro', 'Email é obrigatório para novos usuários');
            return;
        }

        try {
            if (editingUser) {
                await userManagementService.updateUser(editingUser.id, formData as UpdateUserDto);
                // Sempre buscar o usuário logado atualizado após update do próprio usuário
                if (editingUser.id === user?.id) {
                    try {
                        const userResponse = await api.get('/auth/me');
                        await updateUser(userResponse.data);
                    } catch (err) {
                    }
                }
                Alert.alert('Sucesso', 'Usuário atualizado com sucesso');
            } else {
                await userManagementService.createUser(formData as CreateUserDto);
                Alert.alert('Sucesso', 'Usuário criado com sucesso');
            }
            setModalVisible(false);
            loadUsers();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar usuário');
        }
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

    const handleDelete = (userItem: UserData) => {
        Alert.alert(
            'Confirmar',
            `Deseja realmente remover ${userItem.name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userManagementService.deleteUser(userItem.id);
                            Alert.alert('Sucesso', 'Usuário removido');
                            loadUsers();
                        } catch (error: any) {
                            Alert.alert('Erro', error.message);
                        }
                    },
                },
            ]
        );
    };

    const getRoleName = (role: string) => {
        const roles: Record<string, string> = {
            EMPLOYEE: 'Funcionário',
            MANAGER: 'Gerente',
            OWNER: 'Proprietário',
        };
        return roles[role] || role;
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            EMPLOYEE: '#3B82F6',
            MANAGER: '#8B5CF6',
            OWNER: '#F59E0B',
        };
        return colors[role] || '#6B7280';
    };

    // Loading de autenticação
    if (authLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={{ color: textColor, marginTop: 16 }}>Autenticando...</Text>
            </View>
        );
    }

    // Usuário não autenticado (não deve chegar aqui por causa do useEffect)
    if (!user) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: textColor }}>Redirecionando...</Text>
            </View>
        );
    }

    // Loading de dados
    if (loading && users.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={{ color: textColor, marginTop: 16 }}>Carregando equipe...</Text>
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
                                Gestão da Equipe
                            </Text>
                            <Text style={{ fontSize: 16, color: '#8B92A9' }}>
                                {users.length} membro(s)
                            </Text>
                        </View>
                        <Pressable
                            onPress={openCreateModal}
                            style={{ backgroundColor: '#FF6B35', borderRadius: 12, padding: 12 }}
                        >
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    {/* Lista de usuários */}
                    {users.length > 0 ? (
                        users.map((userItem) => (
                            <View
                                key={userItem.id}
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
                                            {userItem.name}
                                        </Text>
                                        <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>
                                            {userItem.email}
                                        </Text>
                                        <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>
                                            {userItem.phone}
                                        </Text>
                                        <View
                                            style={{
                                                backgroundColor: getRoleColor(userItem.role) + '20',
                                                paddingHorizontal: 8,
                                                paddingVertical: 4,
                                                borderRadius: 6,
                                                alignSelf: 'flex-start',
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: getRoleColor(userItem.role) }}>
                                                {getRoleName(userItem.role)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ gap: 8 }}>
                                        <Pressable onPress={() => openEditModal(userItem)}>
                                            <Ionicons name="create-outline" size={24} color="#3B82F6" />
                                        </Pressable>
                                        <Pressable onPress={() => handleDelete(userItem)}>
                                            <Ionicons name="trash-outline" size={24} color="#EF4444" />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <EmptyState
                            title="Nenhum membro encontrado"
                            description="Você ainda não tem membros na equipe cadastrados."
                            actionLabel="Adicionar Membro"
                            onAction={openCreateModal}
                        />
                    )}
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
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </Text>

                            {/* Nome */}
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

                            {/* Email (apenas criação) */}
                            {!editingUser && (
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

                            {/* Telefone */}
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

                            {/* Seleção de Papel - Apenas na criação para OWNER/SUPER_ADMIN */}
                            {!editingUser && canManageAllRoles && (
                                <>
                                    <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>Papel</Text>
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                        {['EMPLOYEE', 'MANAGER'].map((r) => (
                                            <Pressable
                                                key={r}
                                                onPress={() => setFormData({ ...formData, role: r as any })}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 16,
                                                    borderRadius: 8,
                                                    backgroundColor: formData.role === r ? '#FF6B35' : cardBgColor,
                                                    borderWidth: 1,
                                                    borderColor: formData.role === r ? '#FF6B35' : borderColor,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        textAlign: 'center',
                                                        fontWeight: '600',
                                                        color: formData.role === r ? '#FFFFFF' : textColor,
                                                    }}
                                                >
                                                    {getRoleName(r)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </>
                            )}

                            {/* Senha */}
                            <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>
                                Senha {editingUser ? '(deixe em branco para manter)' : '*'}
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: inputBgColor,
                                    borderWidth: 1,
                                    borderColor,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: textColor,
                                    marginBottom: editingUser && canManageAllRoles ? 16 : 24,
                                }}
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                placeholder={editingUser ? '' : '123456'}
                                placeholderTextColor="#8B92A9"
                                secureTextEntry
                            />

                            {/* Promoção/Rebaixamento - Apenas na edição para OWNER/SUPER_ADMIN */}
                            {editingUser && canManageAllRoles && (
                                <>
                                    <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>
                                        Papel (Promover/Rebaixar)
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                                        {['EMPLOYEE', 'MANAGER'].map((r) => (
                                            <Pressable
                                                key={r}
                                                onPress={() => {
                                                    setFormData({ ...formData, role: r as any });
                                                }}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 16,
                                                    borderRadius: 8,
                                                    backgroundColor: formData.role === r ? '#FF6B35' : cardBgColor,
                                                    borderWidth: 1,
                                                    borderColor: formData.role === r ? '#FF6B35' : borderColor,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        textAlign: 'center',
                                                        fontWeight: '600',
                                                        color: formData.role === r ? '#FFFFFF' : textColor,
                                                    }}
                                                >
                                                    {getRoleName(r)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </>
                            )}

                            {/* Botões de ação */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Pressable
                                    onPress={() => setModalVisible(false)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 14,
                                        borderRadius: 8,
                                        backgroundColor: cardBgColor,
                                        borderWidth: 1,
                                        borderColor,
                                    }}
                                >
                                    <Text style={{ textAlign: 'center', fontWeight: '600', color: textColor }}>
                                        Cancelar
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleSave}
                                    style={{ flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: '#FF6B35' }}
                                >
                                    <Text style={{ textAlign: 'center', fontWeight: '600', color: '#FFFFFF' }}>
                                        {editingUser ? 'Salvar' : 'Criar'}
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