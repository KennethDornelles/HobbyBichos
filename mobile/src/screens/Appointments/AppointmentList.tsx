import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, SideMenu } from '../../components/SideMenu';

const appointments = [
    {
        id: 1,
        name: 'Hobby Bichos',
        pet: 'Peicic 31 S',
        description: 'Petdado o Appoitetcdios',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80',
    },
    {
        id: 2,
        name: 'Pobby Bichos',
        pet: 'Forfoosto eeditlaca',
        description: 'Petacao o Aectonamency',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80',
    },
    {
        id: 3,
        name: 'Pobby Bichos',
        pet: 'Eoirgiaca 2rbe',
        description: 'Pernarto Eposieci',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80',
    },
    {
        id: 4,
        name: 'Fobby Abichos',
        pet: 'Est. Us ter 21 pe',
        description: 'Parddoa o Aeganramnttoo',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80',
    },
    {
        id: 5,
        name: 'Podo Appointentos',
        pet: 'Fecfnece Joaa',
        description: 'Pomeao o Aggaliooamee',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80',
    },
];

export default function AppointmentList() {
    const [menuVisible, setMenuVisible] = useState(false);
    const [search, setSearch] = useState('');
    const insets = useSafeAreaInsets();

    // Filtra agendamentos pelo nome do pet ou serviço
    const filteredAppointments = appointments.filter(
        item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.pet.toLowerCase().includes(search.toLowerCase())
    );

    // ...existing code...
    const { useRouter } = require('expo-router');
    const router = useRouter();
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#23243A' }} edges={["top", "left", "right"]}>
            <TopBar
                onMenuPress={() => setMenuVisible(true)}
                onBellPress={() => { }}
                onProfilePress={() => { }}
                searchValue={search}
                onSearchChange={setSearch}
            />
            <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', flex: 1 }}>Tela de Agendamentos</Text>
                    <Ionicons name="person-circle" size={36} color="#FFD600" />
                </View>
                <Text style={{ color: '#A1A1AA', marginBottom: 12 }}>Aent e docaíímente Aliva</Text>
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {filteredAppointments.map((item) => (
                        <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E3047', borderRadius: 24, padding: 12, marginBottom: 12 }}>
                            <Image source={{ uri: item.image }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
                                <Text style={{ color: '#FFD600', fontSize: 14 }}>{item.pet}</Text>
                                <Text style={{ color: '#A1A1AA', fontSize: 13 }}>{item.description}</Text>
                            </View>
                            <Pressable style={{ backgroundColor: '#23243A', borderRadius: 16, padding: 8, marginLeft: 8 }}>
                                <Ionicons name="checkmark" size={20} color="#A1A1AA" />
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
                {/* FAB */}
                <Pressable
                    onPress={() => router.push('/appointments/create')}
                    style={{
                        position: 'absolute',
                        right: 24,
                        bottom: insets.bottom + 24,
                        backgroundColor: '#FFD600',
                        borderRadius: 32,
                        width: 64,
                        height: 64,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#FFD600',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <Ionicons name="add" size={36} color="#23243A" />
                </Pressable>
            </View>
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={() => setMenuVisible(false)}
            />
        </SafeAreaView>
    );
}
