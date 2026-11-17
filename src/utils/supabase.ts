
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your environment configuration."
  );
}

// During Expo Router server-side export, browser storage is unavailable.
const isServer =
  Platform.OS === "web" && typeof window === "undefined";

const authStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isServer) return null;
    return AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (isServer) return;
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (isServer) return;
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
