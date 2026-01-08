// Logo temporária para visualização (cachorro cartoon)
import React from 'react';
import { View, Image } from 'react-native';

export default function TempLogo() {
    return (
        <Image
            source={{ uri: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80' }}
            style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }}
            resizeMode="cover"
        />
    );
}
