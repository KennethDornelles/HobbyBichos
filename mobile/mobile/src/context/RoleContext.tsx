import React, { createContext, useState, useContext } from 'react';

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
    const [role, setRole] = useState('cliente');
    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => useContext(RoleContext);
