import React from 'react';
import { useUserStore } from "@/store/userStore";
import ClientHomeScreen from "@/screens/Home/HomeScreen";
import EmployeeHomeScreen from "@/screens/Home/EmployeeHomeScreen";
import ManagerHomeScreen from './manager/index';

export default function Home() {
    const { role } = useUserStore();

    // Renderizar a home apropriada baseado na role
    if (role === 'MANAGER' || role === 'OWNER' || role === 'SUPER_ADMIN') {
        return <ManagerHomeScreen />;
    }

    if (role === 'EMPLOYEE') {
        return <EmployeeHomeScreen />;
    }

    // Padrão: ClientHomeScreen para role CLIENT ou outros
    return <ClientHomeScreen />;
}

