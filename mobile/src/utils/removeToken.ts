import * as SecureStore from 'expo-secure-store';

export async function removeToken() {
  try {
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    // Ignorar erro, garantir remoção
  }
}
