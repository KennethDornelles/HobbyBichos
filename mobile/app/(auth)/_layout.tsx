import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useEffect } from "react";

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="forgot-password" />
        </Stack>
    );
}
