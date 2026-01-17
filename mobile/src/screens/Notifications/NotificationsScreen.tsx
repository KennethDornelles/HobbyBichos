import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useUserNotifications } from '../../hooks/useUserNotifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  // Substitua por dados reais do usuário/dispositivo
  const userId = 'USER_ID';
  const storeId = 'STORE_ID';
  const deviceId = 'DEVICE_ID';
  const { notification } = usePushNotifications(userId, deviceId);
  const { notifications, loading } = useUserNotifications(userId, storeId);
  const router = useRouter();

  useEffect(() => {
    if (notification) {
      // Atualize a lista de notificações se necessário
    }
  }, [notification]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>Notifications center</Text>
      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.tabActive]}>New</Text>
        <Text style={styles.tab}>Notificaces</Text>
        <Text style={styles.tab}>Earlier</Text>
      </View>
      {loading ? (
        <ActivityIndicator color="#FFD600" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/notifications/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.card}>
                <View style={styles.iconWrap}>
                  <Ionicons name={getIcon(item.category)} size={32} color="#FFD600" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.category.replace('_', ' ')}</Text>
                  <Text style={styles.message}>{item.payload?.message || '-'}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={28} color="#FFD600" />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}

function getIcon(category: string) {
  switch (category) {
    case 'APPOINTMENT_REMINDER':
    case 'PAYMENT_REMINDER':
    case 'MARKETING':
      return 'paw';
    case 'ORDER_CONFIRMED':
      return 'gift';
    default:
      return 'notifications';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10142D',
    paddingHorizontal: 0,
  },
  header: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 24,
    marginLeft: 24,
    marginBottom: 12,
    fontFamily: 'System',
  },
  tabs: {
    flexDirection: 'row',
    marginLeft: 24,
    marginBottom: 12,
  },
  tab: {
    color: '#fff',
    fontSize: 16,
    marginRight: 24,
    opacity: 0.5,
    fontFamily: 'System',
  },
  tabActive: {
    opacity: 1,
    fontWeight: 'bold',
    borderBottomWidth: 3,
    borderBottomColor: '#FFD600',
    paddingBottom: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#23274A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  message: {
    color: '#B0B3C7',
    fontSize: 14,
    fontFamily: 'System',
  },
});
