import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SideMenu } from '../../components/SideMenu';
import { HomeHeader } from '../../components/HomeHeader';
import { useCartStore } from '../../store/cartStore';
import { useTheme } from '../../context/ThemeContext';
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
    const { isDark } = useTheme();
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
        <SafeAreaView className="flex-1 bg-primary-dark dark:bg-gray-50" edges={['top']}>
            <HomeHeader
                onMenuPress={() => setMenuVisible(true)}
                onCameraPress={() => console.log('Camera pressed')}
                onCartPress={() => router.push('/carrinho')}
                cartItemsCount={totalItems()}
            />
            <View className="flex-1 p-6">
                <Text className="text-hobby-yellow dark:text-hobby-text-light text-3xl font-bold mb-8 text-center">Novo Agendamento</Text>

                {/* Seletor de Loja */}
                <Pressable
                    className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    onPress={() => setStoreModalVisible(true)}
                >
                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="storefront" size={20} color={isDark ? '#9CA3AF' : '#A1A1AA'} style={{ marginRight: 12 }} />
                        <Text className={selectedStore ? 'text-white dark:text-hobby-text-light text-lg' : 'text-[#A1A1AA] dark:text-[#9CA3AF] text-lg'}>
                            {selectedStore ? selectedStore.name : 'Selecionar Loja'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color={isDark ? '#9CA3AF' : '#A1A1AA'} />
                </Pressable>

                {/* Seletor de Pet */}
                <View className="mb-4">
                    <Pressable
                        className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-2xl p-4 mb-2 flex-row items-center justify-between"
                        onPress={() => setPetModalVisible(true)}
                    >
                        <View className="flex-1 flex-row items-center">
                            <Ionicons name="paw" size={20} color={isDark ? '#9CA3AF' : '#A1A1AA'} style={{ marginRight: 12 }} />
                            <Text className={selectedPet ? 'text-white dark:text-hobby-text-light text-lg' : 'text-[#A1A1AA] dark:text-[#9CA3AF] text-lg'}>
                                {selectedPet ? `${selectedPet.name} (${selectedPet.species})` : 'Selecionar Pet'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={24} color={isDark ? '#9CA3AF' : '#A1A1AA'} />
                    </Pressable>

                    {/* Botão para criar novo pet */}
                    <Pressable
                        onPress={() => setCreatePetModalVisible(true)}
                        className="flex-row items-center justify-center"
                    >
                        <Ionicons name="add-circle-outline" size={18} color={isDark ? '#D97706' : '#FFD600'} />
                        <Text className="text-hobby-yellow dark:text-hobby-accent-light ml-2 text-sm">
                            Cadastrar novo pet
                        </Text>
                    </Pressable>
                </View>

                {/* Seletor de Serviço */}
                <Pressable
                    className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    onPress={() => setServiceModalVisible(true)}
                >
                    <Text className={selectedService ? 'text-white dark:text-hobby-text-light text-lg' : 'text-[#A1A1AA] dark:text-[#9CA3AF] text-lg'}>
                        {selectedService ? selectedService.name : 'Selecionar Serviço'}
                    </Text>
                    <Ionicons name="chevron-down" size={24} color={isDark ? '#9CA3AF' : '#A1A1AA'} />
                </Pressable>

                {selectedService && (
                    <View className="bg-hobby-yellow/20 rounded-2xl p-3 mb-4 flex-row items-center justify-between">
                        <View>
                            <Text className="text-hobby-yellow dark:text-hobby-accent-light text-sm">Valor do serviço</Text>
                            <Text className="text-white dark:text-hobby-text-light text-xl font-bold">R$ {Number(selectedService.price).toFixed(2)}</Text>
                        </View>
                        <View>
                            <Text className="text-hobby-yellow dark:text-hobby-accent-light text-sm">Duração</Text>
                            <Text className="text-white dark:text-hobby-text-light text-lg font-bold">{selectedService.durationMin} min</Text>
                        </View>
                    </View>
                )}

                {/* Seletor de Profissional */}
                <Pressable
                    className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    onPress={() => setEmployeeModalVisible(true)}
                    disabled={!selectedStore || employees.length === 0}
                >
                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="person" size={20} color={isDark ? '#9CA3AF' : '#A1A1AA'} style={{ marginRight: 12 }} />
                        <Text className={selectedEmployee ? 'text-white dark:text-hobby-text-light text-lg' : 'text-[#A1A1AA] dark:text-[#9CA3AF] text-lg'}>
                            {!selectedStore ? 'Selecione uma loja primeiro' :
                                employees.length === 0 ? 'Nenhum profissional disponível' :
                                    selectedEmployee ? selectedEmployee.name : 'Selecionar Profissional'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color={isDark ? '#9CA3AF' : '#A1A1AA'} />
                </Pressable>

                {/* Seletor de Data e Hora */}
                <Pressable
                    className="bg-[#2E3047] dark:bg-white dark:border dark:border-hobby-border-light rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                    onPress={() => setShowDatePicker(true)}
                >
                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="calendar" size={20} color={isDark ? '#9CA3AF' : '#A1A1AA'} style={{ marginRight: 12 }} />
                        <Text className={selectedDate ? 'text-white dark:text-hobby-text-light text-lg' : 'text-[#A1A1AA] dark:text-[#9CA3AF] text-lg'}>
                            {selectedDate ? formatDateTime(selectedDate) : 'Selecionar Data e Hora'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color={isDark ? '#9CA3AF' : '#A1A1AA'} />
                </Pressable>

                {error && (
                    <View className="bg-red-500/20 rounded-2xl p-3 mb-4 flex-row items-center">
                        <Ionicons name="alert-circle" size={20} color="#EF4444" />
                        <Text className="text-red-500 ml-2 flex-1">{error}</Text>
                    </View>
                )}

                <Pressable
                    className={`bg-hobby-yellow rounded-3xl flex-row items-center justify-center py-4 mt-4 ${creating ? 'opacity-50' : ''
                        }`}
                    onPress={handleCreate}
                    disabled={creating}
                >
                    {creating ? (
                        <ActivityIndicator size="small" color="#23243A" />
                    ) : (
                        <Ionicons name="checkmark" size={24} color="#23243A" />
                    )}
                    <Text className="text-primary-dark text-lg font-bold ml-2">
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
                    <View className="bg-primary-dark dark:bg-white rounded-t-3xl max-h-[70%]">
                        <View className="flex-row items-center justify-between p-5 border-b border-[#2E3047] dark:border-hobby-border-light">
                            <Text className="text-white dark:text-hobby-text-light text-xl font-bold">Selecionar Loja</Text>
                            <Pressable onPress={() => setStoreModalVisible(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#1F2937' : '#FFFFFF'} />
                            </Pressable>
                        </View>

                        {loadingStores ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={isDark ? '#D97706' : '#FFD600'} />
                                <Text className="text-white dark:text-hobby-text-secondary mt-4">Carregando lojas...</Text>
                            </View>
                        ) : stores.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="storefront-outline" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                <Text className="text-white dark:text-hobby-text-light text-center mt-4 text-lg">
                                    Nenhuma loja disponível
                                </Text>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {stores.map((store) => (
                                    <Pressable
                                        key={store.id}
                                        className="bg-[#2E3047] dark:bg-gray-50 rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            borderColor: selectedStore?.id === store.id
                                                ? (isDark ? '#D97706' : '#FFD600')
                                                : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedStore(store);
                                            setStoreModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-white dark:text-hobby-text-light text-lg font-bold mb-1">
                                                    {store.name}
                                                </Text>
                                                {store.phone && (
                                                    <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-sm">
                                                        {store.phone}
                                                    </Text>
                                                )}
                                            </View>
                                            {selectedStore?.id === store.id && (
                                                <Ionicons name="checkmark-circle" size={24} color={isDark ? '#D97706' : '#FFD600'} />
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
                    <View className="bg-primary-dark dark:bg-white rounded-t-3xl max-h-[70%]">
                        <View className="flex-row items-center justify-between p-5 border-b border-[#2E3047] dark:border-hobby-border-light">
                            <Text className="text-white dark:text-hobby-text-light text-xl font-bold">Selecionar Serviço</Text>
                            <Pressable onPress={() => setServiceModalVisible(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#1F2937' : '#FFFFFF'} />
                            </Pressable>
                        </View>

                        {loadingServices ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={isDark ? '#D97706' : '#FFD600'} />
                                <Text className="text-white dark:text-hobby-text-secondary mt-4">Carregando serviços...</Text>
                            </View>
                        ) : services.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="list-outline" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                <Text className="text-white dark:text-hobby-text-light text-center mt-4 text-lg">
                                    Nenhum serviço disponível
                                </Text>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {services.map((service) => (
                                    <Pressable
                                        key={service.id}
                                        className="bg-[#2E3047] dark:bg-gray-50 rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            borderColor: selectedService?.id === service.id
                                                ? (isDark ? '#D97706' : '#FFD600')
                                                : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedService(service);
                                            setServiceModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-start justify-between mb-2">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-white dark:text-hobby-text-light text-lg font-bold mb-1">
                                                    {service.name}
                                                </Text>
                                                {service.store && (
                                                    <Text className="text-hobby-yellow dark:text-hobby-accent-light text-xs mb-1">
                                                        {service.store.name}
                                                    </Text>
                                                )}
                                                <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-sm">
                                                    Duração: {service.durationMin} minutos
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-hobby-yellow dark:text-hobby-accent-light text-xl font-bold">
                                                    R$ {Number(service.price).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                        {selectedService?.id === service.id && (
                                            <View className="absolute top-4 right-4">
                                                <Ionicons name="checkmark-circle" size={24} color={isDark ? '#D97706' : '#FFD600'} />
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
                    <View className="bg-primary-dark dark:bg-white rounded-t-3xl max-h-[70%]">
                        <View className="flex-row items-center justify-between p-5 border-b border-[#2E3047] dark:border-hobby-border-light">
                            <Text className="text-white dark:text-hobby-text-light text-xl font-bold">Selecionar Pet</Text>
                            <Pressable onPress={() => setPetModalVisible(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#1F2937' : '#FFFFFF'} />
                            </Pressable>
                        </View>

                        {loadingPets ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={isDark ? '#D97706' : '#FFD600'} />
                                <Text className="text-white dark:text-hobby-text-secondary mt-4">Carregando pets...</Text>
                            </View>
                        ) : pets.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="paw-outline" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                <Text className="text-white dark:text-hobby-text-light text-center mt-4 text-lg">
                                    Nenhum pet cadastrado
                                </Text>
                                <Pressable
                                    onPress={() => {
                                        setPetModalVisible(false);
                                        setCreatePetModalVisible(true);
                                    }}
                                    className="bg-hobby-yellow rounded-2xl px-6 py-3 mt-4"
                                >
                                    <Text className="text-primary-dark font-bold">Cadastrar Pet</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {pets.map((pet) => (
                                    <Pressable
                                        key={pet.id}
                                        className="bg-[#2E3047] dark:bg-gray-50 rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            borderColor: selectedPet?.id === pet.id
                                                ? (isDark ? '#D97706' : '#FFD600')
                                                : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedPet(pet);
                                            setPetModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-white dark:text-hobby-text-light text-lg font-bold mb-1">
                                                    {pet.name}
                                                </Text>
                                                <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-sm">
                                                    {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
                                                </Text>
                                            </View>
                                            {selectedPet?.id === pet.id && (
                                                <Ionicons name="checkmark-circle" size={24} color={isDark ? '#D97706' : '#FFD600'} />
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
                    <View className="bg-primary-dark dark:bg-white rounded-t-3xl">
                        <View className="flex-row items-center justify-between p-5 border-b border-[#2E3047] dark:border-hobby-border-light">
                            <Text className="text-white dark:text-hobby-text-light text-xl font-bold">Cadastrar Pet</Text>
                            <Pressable onPress={() => setCreatePetModalVisible(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#1F2937' : '#FFFFFF'} />
                            </Pressable>
                        </View>

                        <View className="p-5">
                            <TextInput
                                className="bg-[#2E3047] dark:bg-gray-50 text-white dark:text-hobby-text-light rounded-2xl p-4 text-lg mb-4"
                                placeholder="Nome do Pet"
                                value={petName}
                                onChangeText={setPetName}
                                placeholderTextColor={isDark ? '#9CA3AF' : '#A1A1AA'}
                            />

                            <TextInput
                                className="bg-[#2E3047] dark:bg-gray-50 text-white dark:text-hobby-text-light rounded-2xl p-4 text-lg mb-4"
                                placeholder="Espécie (ex: Cachorro, Gato)"
                                value={petSpecies}
                                onChangeText={setPetSpecies}
                                placeholderTextColor={isDark ? '#9CA3AF' : '#A1A1AA'}
                            />

                            <TextInput
                                className="bg-[#2E3047] dark:bg-gray-50 text-white dark:text-hobby-text-light rounded-2xl p-4 text-lg mb-4"
                                placeholder="Raça (opcional)"
                                value={petBreed}
                                onChangeText={setPetBreed}
                                placeholderTextColor={isDark ? '#9CA3AF' : '#A1A1AA'}
                            />

                            <Pressable
                                className={`bg-hobby-yellow rounded-2xl py-4 ${creatingPet ? 'opacity-50' : ''}`}
                                onPress={handleCreatePet}
                                disabled={creatingPet}
                            >
                                <Text className="text-primary-dark text-center font-bold text-lg">
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
                    <View className="bg-primary-dark dark:bg-white rounded-t-3xl max-h-[70%]">
                        <View className="flex-row items-center justify-between p-5 border-b border-[#2E3047] dark:border-hobby-border-light">
                            <Text className="text-white dark:text-hobby-text-light text-xl font-bold">Selecionar Profissional</Text>
                            <Pressable onPress={() => setEmployeeModalVisible(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#1F2937' : '#FFFFFF'} />
                            </Pressable>
                        </View>

                        {loadingEmployees ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color={isDark ? '#D97706' : '#FFD600'} />
                                <Text className="text-white dark:text-hobby-text-secondary mt-4">Carregando profissionais...</Text>
                            </View>
                        ) : employees.length === 0 ? (
                            <View className="items-center justify-center py-12 px-6">
                                <Ionicons name="person-outline" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                <Text className="text-white dark:text-hobby-text-light text-center mt-4 text-lg">
                                    Nenhum profissional disponível
                                </Text>
                            </View>
                        ) : (
                            <ScrollView className="p-5">
                                {employees.map((employee) => (
                                    <Pressable
                                        key={employee.id}
                                        className="bg-[#2E3047] dark:bg-gray-50 rounded-2xl p-4 mb-3 border-2"
                                        style={{
                                            borderColor: selectedEmployee?.id === employee.id
                                                ? (isDark ? '#D97706' : '#FFD600')
                                                : 'transparent'
                                        }}
                                        onPress={() => {
                                            setSelectedEmployee(employee);
                                            setEmployeeModalVisible(false);
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-white dark:text-hobby-text-light text-lg font-bold mb-1">
                                                    {employee.name}
                                                </Text>
                                                <Text className="text-[#A1A1AA] dark:text-hobby-text-secondary text-sm">
                                                    {employee.role}
                                                </Text>
                                            </View>
                                            {selectedEmployee?.id === employee.id && (
                                                <Ionicons name="checkmark-circle" size={24} color={isDark ? '#D97706' : '#FFD600'} />
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
