import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();

  // Aqui você pode buscar os detalhes da notificação pelo id
  // Exemplo: const notification = buscarNotificacaoPorId(id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhe da Notificação</Text>
      <Text style={styles.id}>ID: {id}</Text>
      {/* Renderize aqui os detalhes reais da notificação */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10142D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFD600',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  id: {
    color: '#fff',
    fontSize: 16,
  },
});
