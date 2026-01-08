import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SideMenu, TopBar } from '../../components/SideMenu';

export default function AppointmentCreate() {
    const router = useRouter();
    const [pet, setPet] = useState('');
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    const handleCreate = () => {
        // Aqui você pode adicionar lógica de criação
        router.back(); // Volta para a tela anterior após criar
    };

    return (
        <View style={styles.container}>
            <TopBar
                onMenuPress={() => setMenuVisible(true)}
                onBellPress={() => { }}
                onProfilePress={() => { }}
                searchValue={''}
                onSearchChange={() => { }}
            />
            <Text style={styles.title}>Novo Agendamento</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome do Pet"
                value={pet}
                onChangeText={setPet}
                placeholderTextColor="#A1A1AA"
            />
            <TextInput
                style={styles.input}
                placeholder="Serviço"
                value={service}
                onChangeText={setService}
                placeholderTextColor="#A1A1AA"
            />
            <TextInput
                style={styles.input}
                placeholder="Data"
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#A1A1AA"
            />
            <Pressable style={styles.button} onPress={handleCreate}>
                <Ionicons name="checkmark" size={24} color="#23243A" />
                <Text style={styles.buttonText}>Criar Agendamento</Text>
            </Pressable>
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={() => setMenuVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#23243A',
        padding: 24,
        // Removido justifyContent: 'center' para ocupar o viewport inteiro
    },
    title: {
        color: '#FFD600',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#2E3047',
        color: 'white',
        borderRadius: 16,
        padding: 16,
        fontSize: 18,
        marginBottom: 18,
    },
    button: {
        backgroundColor: '#FFD600',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 16,
    },
    buttonText: {
        color: '#23243A',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
