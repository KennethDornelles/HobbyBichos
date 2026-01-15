import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SideMenu } from '../../components/SideMenu';
import { HomeHeader } from '../../components/HomeHeader';
import { useCartStore } from '../../store/cartStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { serviceService, Service } from '../../services/serviceService';
import { storeService, Store } from '../../services/storeService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Pet {
    id: string;
    name: string;
    species: string;
    breed?: string;
}

interface Employee {
    id: string;
    name: string;
    role: string;
}

export default function AppointmentCreate() {
    const router = useRouter();
    const colors = useThemeColors();
    const { user } = useAuth();
    const [petName, setPetName] = useState('');
    const [petSpecies, setPetSpecies] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [storeModalVisible, setStoreModalVisible] = useState(false);
    const [serviceModalVisible, setServiceModalVisible] = useState(false);
    const [petModalVisible, setPetModalVisible] = useState(false);
    const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
    const [createPetModalVisible, setCreatePetModalVisible] = useState(false);
    const [stores, setStores] = useState<Store[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingPets, setLoadingPets] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const { totalItems } = useCartStore();

    useEffect(() => {
        loadStores();
        loadServices();
    }, []);

    const loadStores = async () => {
        try {
            setLoadingStores(true);
            const data = await storeService.getAll();
            setStores(data.filter(s => s.isActive));
        } catch (err) {
            console.error('Erro ao carregar lojas:', err);
        } finally {
            setLoadingStores(false);
        }
    };

    const loadServices = async () => {
        try {
            setLoadingServices(true);
            const data = await serviceService.getAll();
            setServices(data.filter(s => s.isActive));
        } catch (err) {
            console.error('Erro ao carregar serviços:', err);
        } finally {
            setLoadingServices(false);
        }
    };

    const loadPets = async () => {
        try {
            setLoadingPets(true);
            const response = await api.get('/pets/me');
            setPets(response.data);
        } catch (err) {
            console.error('Erro ao carregar pets:', err);
        } finally {
            setLoadingPets(false);
        }
    };

    const loadEmployees = async (storeId: string) => {
        try {
            setLoadingEmployees(true);
            const response = await api.get(`/users/store/${storeId}/employees`);
            setEmployees(response.data);
        } catch (err) {
            console.error('Erro ao carregar funcionários:', err);
            setEmployees([]); // Se falhar, deixa vazio
        } finally {
            setLoadingEmployees(false);
        }
    };

    useEffect(() => {
        if (selectedStore) {
            loadEmployees(selectedStore.id);
        }
    }, [selectedStore]);

    useEffect(() => {
        loadPets();
    }, []);

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (date) {
            if (showDatePicker) {
                // Usuário selecionou a data, agora mostrar o time picker
                const newDate = selectedDate || new Date();
                newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                setSelectedDate(newDate);

                if (Platform.OS === 'android') {
                    // No Android, abrir time picker após selecionar data
                    setTimeout(() => setShowTimePicker(true), 100);
                }
            } else if (showTimePicker) {
                // Usuário selecionou o horário
                const newDate = selectedDate || new Date();
                newDate.setHours(date.getHours(), date.getMinutes());
                setSelectedDate(newDate);
                setShowTimePicker(false);
            }
        }
    };

    const formatDateTime = (date: Date | null) => {
        if (!date) return '';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    };

    const [creating, setCreating] = useState(false);
    const [creatingPet, setCreatingPet] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreatePet = async () => {
        if (!petName.trim()) {
            setError('Por favor, informe o nome do pet');
            return;
        }
        if (!petSpecies.trim()) {
            setError('Por favor, informe a espécie do pet');
            return;
        }
        if (!selectedStore) {
            setError('Por favor, selecione uma loja primeiro');
            return;
        }

        try {
            setCreatingPet(true);
            setError(null);

            const response = await api.post('/pets', {
                name: petName,
                species: petSpecies,
                breed: petBreed || undefined,
                storeId: selectedStore.id,
            });

            setSelectedPet(response.data);
            setPets([...pets, response.data]);
            setCreatePetModalVisible(false);
            setPetName('');
            setPetSpecies('');
            setPetBreed('');
        } catch (err: any) {
            console.error('Erro ao criar pet:', err);
            setError(err?.response?.data?.message || 'Erro ao criar pet');
        } finally {
            setCreatingPet(false);
        }
    };

    const handleCreate = async () => {
        // Validações
        if (!selectedStore) {
            setError('Por favor, selecione uma loja');
            return;
        }
        if (!selectedPet) {
            setError('Por favor, selecione ou crie um pet');
            return;
        }
        if (!selectedService) {
            setError('Por favor, selecione um serviço');
            return;
        }
        if (!selectedEmployee) {
            setError('Por favor, selecione um profissional');
            return;
        }
        if (!selectedDate) {
            setError('Por favor, selecione a data e hora');
            return;
        }

        try {
            setCreating(true);
            setError(null);

            await appointmentService.create({
                petId: selectedPet.id,
                employeeId: selectedEmployee.id,
                serviceId: selectedService.id,
                startsAt: selectedDate.toISOString(),
            });

            // Após criar com sucesso, volta para a listagem
            // O useFocusEffect vai recarregar automaticamente
            router.back();
        } catch (err: any) {
            console.error('Erro ao criar agendamento:', err);
            setError(err?.response?.data?.message || 'Erro ao criar agendamento');
        } finally {
            setCreating(false);
        }
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bgMain }} edges={['top']}>
            <HomeHeader
                onMenuPress={() => setMenuVisible(true)}
                onCartPress={() => router.push('/carrinho')}
                cartItemsCount={totalItems()}
                hideCamera={true}
            />
            <View className="flex-1 p-6">
                <Text className="text-3xl font-bold mb-8 text-center" style={{ color: colors.accentYellow }}>Novo Agendamento</Text>

                {/* Seletor de Loja */}
                <Pressable
                    className="rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}
                    onPress={() => setStoreModalVisible(true)}
                >
                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="storefront" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                        <Text className="text-lg" style={{ color: selectedStore ? colors.textMain : colors.textSecondary }}>
                            {selectedStore ? selectedStore.name : 'Selecionar Loja'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
                </Pressable>

                {/* Seletor de Pet */}
                <View className="mb-4">
                    <Pressable
                        className="rounded-2xl p-4 mb-2 flex-row items-center justify-between"
                        style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}
                        onPress={() => setPetModalVisible(true)}
                    >
                        <View className="flex-1 flex-row items-center">
                            <Ionicons name="paw" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                            <Text className="text-lg" style={{ color: selectedPet ? colors.textMain : colors.textSecondary }}>
                                {selectedPet ? `${selectedPet.name} (${selectedPet.species})` : 'Selecionar Pet'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
                    </Pressable>

                    {/* Botão para criar novo pet */}
                    <Pressable
                        onPress={() => setCreatePetModalVisible(true)}
                        className="flex-row items-center justify-center"
                    >
                        <Ionicons name="add-circle-outline" size={18} color={colors.accentYellow} />
                        <Text className="ml-2 text-sm" style={{ color: colors.accentYellow }}>
                            Cadastrar novo pet
                        </Text>
                    </Pressable>
                </View>

                {/* Seletor de Serviço */}
                <Pressable
                    className="rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}
                    onPress={() => setServiceModalVisible(true)}
                >
                    <Text className="text-lg" style={{ color: selectedService ? colors.textMain : colors.textSecondary }}>
                        {selectedService ? selectedService.name : 'Selecionar Serviço'}
                    </Text>
                    <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
                </Pressable>

                {selectedService && (
                    <View className="rounded-2xl p-3 mb-4 flex-row items-center justify-between" style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.accentYellow }}>
                        <View>
                            <Text className="text-sm" style={{ color: colors.accentYellow }}>Valor do serviço</Text>
                            <Text className="text-xl font-bold" style={{ color: colors.textMain }}>R$ {Number(selectedService.price).toFixed(2)}</Text>
                        </View>
                        <View>
                            <Text className="text-sm" style={{ color: colors.accentYellow }}>Duração</Text>
                            <Text className="text-lg font-bold" style={{ color: colors.textMain }}>{selectedService.durationMin} min</Text>
                        </View>
                    </View>
                )}

                {/* Seletor de Profissional */}
                <Pressable
                    className="rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}
                    onPress={() => setEmployeeModalVisible(true)}
                    disabled={!selectedStore || employees.length === 0}
                >
                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="person" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                        <Text className="text-lg" style={{ color: selectedEmployee ? colors.textMain : colors.textSecondary }}>
                            {!selectedStore ? 'Selecione uma loja primeiro' :
                                employees.length === 0 ? 'Nenhum profissional disponível' :
                                    selectedEmployee ? selectedEmployee.name : 'Selecionar Profissional'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
                </Pressable>

                {/* Seletor de Data e Hora */}
                <Pressable
                    className="rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}
                    onPress={() => setShowDatePicker(true)}
                >
                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="calendar" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                        <Text className="text-lg" style={{ color: selectedDate ? colors.textMain : colors.textSecondary }}>
                            {selectedDate ? formatDateTime(selectedDate) : 'Selecionar Data e Hora'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
                </Pressable>

                {error && (
                    <View className="rounded-2xl p-3 mb-4 flex-row items-center" style={{ backgroundColor: colors.accentRed + '33' }}>
                        <Ionicons name="alert-circle" size={20} color={colors.accentRed} />
                        <Text className="ml-2 flex-1" style={{ color: colors.accentRed }}>{error}</Text>
                    </View>
                )}

                <Pressable
                    className={`rounded-3xl flex-row items-center justify-center py-4 mt-4 ${creating ? 'opacity-50' : ''
                        }`}
                    style={{ backgroundColor: colors.accentYellow }}
                    onPress={handleCreate}
                    disabled={creating}
                >
                    {creating ? (
                        <ActivityIndicator size="small" color={colors.bgMain} />
                    ) : (
                        <Ionicons name="checkmark" size={24} color={colors.bgMain} />
                    )}
                    <Text className="text-lg font-bold ml-2" style={{ color: colors.bgMain }}>
                        {creating ? 'Criando...' : 'Criar Agendamento'}
                    </Text>
                </Pressable>
            </View>

            {/* DateTimePicker para Data */}
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    locale="pt-BR"
                />
            )}

            {/* DateTimePicker para Hora */}
            {showTimePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    locale="pt-BR"
                    is24Hour={true}
                />
            )}

            {/* Modal de Seleção de Loja */}
            <Modal
                visible={storeModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setStoreModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="rounded-t-3xl max-h-[70%]" style={{ backgroundColor: colors.bgMain }}>
                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderColor: colors.borderColor }}>
                            <Text className="text-xl font-bold" style={{ color: colors.textMain }}>Selecionar Loja</Text>
                            <Pressable onPress={() => setStoreModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textMain} />
                            </Pressable>
                        </View>

                        {loadingStores ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={colors.accentYellow} />
                                <Text className="mt-4" style={{ color: colors.textSecondary }}>Carregando lojas...</Text>
                            </View>
                        ) : stores.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="storefront-outline" size={64} color={colors.textSecondary} />
                                <Text className="text-center mt-4 text-lg" style={{ color: colors.textMain }}>
                                    Nenhuma loja disponível
                                </Text>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {stores.map((store) => (
                                    <Pressable
                                        key={store.id}
                                        className="rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            backgroundColor: colors.bgCard,
                                            borderColor: selectedStore?.id === store.id ? colors.accentYellow : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedStore(store);
                                            setStoreModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-lg font-bold mb-1" style={{ color: colors.textMain }}>
                                                    {store.name}
                                                </Text>
                                                {store.phone && (
                                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                                        {store.phone}
                                                    </Text>
                                                )}
                                            </View>
                                            {selectedStore?.id === store.id && (
                                                <Ionicons name="checkmark-circle" size={24} color={colors.accentYellow} />
                                            )}
                                        </View>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Seleção de Serviço */}
            <Modal
                visible={serviceModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setServiceModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="rounded-t-3xl max-h-[70%]" style={{ backgroundColor: colors.bgMain }}>
                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderColor: colors.borderColor }}>
                            <Text className="text-xl font-bold" style={{ color: colors.textMain }}>Selecionar Serviço</Text>
                            <Pressable onPress={() => setServiceModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textMain} />
                            </Pressable>
                        </View>

                        {loadingServices ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={colors.accentYellow} />
                                <Text className="mt-4" style={{ color: colors.textSecondary }}>Carregando serviços...</Text>
                            </View>
                        ) : services.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="list-outline" size={64} color={colors.textSecondary} />
                                <Text className="text-center mt-4 text-lg" style={{ color: colors.textMain }}>
                                    Nenhum serviço disponível
                                </Text>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {services.map((service) => (
                                    <Pressable
                                        key={service.id}
                                        className="rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            backgroundColor: colors.bgCard,
                                            borderColor: selectedService?.id === service.id ? colors.accentYellow : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedService(service);
                                            setServiceModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-start justify-between mb-2">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-lg font-bold mb-1" style={{ color: colors.textMain }}>
                                                    {service.name}
                                                </Text>
                                                {service.store && (
                                                    <Text className="text-xs mb-1" style={{ color: colors.accentYellow }}>
                                                        {service.store.name}
                                                    </Text>
                                                )}
                                                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                                    Duração: {service.durationMin} minutos
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-xl font-bold" style={{ color: colors.accentYellow }}>
                                                    R$ {Number(service.price).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                        {selectedService?.id === service.id && (
                                            <View className="absolute top-4 right-4">
                                                <Ionicons name="checkmark-circle" size={24} color={colors.accentYellow} />
                                            </View>
                                        )}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Seleção de Pet */}
            <Modal
                visible={petModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPetModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="rounded-t-3xl max-h-[70%]" style={{ backgroundColor: colors.bgMain }}>
                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderColor: colors.borderColor }}>
                            <Text className="text-xl font-bold" style={{ color: colors.textMain }}>Selecionar Pet</Text>
                            <Pressable onPress={() => setPetModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textMain} />
                            </Pressable>
                        </View>

                        {loadingPets ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={colors.accentYellow} />
                                <Text className="mt-4" style={{ color: colors.textSecondary }}>Carregando pets...</Text>
                            </View>
                        ) : pets.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="paw-outline" size={64} color={colors.textSecondary} />
                                <Text className="text-center mt-4 text-lg" style={{ color: colors.textMain }}>
                                    Nenhum pet cadastrado
                                </Text>
                                <Pressable
                                    onPress={() => {
                                        setPetModalVisible(false);
                                        setCreatePetModalVisible(true);
                                    }}
                                    className="rounded-2xl px-6 py-3 mt-4"
                                    style={{ backgroundColor: colors.accentYellow }}
                                >
                                    <Text className="font-bold" style={{ color: colors.bgMain }}>Cadastrar Pet</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {pets.map((pet) => (
                                    <Pressable
                                        key={pet.id}
                                        className="rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            backgroundColor: colors.bgCard,
                                            borderColor: selectedPet?.id === pet.id ? colors.accentYellow : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedPet(pet);
                                            setPetModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-lg font-bold mb-1" style={{ color: colors.textMain }}>
                                                    {pet.name}
                                                </Text>
                                                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                                    {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
                                                </Text>
                                            </View>
                                            {selectedPet?.id === pet.id && (
                                                <Ionicons name="checkmark-circle" size={24} color={colors.accentYellow} />
                                            )}
                                        </View>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Criação de Pet */}
            <Modal
                visible={createPetModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCreatePetModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="rounded-t-3xl" style={{ backgroundColor: colors.bgMain }}>
                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderColor: colors.borderColor }}>
                            <Text className="text-xl font-bold" style={{ color: colors.textMain }}>Cadastrar Pet</Text>
                            <Pressable onPress={() => setCreatePetModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textMain} />
                            </Pressable>
                        </View>

                        <View className="p-5">
                            <TextInput
                                className="rounded-2xl p-4 text-lg mb-4"
                                style={{ backgroundColor: colors.bgCard, color: colors.textMain }}
                                placeholder="Nome do Pet"
                                value={petName}
                                onChangeText={setPetName}
                                placeholderTextColor={colors.textSecondary}
                            />

                            <TextInput
                                className="rounded-2xl p-4 text-lg mb-4"
                                style={{ backgroundColor: colors.bgCard, color: colors.textMain }}
                                placeholder="Espécie (ex: Cachorro, Gato)"
                                value={petSpecies}
                                onChangeText={setPetSpecies}
                                placeholderTextColor={colors.textSecondary}
                            />

                            <TextInput
                                className="rounded-2xl p-4 text-lg mb-4"
                                style={{ backgroundColor: colors.bgCard, color: colors.textMain }}
                                placeholder="Raça (opcional)"
                                value={petBreed}
                                onChangeText={setPetBreed}
                                placeholderTextColor={colors.textSecondary}
                            />

                            <Pressable
                                className={`rounded-2xl py-4 ${creatingPet ? 'opacity-50' : ''}`}
                                style={{ backgroundColor: colors.accentYellow }}
                                onPress={handleCreatePet}
                                disabled={creatingPet}
                            >
                                <Text className="text-center font-bold text-lg" style={{ color: colors.bgMain }}>
                                    {creatingPet ? 'Cadastrando...' : 'Cadastrar'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Seleção de Profissional */}
            <Modal
                visible={employeeModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEmployeeModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="rounded-t-3xl max-h-[70%]" style={{ backgroundColor: colors.bgMain }}>
                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderColor: colors.borderColor }}>
                            <Text className="text-xl font-bold" style={{ color: colors.textMain }}>Selecionar Profissional</Text>
                            <Pressable onPress={() => setEmployeeModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textMain} />
                            </Pressable>
                        </View>

                        {loadingEmployees ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={colors.accentYellow} />
                                <Text className="mt-4" style={{ color: colors.textSecondary }}>Carregando profissionais...</Text>
                            </View>
                        ) : employees.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="person-outline" size={64} color={colors.textSecondary} />
                                <Text className="text-center mt-4 text-lg" style={{ color: colors.textMain }}>
                                    Nenhum profissional disponível
                                </Text>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {employees.map((employee) => (
                                    <Pressable
                                        key={employee.id}
                                        className="rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            backgroundColor: colors.bgCard,
                                            borderColor: selectedEmployee?.id === employee.id ? colors.accentYellow : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedEmployee(employee);
                                            setEmployeeModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-lg font-bold mb-1" style={{ color: colors.textMain }}>
                                                    {employee.name}
                                                </Text>
                                                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                                    {employee.role}
                                                </Text>
                                            </View>
                                            {selectedEmployee?.id === employee.id && (
                                                <Ionicons name="checkmark-circle" size={24} color={colors.accentYellow} />
                                            )}
                                        </View>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={() => setMenuVisible(false)}
            />
        </SafeAreaView>
    );
}
