import React, { createContext, useState, useContext } from 'react';

interface RoleContextType {
    role: string;
    setRole: React.Dispatch<React.SetStateAction<string>>;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
    const [role, setRole] = useState('cliente');
    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
