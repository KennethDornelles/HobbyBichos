import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { addressService, Address } from '../../services/addressService';

export default function AddressFormScreen() {
    const { isDark } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    // Theme Colors
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const inputBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const labelColor = '#8B92A9';

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        isDefault: false
    });

    useEffect(() => {
        if (isEditing) {
            loadAddress();
        }
    }, [id]);

    const loadAddress = async () => {
        setLoading(true);
        try {
            // Find in local list for simplicity or fetch single if needed
            // Here assuming we fetch from API or pass via state, but API is safer
            const addresses = await addressService.getAddresses();
            const addr = addresses.find(a => a.id === id);
            if (addr) {
                setFormData({
                    title: addr.title,
                    zipCode: addr.zipCode,
                    street: addr.street,
                    number: addr.number,
                    complement: addr.complement || '',
                    district: addr.district,
                    city: addr.city,
                    state: addr.state,
                    isDefault: addr.isDefault
                });
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar endereço');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.street || !formData.number || !formData.city || !formData.state || !formData.zipCode) {
            Alert.alert('Erro', 'Preencha os campos obrigatórios');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditing) {
                await addressService.updateAddress(id as string, formData);
                Alert.alert('Sucesso', 'Endereço atualizado!');
            } else {
                await addressService.createAddress(formData);
                Alert.alert('Sucesso', 'Endereço criado!');
            }
            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o endereço.');
        } finally {
            setSubmitting(false);
        }
    };

    // Simplified CEP fetch (Mock or real implementation could go here)
    const handleBlurZip = async () => {
        if (formData.zipCode.length >= 8) {
            // Optional: Integrate viaCEP or similar
        }
    };

    if (loading) {
        return <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center' }}><ActivityIndicator size="large" color="#FF6B35" /></View>;
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: bgColor }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginBottom: 20 }}>
                {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
            </Text>

            <Input label="Título (ex: Casa, Trabalho)" value={formData.title} onChangeText={t => setFormData({ ...formData, title: t })} placeholder="Casa" />
            <Input label="CEP" value={formData.zipCode} onChangeText={t => setFormData({ ...formData, zipCode: t })} keyboardType="numeric" onBlur={handleBlurZip} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 3 }}>
                    <Input label="Rua" value={formData.street} onChangeText={t => setFormData({ ...formData, street: t })} />
                </View>
                <View style={{ flex: 1 }}>
                    <Input label="Número" value={formData.number} onChangeText={t => setFormData({ ...formData, number: t })} keyboardType="numeric" />
                </View>
            </View>

            <Input label="Complemento" value={formData.complement} onChangeText={t => setFormData({ ...formData, complement: t })} />
            <Input label="Bairro" value={formData.district} onChangeText={t => setFormData({ ...formData, district: t })} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 3 }}>
                    <Input label="Cidade" value={formData.city} onChangeText={t => setFormData({ ...formData, city: t })} />
                </View>
                <View style={{ flex: 1 }}>
                    <Input label="UF" value={formData.state} onChangeText={t => setFormData({ ...formData, state: t })} maxLength={2} autoCapitalize="characters" />
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 }}>
                <Text style={{ color: textColor, fontSize: 16 }}>Definir como padrão</Text>
                <Switch
                    value={formData.isDefault}
                    onValueChange={v => setFormData({ ...formData, isDefault: v })}
                    trackColor={{ false: '#767577', true: '#FF6B35' }}
                />
            </View>

            <Pressable
                onPress={handleSave}
                disabled={submitting}
                style={{
                    backgroundColor: submitting ? '#ccc' : '#FF6B35',
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 10
                }}
            >
                {submitting ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Salvar Endereço</Text>
                )}
            </Pressable>
        </ScrollView>
    );
}

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    onBlur?: () => void;
    maxLength?: number;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const Input = ({ label, value, onChangeText, placeholder, keyboardType, onBlur, maxLength, autoCapitalize }: InputProps) => {
    const { isDark } = useTheme();
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#8B92A9', marginBottom: 6, fontSize: 14 }}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#6B7280"
                keyboardType={keyboardType}
                onBlur={onBlur}
                maxLength={maxLength}
                autoCapitalize={autoCapitalize}
                style={{
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderRadius: 8,
                    padding: 12,
                    color: textColor,
                    fontSize: 16
                }}
            />
        </View>
    );
};
