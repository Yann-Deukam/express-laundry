import { Check, Plus, Search, UserRound, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import type { Client } from "@/services/orderService";

interface ClientModalProps {
  visible: boolean;
  clients: Client[];
  selectedClientId: string | null;
  loading: boolean;
  creating: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
  onCreate: (input: { name: string; phone: string }) => Promise<unknown>;
}

export function ClientModal({
  visible,
  clients,
  selectedClientId,
  loading,
  creating,
  onClose,
  onSelect,
  onCreate,
}: ClientModalProps) {
  const { colors } = useTheme();

  const [search, setSearch] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const styles = useMemo(() => createStyles(colors), [colors]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return clients;

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
    );
  }, [clients, search]);

  function close() {
    setSearch("");
    setCreateMode(false);
    setName("");
    setPhone("");
    onClose();
  }

  async function handleCreate() {
    if (!name.trim() || !phone.trim()) return;

    try {
      await onCreate({
        name: name.trim(),
        phone: phone.trim(),
      });

      setName("");
      setPhone("");
      setCreateMode(false);
      setSearch("");
      onClose();
    } catch {
      // The parent handles and displays the error.
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {createMode ? "New client" : "Select a client"}
              </Text>
              <Text style={styles.subtitle}>
                {createMode
                  ? "Add a client to your records."
                  : "Choose the customer for this order."}
              </Text>
            </View>

            <Pressable onPress={close} style={styles.closeButton}>
              <X size={19} color={colors.text} />
            </Pressable>
          </View>

          {createMode ? (
            <View style={styles.form}>
              <Text style={styles.label}>Client name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Phone number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="6XX XXX XXX"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                keyboardType="phone-pad"
              />

              <Pressable
                onPress={handleCreate}
                disabled={creating || !name.trim() || !phone.trim()}
                style={[
                  styles.primaryButton,
                  (creating || !name.trim() || !phone.trim()) &&
                    styles.disabled,
                ]}
              >
                {creating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Create client</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setCreateMode(false)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  Back to client list
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.searchField}>
                <Search size={18} color={colors.textSecondary} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search name or phone"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>

              {loading ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.loader}
                />
              ) : (
                <ScrollView
                  style={styles.list}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {filteredClients.map((client) => {
                    const selected = client.id === selectedClientId;

                    return (
                      <Pressable
                        key={client.id}
                        onPress={() => {
                          onSelect(client);
                          close();
                        }}
                        style={styles.clientRow}
                      >
                        <View style={styles.avatar}>
                          <UserRound size={18} color={colors.primary} />
                        </View>

                        <View style={styles.clientInfo}>
                          <Text style={styles.clientName}>
                            {client.name}
                          </Text>
                          <Text style={styles.clientPhone}>
                            {client.phone}
                          </Text>
                        </View>

                        {selected && (
                          <Check size={19} color={colors.primary} />
                        )}
                      </Pressable>
                    );
                  })}

                  {filteredClients.length === 0 && (
                    <Text style={styles.emptyText}>
                      No clients found.
                    </Text>
                  )}
                </ScrollView>
              )}

              <Pressable
                onPress={() => setCreateMode(true)}
                style={styles.primaryButton}
              >
                <Plus size={18} color={colors.white} />
                <Text style={styles.primaryButtonText}>
                  Create new client
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.48)",
    },
    sheet: {
      maxHeight: "88%",
      backgroundColor: colors.background,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 30,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    title: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "700",
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 5,
    },
    closeButton: {
      width: 35,
      height: 35,
      borderRadius: 10,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    searchField: {
      height: 47,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      padding: 0,
    },
    list: {
      maxHeight: 340,
    },
    clientRow: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 11,
    },
    avatar: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    clientInfo: {
      flex: 1,
    },
    clientName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    clientPhone: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },
    emptyText: {
      color: colors.textSecondary,
      textAlign: "center",
      paddingVertical: 28,
      fontSize: 13,
    },
    loader: {
      paddingVertical: 30,
    },
    form: {
      gap: 10,
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: -4,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.surface,
      color: colors.text,
      paddingHorizontal: 13,
      fontSize: 14,
    },
    primaryButton: {
      minHeight: 49,
      borderRadius: 11,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 14,
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
    secondaryButton: {
      alignItems: "center",
      paddingVertical: 13,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    disabled: {
      opacity: 0.6,
    },
  });
}