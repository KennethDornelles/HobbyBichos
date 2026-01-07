import { View, Text, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md">
        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Bem-vindo! 👋
        </Text>
        
        <Text className="text-base text-gray-600 mb-6 text-center">
          Seu projeto Expo com NativeWind v4 está funcionando perfeitamente!
        </Text>

        <TouchableOpacity 
          className="bg-primary py-4 px-6 rounded-xl active:opacity-80"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Começar
          </Text>
        </TouchableOpacity>

        <View className="flex-row gap-2 mt-4">
          <View className="flex-1 bg-success/10 py-3 rounded-lg">
            <Text className="text-success text-center font-semibold">✓ Expo 54</Text>
          </View>
          <View className="flex-1 bg-secondary/10 py-3 rounded-lg">
            <Text className="text-secondary text-center font-semibold">✓ NativeWind v4</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
