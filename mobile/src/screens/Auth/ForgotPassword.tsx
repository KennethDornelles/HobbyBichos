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
import { useTheme } from '../../context/ThemeContext';

const ForgotPasswordScreen: React.FC = () => {
    const { isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            // Simulação de chamada API
            console.log('Reset password attempt:', email);
            // Aqui você chamaria seu backend
            setTimeout(() => {
                setLoading(false);
                // Aqui você poderia navegar para uma tela de sucesso
                router.back();
            }, 800);
        } catch (error) {
            console.error('Reset password error:', error);
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
                        <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Password Recovery</Text>

                        {/* Texto descritivo */}
                        <Text style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            Digite seu e-mail para receber as instruções de recuperação de senha.
                        </Text>

                        {/* Formulário */}
                        <View style={styles.formContainer}>
                            <CustomInput
                                icon={Ionicons}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                isDark={isDark}
                                iconName="mail-outline"
                            />
                        </View>

                        {/* Seção de informações */}
                        <View style={styles.infoContainer}>
                            <View style={[
                                styles.infoBox,
                                {
                                    backgroundColor: isDark ? '#2E3047' : '#F3F4F6',
                                    borderColor: isDark ? '#3F4156' : '#E5E7EB',
                                }
                            ]}>
                                <View style={styles.infoIconCircle}>
                                    <Ionicons name="information" size={18} color="#111827" />
                                </View>
                                <Text style={[styles.infoText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                                    Instruções serão enviadas para o e-mail cadastrado
                                </Text>
                            </View>
                        </View>

                        {/* Botão Reset password */}
                        <TouchableOpacity
                            onPress={handleResetPassword}
                            disabled={loading}
                            activeOpacity={0.8}
                            style={styles.resetButton}
                        >
                            <LinearGradient
                                colors={['#FFD600', '#FFAE00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.resetButtonGradient}
                            >
                                <Text style={styles.resetButtonText}>
                                    {loading ? 'Enviando...' : 'Reset password'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Imagem do cachorro */}
                        <View style={styles.dogContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&h=400&q=80' }}
                                style={styles.dogImage}
                                resizeMode="contain"
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
        paddingTop: 60,
        paddingBottom: 40,
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
        marginBottom: 24,
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
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    formContainer: {
        gap: 16,
        marginBottom: 24,
    },
    infoContainer: {
        marginBottom: 32,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    infoIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFD600',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 20,
    },
    resetButton: {
        width: '100%',
        marginBottom: 40,
        borderRadius: 9999,
        overflow: 'hidden',
        shadowColor: '#FFD600',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    resetButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    dogContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 200,
        marginTop: 'auto',
    },
    dogImage: {
        width: 200,
        height: 200,
    },
});

export default ForgotPasswordScreen;
