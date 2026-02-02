import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { StandardButton } from '../../components/StandardButton';
import { Input } from '../../components/Input';
import TempLogo from '../../components/TempLogo';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleLogin = () => {
        setUser({ id: '1', name: 'Usuário', email: 'teste@demo.com', role: 'CLIENT' });
        router.replace('/');
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            style={{ backgroundColor: '#1A1B2E' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View className="flex-1 justify-center items-center px-2">
                <View
                    style={{
                        width: '100%',
                        maxWidth: 420,
                        minHeight: '80%',
                        borderRadius: 36,
                        paddingHorizontal: 24,
                        paddingVertical: 36,
                        alignItems: 'center',
                        backgroundColor: '#23243A',
                        shadowColor: '#000',
                        shadowOpacity: 0.18,
                        shadowRadius: 40,
                        elevation: 18,
                        justifyContent: 'center',
                    }}
                >
                    <TempLogo />
                    <Text style={{ fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 36, fontFamily: 'System', letterSpacing: 0.5, textAlign: 'center' }}>Hobby Bichos</Text>
                    <Input
                        icon={<Ionicons name="paw" size={28} color="#FFD600" />}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="mb-6"
                        style={{ fontSize: 20, height: 64, backgroundColor: '#2E3047', color: '#fff', borderRadius: 24, paddingLeft: 12 }}
                        placeholderTextColor="#E5E7EB"
                    />
                    <Input
                        icon={<Ionicons name="paw" size={28} color="#FFD600" />}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        className="mb-10"
                        style={{ fontSize: 20, height: 64, backgroundColor: '#2E3047', color: '#fff', borderRadius: 24, paddingLeft: 12 }}
                        placeholderTextColor="#E5E7EB"
                    />
                    <StandardButton
                        title="Login"
                        onPress={handleLogin}
                        icon={<Ionicons name="log-in-outline" size={26} color="#1A1B2E" />}
                        className="w-full mb-8"
                        style={{ height: 64, borderRadius: 32, backgroundColor: '#FFD600', justifyContent: 'center', alignItems: 'center' }}
                    />
                    <View className="flex-row w-full justify-center gap-4 mt-2">
                        <StandardButton
                            title="Google"
                            onPress={() => { }}
                            icon={<Ionicons name="logo-google" size={22} color="#1A1B2E" />}
                            variant="secondary"
                            className="flex-1"
                            style={{ height: 56, borderRadius: 28, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}
                        />
                        <StandardButton
                            title="Apple"
                            onPress={() => { }}
                            icon={<Ionicons name="logo-apple" size={22} color="#fff" />}
                            variant="secondary"
                            className="flex-1"
                            style={{ height: 56, borderRadius: 28, backgroundColor: '#23243A', borderWidth: 1, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' }}
                        />
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
