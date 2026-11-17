
import { useQuery } from "@tanstack/react-query";
import { Search, UserRound } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AppColors } from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/utils/supabase";

interface Client {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
}

async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, phone, notes")
    .order("name", { ascending: true });

  if (error) throw error;

  return data as Client[];
}

export default function ClientsScreen() {
  const [search, setSearch] = useState("");

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data ?? []).filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.phone.includes(query)
    );
  }, [data, search]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CUSTOMER DIRECTORY</Text>
        <Text style={styles.title}>Clients</Text>
        <Text style={styles.subtitle}>
          Your customers and their contact details.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={19} color={colors.textSecondary} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or phone number"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={colors.primary}
          style={styles.loader}
        />
      ) : isError ? (
        <Pressable style={styles.empty} onPress={() => void refetch()}>
          <Text style={styles.emptyTitle}>Unable to load clients</Text>
          <Text style={styles.emptyText}>Tap to retry.</Text>
        </Pressable>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.clientCard}>
              <View style={styles.avatar}>
                <UserRound size={20} color={colors.primary} />
              </View>

              <View style={styles.clientInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <UserRound size={28} color={colors.textSecondary} />

              <Text style={styles.emptyTitle}>No clients found</Text>

              <Text style={styles.emptyText}>
                Try another search or add a client when creating an order.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
    },

    eyebrow: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.5,
    },

    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
      marginTop: 7,
    },

    subtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 5,
    },

    searchContainer: {
      marginHorizontal: 20,
      marginBottom: 17,
      paddingHorizontal: 14,
      height: 49,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },

    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
    },

    loader: {
      marginTop: 35,
    },

    list: {
      paddingHorizontal: 20,
      paddingBottom: 30,
      gap: 10,
      flexGrow: 1,
    },

    clientCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 12,
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    clientInfo: {
      flex: 1,
      gap: 4,
    },

    name: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
    },

    phone: {
      color: colors.textSecondary,
      fontSize: 11,
    },

    empty: {
      padding: 35,
      alignItems: "center",
      gap: 9,
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },

    emptyText: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
    },
  });
}
