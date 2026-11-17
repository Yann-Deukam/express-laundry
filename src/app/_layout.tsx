
import { Stack } from "expo-router";
import { SplashScreen } from "../components/auth/SplashScreen";
import { AuthProvider, useAuth } from "../providers/AuthProvider";

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
