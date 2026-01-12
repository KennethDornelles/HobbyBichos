import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { User, Mail, Phone, MapPin, Camera, ArrowLeft } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Card, CardInput } from '../../src/components/ui/Card';

export default function EditProfile() {
    const auth = useAuth() as any;
    const user = auth?.user;
    const setUser = auth?.setUser;
    const { isDark } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Carregar dados do usuário quando montado
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Validação', 'Nome e email são obrigatórios');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Validação', 'Email inválido');
            return;
        }

        setIsLoading(true);
        try {
            // Atualizar o usuário localmente
            const updatedUser = {
                ...user,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
            };

            if (setUser) {
                setUser(updatedUser);
            }

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao atualizar perfil. Tente novamente.');
            console.error('Erro ao salvar perfil:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    const bgColors: [string, string, ...string[]] = isDark
        ? ['#FFD600', '#10142D']
        : ['#FFD600', '#FFFFFF'];
    const containerBg = isDark ? '#1C213E' : '#F4F4F6';
    const inputBg = isDark ? '#2A2F4F' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#10142D';
    const placeholderColor = isDark ? '#9CA3AF' : '#6B7280';

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-1 bg-hobby-dark dark:bg-hobby-ice-dark">
                {/* Header com gradiente */}
                <LinearGradient
                    colors={['#FFD600', '#10142D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    className="h-48 relative"
                >
                    <View className="flex-row items-center justify-between px-4 pt-12">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center rounded-full bg-black/10"
                        >
                            <ArrowLeft color="#10142D" size={24} />
                        </TouchableOpacity>
                        <Text className="text-hobby-dark text-xl font-bold">Meu Perfil</Text>
                        <View className="w-10" />
                    </View>
                </LinearGradient>

                {/* Avatar */}
                <View className="absolute top-32 self-center z-10">
                    <View className="w-30 h-30 rounded-full border-4 border-hobby-yellow bg-gray-600 items-center justify-center shadow-xl">
                        {user?.avatarUrl ? (
                            <Text className="text-3xl">{user.name?.charAt(0).toUpperCase()}</Text>
                        ) : (
                            <User color="#FFD600" size={48} />
                        )}
                    </View>
                    <TouchableOpacity className="absolute bottom-0 right-0 bg-hobby-yellow rounded-full p-2 shadow-lg">
                        <Camera color="#10142D" size={16} />
                    </TouchableOpacity>
                </View>

                {/* Formulário */}
                <ScrollView
                    className="flex-1 px-4 pt-20"
                    showsVerticalScrollIndicator={false}
                >
                    <Card variant="elevated" className="mb-24">
                        {/* Campo Nome */}
                        <View className="mb-4">
                            <Text className="text-gray-400 dark:text-hobby-text-secondary text-xs mb-2 ml-1">
                                Nome Completo
                            </Text>
                            <CardInput className="flex-row items-center">
                                <User color="#9CA3AF" size={20} />
                                <TextInput
                                    className="flex-1 ml-3 text-white dark:text-hobby-text-light"
                                    placeholder="Digite seu nome"
                                    placeholderTextColor="#9CA3AF"
                                    value={name}
                                    onChangeText={setName}
                                    editable={!isLoading}
                                />
                            </CardInput>
                        </View>

                        {/* Campo Email */}
                        <View className="mb-4">
                            <Text className="text-gray-400 dark:text-hobby-text-secondary text-xs mb-2 ml-1">
                                Email
                            </Text>
                            <CardInput className="flex-row items-center">
                                <Mail color="#9CA3AF" size={20} />
                                <TextInput
                                    className="flex-1 ml-3 text-white dark:text-hobby-text-light"
                                    placeholder="seu@email.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isLoading}
                                />
                            </CardInput>
                        </View>

                        {/* Campo Telefone */}
                        <View className="mb-4">
                            <Text className="text-gray-400 dark:text-hobby-text-secondary text-xs mb-2 ml-1">
                                Telefone
                            </Text>
                            <CardInput className="flex-row items-center">
                                <Phone color="#9CA3AF" size={20} />
                                <TextInput
                                    className="flex-1 ml-3 text-white dark:text-hobby-text-light"
                                    placeholder="(00) 00000-0000"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                    editable={!isLoading}
                                />
                            </CardInput>
                        </View>

                        {/* Campo Endereço */}
                        <View>
                            <Text className="text-gray-400 dark:text-hobby-text-secondary text-xs mb-2 ml-1">
                                Endereço
                            </Text>
                            <CardInput className="flex-row items-center">
                                <MapPin color="#9CA3AF" size={20} />
                                <TextInput
                                    className="flex-1 ml-3 text-white dark:text-hobby-text-light"
                                    placeholder="Rua, número, bairro"
                                    placeholderTextColor="#9CA3AF"
                                    value={address}
                                    onChangeText={setAddress}
                                    editable={!isLoading}
                                />
                            </CardInput>
                        </View>
                    </Card>
                </ScrollView>

                {/* Botão Salvar com transição suave */}
                <View className="absolute bottom-8 self-center w-[90%]">
                    <TouchableOpacity
                        className="bg-hobby-yellow dark:bg-hobby-yellow-soft rounded-full py-4 items-center shadow-lg"
                        onPress={handleSave}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#10142D" size="small" />
                        ) : (
                            <Text className="text-hobby-dark font-bold text-lg">Salvar alterações</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}
