
import { useRouter } from "expo-router";
import { Check, ChevronDown, Plus, UserRound } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNewOrder } from "@/hooks/orders/useNewOrder";
import { useTheme } from "@/providers/ThemeProvider";
import { useOrderDraftStore } from "@/stores/orderDraftStore";

import { ClientModal } from "@/components/orders/ClientModal";
import { LaundryDetailsForm } from "@/components/orders/LaundryDetailForm";
import { LaundryPhotoPicker } from "@/components/orders/LaundryPhotoPicker";
import { OrderDateFields } from "@/components/orders/OrderDateFields";

export default function NewOrderScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const draft = useOrderDraftStore();

  const {
    clients,
    selectedClient,
    isLoadingClients,
    createClient,
    isCreatingClient,
    total,
    submit,
    isSaving,
    reset,
  } = useNewOrder();

  const [clientModalVisible, setClientModalVisible] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  async function handleCreateClient(input: {
    name: string;
    phone: string;
  }) {
    try {
      await createClient(input);
    } catch (error) {
      Alert.alert(
        "Could not create client",
        error instanceof Error ? error.message : "Please try again."
      );

      throw error;
    }
  }

  async function handleSaveOrder() {
    try {
      await submit();

      reset();

      Alert.alert(
        "Order created",
        "The laundry order has been saved successfully.",
        [
          {
            text: "View orders",
            onPress: () => router.replace("/(tabs)/orders"),
          },
          {
            text: "Create another",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Order not saved",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ORDER MANAGEMENT</Text>
          <Text style={styles.heading}>New order</Text>
          <Text style={styles.subheading}>
            Record a new laundry collection.
          </Text>
        </View>

        {/* CLIENT */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <UserRound size={18} color={colors.primary} />
            </View>

            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Client</Text>
              <Text style={styles.sectionDescription}>
                Who does this order belong to?
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.clientSelector}
            onPress={() => setClientModalVisible(true)}
          >
            <View style={styles.clientSelectorContent}>
              <Text
                style={[
                  styles.clientName,
                  !selectedClient && styles.placeholder,
                ]}
              >
                {selectedClient?.name ?? "Select a client"}
              </Text>

              {selectedClient && (
                <Text style={styles.clientPhone}>
                  {selectedClient.phone}
                </Text>
              )}
            </View>

            <ChevronDown size={19} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={() => setClientModalVisible(true)}
            style={styles.createClientAction}
          >
            <Plus size={15} color={colors.primary} />
            <Text style={styles.createClientText}>
              Select or create a client
            </Text>
          </Pressable>
        </View>

        {/* DATES */}
        <OrderDateFields
          pickupDate={draft.pickupDate}
          deliveryDate={draft.deliveryDate}
          onPickupChange={draft.setPickupDate}
          onDeliveryChange={draft.setDeliveryDate}
        />

        {/* LAUNDRY DETAILS AND ORDER NOTICE */}
        <LaundryDetailsForm
  weight={draft.weightKg}
  pack={draft.pack}
  customPrice={draft.customPrice}
  total={total}
  notice={draft.notice}
  onWeightChange={draft.setWeightKg}
  onPackChange={draft.setPack}
  onCustomPriceChange={draft.setCustomPrice}
  onNoticeChange={draft.setNotice}
/>

        {/* WEIGHING PHOTO */}
        <LaundryPhotoPicker
          photoUri={draft.photoUri}
          onPhotoChange={draft.setPhotoUri}
        />

        {/* SAVE */}
        <Pressable
          onPress={handleSaveOrder}
          disabled={isSaving}
          style={[
            styles.saveButton,
            isSaving && styles.saveButtonDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Check size={19} color={colors.white} />
              <Text style={styles.saveButtonText}>Save order</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.footerNote}>
          The order will be saved with the status Received.
        </Text>
      </ScrollView>

      <ClientModal
        visible={clientModalVisible}
        clients={clients}
        selectedClientId={draft.clientId}
        loading={isLoadingClients}
        creating={isCreatingClient}
        onClose={() => setClientModalVisible(false)}
        onSelect={(client) => draft.setClient(client.id)}
        onCreate={handleCreateClient}
      />
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>["colors"]
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 27,
    },
    eyebrow: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      marginBottom: 8,
    },
    heading: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
      letterSpacing: -0.8,
    },
    subheading: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 6,
    },
    section: {
      marginBottom: 27,
    },
    sectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 15,
    },
    sectionIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeadingText: {
      flex: 1,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    sectionDescription: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 3,
    },
    clientSelector: {
      minHeight: 62,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      paddingHorizontal: 15,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    clientSelectorContent: {
      flex: 1,
    },
    clientName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    clientPhone: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    placeholder: {
      color: colors.textSecondary,
      fontWeight: "400",
    },
    createClientAction: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      marginTop: 11,
      paddingVertical: 3,
    },
    createClientText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    saveButton: {
      minHeight: 53,
      borderRadius: 12,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },
    saveButtonDisabled: {
      opacity: 0.65,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "700",
    },
    footerNote: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: "center",
      marginTop: 12,
    },
  });
}
