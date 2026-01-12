import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../components/CustomInput';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import * as SecureStore from 'expo-secure-store';

const SignupScreen: React.FC = () => {
    const { isDark } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async () => {
        // Validação básica
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phone.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            console.log('📝 Criando conta com:', { name: formData.name, email: formData.email, phone: formData.phone });

            // 1. Criar usuário
            const signupRes = await api.post<{ user: { id: string; email: string } }>('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            });

            console.log('✅ Usuário criado:', signupRes.data.user.email);

            // 2. Fazer login automático
            const loginRes = await api.post<{ access_token: string }>('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            console.log('📦 Resposta do login:', JSON.stringify(loginRes.data, null, 2));

            const token = loginRes.data.access_token;
            console.log('🔑 Token recebido:', typeof token, token ? 'presente' : 'ausente');

            if (!token || typeof token !== 'string') {
                console.error('❌ Token inválido:', { token, type: typeof token, data: loginRes.data });
                throw new Error('Token inválido recebido do servidor');
            }

            console.log('✅ Login automático realizado');

            // 3. Salvar token
            await SecureStore.setItemAsync('authToken', token);
            console.log('✅ Token salvo em SecureStore');

            // 4. Navegar para home
            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            router.replace('/home');
        } catch (error: any) {
            console.error('❌ Erro ao criar conta:', {
                message: error.message,
                status: error?.response?.status,
                data: error?.response?.data,
            });

            // Mensagens de erro mais amigáveis
            let errorMsg = 'Erro ao criar conta. Tente novamente.';

            if (error?.response?.status === 409) {
                errorMsg = 'Este email já está em uso. Tente fazer login ou use outro email.';
            } else if (error?.response?.status === 400) {
                errorMsg = error?.response?.data?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
            } else if (error?.response?.status === 401) {
                errorMsg = 'Não foi possível fazer login após criar a conta. Tente fazer login manualmente.';
            } else if (!error?.response) {
                errorMsg = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (error?.response?.data?.message) {
                errorMsg = error.response.data.message;
            }

            Alert.alert('Erro', errorMsg);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={
                    isDark
                        ? ['#1A1B2E', '#2D2E3F', '#1A1B2E']
                        : ['#FAFAFA', '#FFFFFF', '#F5F5F5']
                }
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header com botão de voltar */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
                            </TouchableOpacity>
                        </View>

                        {/* Logo e Título */}
                        <View style={styles.logoContainer}>
                            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>Hobby</Text>
                            <Text style={[styles.subtitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Bichos</Text>
                        </View>

                        {/* Título da tela */}
                        <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Create Account</Text>

                        {/* Formulário */}
                        <View style={styles.formContainer}>
                            <CustomInput
                                icon={Ionicons}
                                placeholder="Nome completo"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                autoCapitalize="words"
                                isDark={isDark}
                                iconName="person-outline"
                            />
                            <CustomInput
                                icon={Ionicons}
                                placeholder="E-mail"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                isDark={isDark}
                                iconName="mail-outline"
                            />
                            <CustomInput
                                icon={Ionicons}
                                placeholder="Senha"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                                isDark={isDark}
                                iconName="lock-closed-outline"
                            />
                            <CustomInput
                                icon={Ionicons}
                                placeholder="Telefone"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                keyboardType="phone-pad"
                                isDark={isDark}
                                iconName="call-outline"
                            />
                        </View>

                        {/* Botão Sign up */}
                        <TouchableOpacity
                            onPress={handleSignup}
                            disabled={loading}
                            activeOpacity={0.8}
                            style={styles.signupButton}
                        >
                            <LinearGradient
                                colors={['#FFD600', '#FFAE00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.signupButtonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#111827" />
                                ) : (
                                    <Text style={styles.signupButtonText}>Sign up</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Imagem do cachorro */}
                        <View style={styles.dogContainer}>
                            {/* Formas amarelas curvas */}
                            <View style={styles.yellowShapeLeft} />
                            <View style={styles.yellowShapeRight} />
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80' }}
                                style={styles.dogImage}
                                resizeMode="cover"
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 36,
        fontWeight: '700',
    },
    screenTitle: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 40,
        textAlign: 'center',
    },
    formContainer: {
        gap: 16,
        marginBottom: 40,
    },
    signupButton: {
        width: '100%',
        marginBottom: 32,
        borderRadius: 9999,
        overflow: 'hidden',
        shadowColor: '#FFD600',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    signupButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    signupButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    dogContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 300,
        marginTop: 20,
        overflow: 'hidden',
    },
    yellowShapeLeft: {
        position: 'absolute',
        bottom: -50,
        left: -80,
        width: 200,
        height: 200,
        backgroundColor: '#FFD600',
        borderRadius: 200,
        opacity: 0.4,
    },
    yellowShapeRight: {
        position: 'absolute',
        bottom: -50,
        right: -80,
        width: 200,
        height: 200,
        backgroundColor: '#FFD600',
        borderRadius: 200,
        opacity: 0.4,
    },
    dogImage: {
        width: 320,
        height: 320,
        zIndex: 1,
    },
});

export default SignupScreen;
