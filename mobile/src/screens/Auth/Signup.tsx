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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../components/CustomInput';
// Removido SignupFormData para definir localmente os campos necessários
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';

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
        setLoading(true);
        try {
            // Simulação de chamada API
            console.log('Signup attempt:', formData);
            // Aqui você chamaria seu backend
            setTimeout(() => {
                setLoading(false);
                router.push('home');
            }, 800);
        } catch (error) {
            console.error('Signup error:', error);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ThemeToggle />
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
                                <Text style={styles.signupButtonText}>
                                    {loading ? 'Criando...' : 'Sign up'}
                                </Text>
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
