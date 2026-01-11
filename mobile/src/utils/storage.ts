import * as SecureStore from 'expo-secure-store';

export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in secure store:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value || null;
    } catch (error) {
      console.error('Error getting item from secure store:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from secure store:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      // SecureStore não tem método clear(), então removemos chaves específicas
      const keysToRemove = ['user_token', 'user_data', 'user_preferences'];
      for (const key of keysToRemove) {
        await this.removeItem(key);
      }
    } catch (error) {
      console.error('Error clearing secure store:', error);
    }
  },
};
