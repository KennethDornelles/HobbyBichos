import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../components/CustomInput';
import { LoginFormData } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LoginScreen: React.FC = () => {
    const { isDark } = useTheme();

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { login: authLogin } = useAuth();

    const handleLogin = async () => {
        // Validação básica
        if (!formData.email.trim() || !formData.password.trim()) {
            Alert.alert('Erro', 'Por favor, preencha email e senha');
            return;
        }

        setLoading(true);
        try {
            console.log('🔓 Tentando login com:', formData.email);

            const response = await api.post<{ access_token: string; refresh_token: string }>('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            const { access_token: token, refresh_token: refreshToken } = response.data;

            if (!token || typeof token !== 'string') {
                throw new Error('Token inválido recebido do servidor');
            }

            // Buscar dados do usuário autenticado
            const userResponse = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = userResponse.data;

            // Salvar usuário e token no AuthContext (e AsyncStorage)
            await authLogin(userData, token, refreshToken);
            console.log('✅ Login e sessão salvos:', userData.name, userData.role);

            // Navegar para home
            router.replace('/home');
        } catch (error: any) {
            console.error('❌ Erro ao fazer login:', {
                message: error.message,
                status: error?.response?.status,
                data: error?.response?.data,
            });

            // Mensagens de erro mais amigáveis
            let errorMsg = 'Email ou senha inválidos';

            if (error?.response?.status === 401) {
                errorMsg = 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
            } else if (error?.response?.status === 400) {
                errorMsg = 'Dados inválidos. Verifique o formato do email.';
            } else if (!error?.response) {
                errorMsg = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (error?.response?.data?.message) {
                errorMsg = error.response.data.message;
            }

            Alert.alert('Erro de Login', errorMsg);
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: 'google' | 'apple') => {
        console.log(`${provider} login`);
        Alert.alert('Em breve', `Login com ${provider} em desenvolvimento`);
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
                        {/* Logo e Título */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoEmoji}>🐕</Text>
                            </View>
                            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>Hobby</Text>
                            <Text style={[styles.subtitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Bichos</Text>
                        </View>
                        {/* Formulário */}
                        <View style={styles.formContainer}>
                            <CustomInput
                                icon={Ionicons}
                                placeholder="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <CustomInput
                                icon={Ionicons}
                                placeholder="Password"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                            />
                        </View>
                        {/* Link Esqueci Senha */}
                        <TouchableOpacity
                            style={styles.forgotButton}
                            activeOpacity={0.7}
                            onPress={() => {
                                try {
                                    router.push('forgot-password');
                                } catch (error) {
                                    console.error('Erro ao navegar:', error);
                                }
                            }}
                        >
                            <Text style={[styles.forgotText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Esqueceu a senha?</Text>
                        </TouchableOpacity>
                        {/* Botão Login */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                            style={styles.loginButton}
                        >
                            <LinearGradient
                                colors={['#FFD600', '#FFAE00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginButtonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#111827" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Login</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        {/* Botões Sociais */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                onPress={() => handleSocialLogin('google')}
                                activeOpacity={0.8}
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: isDark ? '#FFFFFF' : '#111827' },
                                ]}
                            >
                                <Text style={styles.socialIcon}>G</Text>
                                <Text style={[
                                    styles.socialButtonText,
                                    { color: isDark ? '#111827' : '#FFFFFF' },
                                ]}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSocialLogin('apple')}
                                activeOpacity={0.8}
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: isDark ? '#FFFFFF' : '#111827' },
                                ]}
                            >
                                <Text style={styles.socialIcon}>🍎</Text>
                                <Text style={[
                                    styles.socialButtonText,
                                    { color: isDark ? '#111827' : '#FFFFFF' },
                                ]}>Apple</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Link Criar Conta */}
                        <TouchableOpacity
                            style={styles.signupContainer}
                            activeOpacity={0.7}
                            onPress={() => {
                                try {
                                    router.push('signup');
                                } catch (error) {
                                    console.error('Erro ao navegar:', error);
                                }
                            }}
                        >
                            <Text style={[styles.signupText, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>Não tem conta?{' '}
                                <Text style={styles.signupBold}>Criar Conta</Text>
                            </Text>
                        </TouchableOpacity>
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
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    logoContainer: { alignItems: 'center', marginBottom: 48 },
    logoCircle: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFD600', justifyContent: 'center', alignItems: 'center', marginBottom: 24,
        shadowColor: '#FFD600', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
    },
    logoEmoji: { fontSize: 64 },
    title: { fontSize: 48, fontWeight: '700', marginBottom: 8 },
    subtitle: { fontSize: 40, fontWeight: '700' },
    formContainer: { gap: 16, marginBottom: 16 },
    forgotButton: { alignSelf: 'center', marginBottom: 32 },
    forgotText: { fontSize: 14, fontWeight: '500' },
    loginButton: {
        width: '100%', marginBottom: 24, borderRadius: 9999, overflow: 'hidden', shadowColor: '#FFD600', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    loginButtonGradient: { paddingVertical: 16, alignItems: 'center' },
    loginButtonText: { fontSize: 18, fontWeight: '700', color: '#111827' },
    socialContainer: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    socialButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 9999,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    socialIcon: { fontSize: 18 },
    socialButtonText: { fontSize: 16, fontWeight: '600' },
    signupContainer: { alignSelf: 'center' },
    signupText: { fontSize: 15, fontWeight: '500' },
    signupBold: { fontWeight: '700' },
});

export default LoginScreen;
