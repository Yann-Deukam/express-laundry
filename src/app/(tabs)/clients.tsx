import { ClientCard } from "@/components/clients/ClientCard";
import { useClients } from "@/hooks/useClients";
import { useTheme } from "@/providers/ThemeProvider";
import type { Client } from "@/services/orderService";
import { createClientStyles } from "@/styles/clients.styles";

import {
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react-native";

import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function ClientsScreen() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const { colors } = useTheme();

  const styles = useMemo(
    () => createClientStyles(colors),
    [colors]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    businessId,
    authLoading,
    createClientMutation,
    updateClientMutation,
  } = useClients();

  const isSaving =
    createClientMutation.isPending ||
    updateClientMutation.isPending;

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data ?? []).filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.phone.includes(query)
    );
  }, [data, search]);

  function resetForm() {
    setName("");
    setPhone("");
    setNotes("");
    setFormError("");
    setEditingClient(null);

    createClientMutation.reset();
    updateClientMutation.reset();
  }

  function openAddClientModal() {
    resetForm();
    setModalVisible(true);
  }

  function openEditClientModal(client: Client) {
    resetForm();

    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone);
    setNotes(client.notes ?? "");

    setModalVisible(true);
  }

  function closeModal() {
    if (isSaving) return;

    setModalVisible(false);
    resetForm();
  }

  async function handleSaveClient() {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      setFormError(
        "Please enter the client's name and phone number."
      );
      return;
    }

    if (!businessId) {
      setFormError("No active business was found.");
      return;
    }

    setFormError("");

    const input = {
      name: trimmedName,
      phone: trimmedPhone,
      notes: notes.trim(),
    };

    try {
      if (editingClient) {
        await updateClientMutation.mutateAsync({
          clientId: editingClient.id,
          input,
        });
      } else {
        await createClientMutation.mutateAsync(input);
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save this client. Please try again."
      );
    }
  }

  if (authLoading || (isLoading && !data)) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
        <ActivityIndicator
          color={colors.primary}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  if (!businessId) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
        <View style={styles.empty}>
          <UserRound
            size={28}
            color={colors.textSecondary}
          />

          <Text style={styles.emptyTitle}>
            No active business
          </Text>

          <Text style={styles.emptyText}>
            We couldn't find a business associated with your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.eyebrow}>
              CUSTOMER DIRECTORY
            </Text>

            <Text style={styles.title}>
              Clients
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={openAddClientModal}
            accessibilityRole="button"
            accessibilityLabel="Add a new client"
          >
            <Plus size={17} color="#FFFFFF" />

            <Text style={styles.addButtonText}>
              Add Client
            </Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Your customers and their contact details.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search
          size={19}
          color={colors.textSecondary}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or phone number"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {isError ? (
        <Pressable
          style={styles.empty}
          onPress={() => void refetch()}
        >
          <Text style={styles.emptyTitle}>
            Unable to load clients
          </Text>

          <Text style={styles.emptyText}>
            Tap to retry.
          </Text>
        </Pressable>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              styles={styles}
              primaryColor={colors.primary}
              onEdit={openEditClientModal}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <UserRound
                size={28}
                color={colors.textSecondary}
              />

              <Text style={styles.emptyTitle}>
                No clients found
              </Text>

              <Text style={styles.emptyText}>
                Try another search or add a client using the button above.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios" ? "padding" : "height"
          }
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClient ? "Edit client" : "Add new client"}
              </Text>

              <Pressable
                style={styles.closeButton}
                onPress={closeModal}
                disabled={isSaving}
                accessibilityLabel="Close form"
              >
                <X size={19} color={colors.text} />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              {editingClient
                ? "Update this customer's information."
                : "Enter your customer's contact information below."}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Full name{" "}
                  <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.fieldInput}
                  autoCapitalize="words"
                  editable={!isSaving}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Phone number{" "}
                  <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 677123456"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.fieldInput}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Notes{" "}
                  <Text style={styles.required}>
                    (optional)
                  </Text>
                </Text>

                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Prefers delivery. Handle delicate clothes carefully."
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.fieldInput,
                    styles.notesInput,
                    { minHeight: 90, textAlignVertical: "top" },
                  ]}
                  multiline
                  editable={!isSaving}
                />
              </View>

              {!!formError && (
                <Text style={styles.formError}>
                  {formError}
                </Text>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.submitButton,
                    isSaving && styles.submitButtonDisabled,
                  ]}
                  onPress={() => void handleSaveClient()}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <>
                      {editingClient ? (
                        <Text style={styles.submitButtonText}>
                          Save Changes
                        </Text>
                      ) : (
                        <>
                          <Plus size={17} color="#FFFFFF" />
                          <Text style={styles.submitButtonText}>
                            Save Client
                          </Text>
                        </>
                      )}
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}