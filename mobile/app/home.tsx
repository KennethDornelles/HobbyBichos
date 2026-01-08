import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { ServiceCard } from '../src/components/ServiceCard';
import { AppointmentWidget } from '../src/components/AppointmentWidget';
import { StandardButton } from '../src/components/StandardButton';
import { ReviewStars } from '../src/components/ReviewStars';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const [selectedDay, setSelectedDay] = useState('22');
    const [selectedHour, setSelectedHour] = useState('14:00');
    const [rating, setRating] = useState(4);

    const days = [
        { date: '21', available: true },
        { date: '22', available: true, selected: true },
        { date: '23', available: false },
        { date: '24', available: true },
    ];
    const hours = [
        { time: '13:00', available: true },
        { time: '14:00', available: true, selected: true },
        { time: '15:00', available: false },
        { time: '16:00', available: true },
    ];

    return (
        <ScrollView className="flex-1 bg-background-light dark:bg-background-dark p-4">
            {/* Glassmorphism NavBar */}
            <View className="flex-row items-center justify-between mb-6 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(26,27,46,0.6)', backdropFilter: 'blur(8px)' }}>
                <Text className="text-xl font-bold text-background-light">Hobby Bichos</Text>
                <Ionicons name="person-circle" size={36} color="#FFD600" />
            </View>

            <ServiceCard
                imageUrl="https://images.unsplash.com/photo-1518717758536-85ae29035b6d"
                title="Banho & Tosa"
                description="Deixe seu pet limpo e cheiroso."
                price={49.9}
                className="mb-4"
            />

            <AppointmentWidget
                days={days.map((d) => ({ ...d, selected: d.date === selectedDay }))}
                hours={hours.map((h) => ({ ...h, selected: h.time === selectedHour }))}
                onSelectDay={setSelectedDay}
                onSelectHour={setSelectedHour}
                className="mb-4"
            />

            <StandardButton
                title="Agendar Serviço"
                onPress={() => { }}
                icon={<Ionicons name="calendar" size={20} color="#1A1B2E" />}
                className="mb-4"
            />

            <View className="flex-row items-center mb-4">
                <Text className="text-base font-semibold text-background-dark dark:text-background-light mr-2">Avaliação:</Text>
                <ReviewStars rating={rating} onRate={setRating} />
            </View>
        </ScrollView>
    );
}
