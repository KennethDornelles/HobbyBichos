import React from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';

// Mock de categorias e canais (substitua por fetch da API futuramente)
const categories = [
  { key: 'APPOINTMENT_REMINDER', label: 'Lembrete de Consulta' },
  { key: 'ORDER_CONFIRMED', label: 'Confirmação de Pedido' },
  { key: 'PAYMENT_REMINDER', label: 'Lembrete de Pagamento' },
  { key: 'MARKETING', label: 'Promoções' },
  { key: 'OTP', label: 'Código de Autenticação' },
];
const channels = [
  { key: 'push', label: 'Push' },
  { key: 'email', label: 'E-mail' },
  { key: 'sms', label: 'SMS' },
  { key: 'whatsapp', label: 'WhatsApp' },
];


export default function NotificationPreferencesScreen() {
  // Substitua por dados reais do usuário/loja
  const userId = 'USER_ID';
  const storeId = 'STORE_ID';
  const { prefs, loading, updatePref } = useNotificationPreferences(userId, storeId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>Preferências de Notificação</Text>
      {loading ? (
        <ActivityIndicator color="#FFD600" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.category}>{item.label}</Text>
              <View style={styles.switchRow}>
                {channels.map(channel => (
                  <View key={channel.key} style={styles.switchCol}>
                    <Text style={styles.channel}>{channel.label}</Text>
                    <Switch
                      value={!!prefs?.[item.key]?.[channel.key]}
                      onValueChange={() => updatePref(item.key, channel.key, !prefs?.[item.key]?.[channel.key])}
                      trackColor={{ false: '#23274A', true: '#FFD600' }}
                      thumbColor={prefs?.[item.key]?.[channel.key] ? '#FFD600' : '#B0B3C7'}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10142D',
    paddingHorizontal: 0,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginLeft: 24,
    marginBottom: 12,
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#181C36',
    borderRadius: 30,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  category: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchCol: {
    alignItems: 'center',
    flex: 1,
  },
  channel: {
    color: '#B0B3C7',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'System',
  },
});
