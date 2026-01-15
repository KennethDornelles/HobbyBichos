import React from 'react';
import { useUserStore } from '../src/store/userStore';
import ClientHomeScreen from '../src/screens/Home/HomeScreen';
import EmployeeHomeScreen from '../src/screens/Home/EmployeeHomeScreen';

export default function Home() {
    const { role } = useUserStore();

    // Renderizar a home apropriada baseado na role
    if (role === 'EMPLOYEE') {
        return <EmployeeHomeScreen />;
    }

    // Padrão: ClientHomeScreen para role CLIENT ou outros
    return <ClientHomeScreen />;
}

