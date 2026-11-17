
import NetInfo from "@react-native-community/netinfo";
import { Stack } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect, useState } from "react";

import { SplashScreen } from "../components/auth/SplashScreen";
import { queryClient } from "../lib/queryClient";
import { AuthProvider, useAuth } from "../providers/AuthProvider";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "express-laundry-query-cache",
});

const MINIMUM_SPLASH_DURATION = 2500;

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  })
);

function RootNavigator() {
  const { session, loading } = useAuth();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, MINIMUM_SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !splashFinished) {
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
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
