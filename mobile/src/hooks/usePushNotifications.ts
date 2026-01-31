import { api } from '../services/api';
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export function usePushNotifications(userId: string, deviceId: string | null) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Aguardar até ter userId e deviceId válidos
    if (!userId || !deviceId) {
      console.log('📱 Push: Aguardando userId/deviceId...', { userId, deviceId });
      return;
    }

    console.log('📱 Push: Iniciando registro de token...');
    console.log('📱 Push: userId:', userId);
    console.log('📱 Push: deviceId:', deviceId);

    registerForPushNotificationsAsync().then(token => {
      console.log('📱 Push: Token obtido:', token);
      setExpoPushToken(token);
      if (token) {
        console.log('📱 Push: Enviando token para API...');
        api.post('/notifications/register-token', {
          userId,
          deviceId,
          expoToken: token,
        })
        .then(res => console.log('📱 Push: Token registrado com sucesso!', res.data))
        .catch(err => console.error('📱 Push: Erro ao registrar token:', err.message));
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Trate navegação ou ações customizadas aqui
    });

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, [userId, deviceId]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Falha ao obter permissão para notificações push!');
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('É necessário um dispositivo físico para notificações push');
    return null;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFCC00',
    });
  }

  return token;
}
