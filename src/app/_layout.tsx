
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { SplashScreen } from "../components/auth/SplashScreen";
import { queryClient } from "../lib/queryClient";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { ThemeProvider, useTheme } from "../providers/ThemeProvider";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "express-laundry-query-cache",
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  })
);

function RootNavigator() {
  const { session, loading } = useAuth();
  const { isLoading: themeLoading } = useTheme();

  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading || themeLoading || !splashFinished) {
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
