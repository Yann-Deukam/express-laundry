
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
    CalendarDays,
    Check,
    ChevronRight,
    CreditCard,
    Droplets,
    Plus,
    Share2,
    Shirt,
    Truck,
    Weight,
    X,
} from "lucide-react-native";
import type { ComponentRef } from "react";
import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import type { AppColors } from "@/constants/colors";
import {
    useOrders,
    useUpdateOrderDelivery,
    useUpdateOrderPayment,
    useUpdateOrderWashed,
} from "@/hooks/useOrders";
import { useTheme } from "@/providers/ThemeProvider";
import type { Order } from "@/services/orderService";

function money(value: number) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status: string, colors: AppColors) {
  const statusColors: Record<string, string> = {
    received: colors.statusReceived,
    awaiting_validation: colors.statusAwaitingValidation,
    confirmed: colors.statusConfirmed,
    washing: colors.statusWashing,
    ironing: colors.statusIroning,
    ready: colors.statusReady,
    delivered: colors.statusDelivered,
  };

  return statusColors[status] ?? colors.textSecondary;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    received: "Received",
    awaiting_validation: "Awaiting approval",
    confirmed: "Confirmed",
    washing: "Washing",
    ironing: "Ironing",
    ready: "Ready",
    delivered: "Delivered",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function getPricingLabel(pack?: string) {
  if (pack === "per_kg_500") return "500 FCFA / kg";
  if (pack === "per_kg_1000") return "1,000 FCFA / kg";
  if (pack === "custom") return "Custom price";

  return "Not specified";
}

export default function OrdersScreen() {
  const router = useRouter();

  const { data, isLoading, isError, refetch, isRefetching } = useOrders();

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const invoiceRef = useRef<ComponentRef<typeof View>>(null);

  const deliveryMutation = useUpdateOrderDelivery();
  const washedMutation = useUpdateOrderWashed();
  const paymentMutation = useUpdateOrderPayment();

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const closeOrder = () => {
    setDetailsVisible(false);
  };

  async function handleDeliveryToggle() {
    if (!selectedOrder) return;

    try {
      const updated = await deliveryMutation.mutateAsync({
        id: selectedOrder.id,
        isDelivered: !selectedOrder.is_delivered,
      });

      setSelectedOrder(updated);
    } catch (error) {
      Alert.alert(
        "Couldn't update delivery",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  }

  async function handleWashedToggle() {
    if (!selectedOrder) return;

    try {
      const updated = await washedMutation.mutateAsync({
        id: selectedOrder.id,
        isWashed: !selectedOrder.is_washed,
      });

      setSelectedOrder(updated);
    } catch (error) {
      Alert.alert(
        "Couldn't update washing status",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  }

  async function handlePaymentToggle() {
    if (!selectedOrder) return;

    const isPaid =
      Number(selectedOrder.amount_paid) >= Number(selectedOrder.total);

    const nextAmount = isPaid ? 0 : Number(selectedOrder.total);

    try {
      const updated = await paymentMutation.mutateAsync({
        id: selectedOrder.id,
        amountPaid: nextAmount,
      });

      setSelectedOrder(updated);
    } catch (error) {
      Alert.alert(
        "Couldn't update payment",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  }

  async function handleShareInvoice() {
    if (!selectedOrder || isSharing) return;

    if (!invoiceRef.current) {
      Alert.alert("Invoice unavailable", "Please try again.");
      return;
    }

    try {
      setIsSharing(true);

      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert(
          "Sharing unavailable",
          "Sharing is not available on this device."
        );
        return;
      }

      const uri = await captureRef(invoiceRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share laundry invoice",
        UTI: "public.png",
      });
    } catch (error) {
      console.error("INVOICE SHARING ERROR:", error);

      Alert.alert(
        "Couldn't share invoice",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsSharing(false);
    }
  }

  function renderOrder({ item }: { item: Order }) {
    const balance = Math.max(
      Number(item.total) - Number(item.amount_paid),
      0
    );

    const statusColor = getStatusColor(item.status, colors);
    const photo = item.items?.[0]?.photo_signed_url;

    const isPaid =
      Number(item.amount_paid) >= Number(item.total) &&
      Number(item.total) > 0;

    
return (
  <Pressable
    style={({ pressed }) => [
      styles.card,
      pressed && styles.cardPressed,
    ]}
    onPress={() => openOrder(item)}
  >
    {photo ? (
      <Image
        source={{ uri: photo }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
    ) : (
      <View style={styles.photoPlaceholder}>
        <Shirt color={colors.primary} size={32} />
      </View>
    )}

    <View style={styles.cardBody}>
      <View style={styles.cardTop}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName} numberOfLines={1}>
            {item.clients?.name ?? "Unknown client"}
          </Text>

          <Text style={styles.phone}>
            {item.clients?.phone ?? "No phone number"}
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColor },
              ]}
            />

            <Text style={[styles.status, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.totalAmount}>
            {money(Number(item.total))}
          </Text>

          <ChevronRight size={17} color={colors.textSecondary} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={styles.detail}>
          <Text style={styles.caption}>Delivery</Text>
          <Text style={styles.value}>
            {formatDate(item.delivery_date)}
          </Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.caption}>Balance</Text>
          <Text
            style={[
              styles.value,
              {
                color: balance > 0 ? colors.warning : colors.success,
              },
            ]}
          >
            {money(balance)}
          </Text>
        </View>

        <View style={styles.cardFlags}>
          {item.is_washed && (
            <View style={styles.miniFlag}>
              <Droplets size={12} color={colors.success} />
            </View>
          )}

          {item.is_delivered && (
            <View style={styles.miniFlag}>
              <Truck size={12} color={colors.success} />
            </View>
          )}

          {isPaid && (
            <View style={styles.miniFlag}>
              <Check size={12} color={colors.success} />
            </View>
          )}
        </View>
      </View>
    </View>
  </Pressable>
);

  }

  const selectedItem = selectedOrder?.items?.[0];
  const selectedPhoto = selectedItem?.photo_signed_url;

  const selectedBalance = selectedOrder
    ? Math.max(
        Number(selectedOrder.total) - Number(selectedOrder.amount_paid),
        0
      )
    : 0;

  const selectedIsPaid = selectedOrder
    ? Number(selectedOrder.total) > 0 &&
      Number(selectedOrder.amount_paid) >= Number(selectedOrder.total)
    : false;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WORKSPACE</Text>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>
            Manage pickups, laundry and deliveries.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/new-order")}
        >
          <Plus size={21} color={colors.white} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={colors.primary}
          style={styles.loader}
        />
      ) : isError ? (
        <Pressable
          style={styles.empty}
          onPress={() => void refetch()}
        >
          <Text style={styles.emptyTitle}>Couldn't load orders</Text>
          <Text style={styles.emptyText}>Tap to try again.</Text>
        </Pressable>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Shirt size={30} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>
                Your laundry orders will appear here.
              </Text>
            </View>
          }
        />
      )}

      {/* ORDER DETAILS BOTTOM SHEET */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={closeOrder}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeOrder}
          />

          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>ORDER DETAILS</Text>
                <Text style={styles.sheetTitle}>
                  {selectedOrder?.clients?.name ?? "Laundry order"}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeOrder}
              >
                <X size={19} color={colors.text} />
              </Pressable>
            </View>

            {selectedOrder && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetContent}
              >
                {selectedPhoto ? (
                  <Image
                    source={{ uri: selectedPhoto }}
                    style={styles.detailPhoto}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noPhoto}>
                    <Shirt size={30} color={colors.textSecondary} />
                    <Text style={styles.noPhotoText}>
                      No weighing photo available
                    </Text>
                  </View>
                )}

                <View style={styles.clientBlock}>
                  <Text style={styles.clientBlockName}>
                    {selectedOrder.clients?.name ?? "Unknown client"}
                  </Text>

                  <Text style={styles.clientBlockPhone}>
                    {selectedOrder.clients?.phone ?? "No phone number"}
                  </Text>
                </View>

                <View style={styles.sectionDivider} />

                <Text style={styles.sectionTitle}>Laundry information</Text>

                <View style={styles.infoGrid}>
                  <InfoCell
                    icon={<Weight size={16} color={colors.primary} />}
                    label="Weight"
                    value={
                      selectedItem?.weight_kg != null
                        ? `${Number(selectedItem.weight_kg)} kg`
                        : "Not specified"
                    }
                    styles={styles}
                  />

                  <InfoCell
                    icon={<CreditCard size={16} color={colors.primary} />}
                    label="Pricing"
                    value={getPricingLabel(selectedItem?.pack)}
                    styles={styles}
                  />

                  <InfoCell
                    icon={<CalendarDays size={16} color={colors.primary} />}
                    label="Pickup date"
                    value={formatDate(selectedOrder.pickup_date)}
                    styles={styles}
                  />

                  <InfoCell
                    icon={<Truck size={16} color={colors.primary} />}
                    label="Delivery date"
                    value={formatDate(selectedOrder.delivery_date)}
                    styles={styles}
                  />
                </View>

                <View style={styles.amountPanel}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Order total</Text>
                    <Text style={styles.amountValue}>
                      {money(Number(selectedOrder.total))}
                    </Text>
                  </View>

                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Amount paid</Text>
                    <Text style={styles.amountValue}>
                      {money(Number(selectedOrder.amount_paid))}
                    </Text>
                  </View>

                  <View style={styles.amountDivider} />

                  <View style={styles.amountRow}>
                    <Text style={styles.balanceLabel}>Remaining balance</Text>
                    <Text
                      style={[
                        styles.balanceValue,
                        {
                          color:
                            selectedBalance > 0
                              ? colors.warning
                              : colors.success,
                        },
                      ]}
                    >
                      {money(selectedBalance)}
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                <Text style={styles.sectionTitle}>Order checklist</Text>
                <Text style={styles.sectionDescription}>
                  Update each step independently. Changing one won't
                  automatically change the others.
                </Text>

                <View style={styles.actions}>
                  <StatusAction
                    icon={<Droplets size={19} color={selectedOrder.is_washed ? colors.success : colors.textSecondary} />}
                    title="Washed"
                    description="Laundry has been washed"
                    active={selectedOrder.is_washed}
                    onPress={handleWashedToggle}
                    loading={washedMutation.isPending}
                    colors={colors}
                    styles={styles}
                  />

                  <StatusAction
                    icon={<Truck size={19} color={selectedOrder.is_delivered ? colors.success : colors.textSecondary} />}
                    title="Delivered"
                    description="Laundry handed to client"
                    active={selectedOrder.is_delivered}
                    onPress={handleDeliveryToggle}
                    loading={deliveryMutation.isPending}
                    colors={colors}
                    styles={styles}
                  />

                  <StatusAction
                    icon={<CreditCard size={19} color={selectedIsPaid ? colors.success : colors.textSecondary} />}
                    title="Paid"
                    description={
                      selectedIsPaid
                        ? "Payment completed"
                        : selectedBalance > 0 &&
                            Number(selectedOrder.amount_paid) > 0
                          ? "Partially paid — balance remains"
                          : "Payment not completed"
                    }
                    active={selectedIsPaid}
                    onPress={handlePaymentToggle}
                    loading={paymentMutation.isPending}
                    colors={colors}
                    styles={styles}
                  />
                </View>

                <Pressable
                  style={[
                    styles.shareButton,
                    isSharing && styles.disabledButton,
                  ]}
                  onPress={() => void handleShareInvoice()}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Share2 size={18} color={colors.white} />
                  )}

                  <Text style={styles.shareButtonText}>
                    {isSharing ? "Preparing invoice..." : "Share invoice"}
                  </Text>
                </Pressable>

                <Text style={styles.sheetFooter}>
                  Order created {formatDate(selectedOrder.created_at)}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* INVOICE VIEW — CAPTURED AS A PNG FOR SHARING */}
      {selectedOrder && (
        <View
          ref={invoiceRef}
          collapsable={false}
          pointerEvents="none"
          style={styles.invoiceCanvas}
        >
          <View style={styles.invoice}>
            <View style={styles.invoiceHeader}>
              <View>
                <Text style={styles.invoiceBrand}>EXPRESS LAUNDRY</Text>
                <Text style={styles.invoiceTagline}>
                  Laundry care, made simple.
                </Text>
              </View>

              <Text style={styles.invoiceLabel}>INVOICE</Text>
            </View>

            <View style={styles.invoiceRule} />

            <Text style={styles.invoiceSectionLabel}>BILLED TO</Text>
            <Text style={styles.invoiceClient}>
              {selectedOrder.clients?.name ?? "Client"}
            </Text>
            <Text style={styles.invoicePhone}>
              {selectedOrder.clients?.phone ?? ""}
            </Text>

            <View style={styles.invoiceMeta}>
              <View>
                <Text style={styles.invoiceSectionLabel}>ORDER DATE</Text>
                <Text style={styles.invoiceMetaValue}>
                  {formatDate(selectedOrder.created_at)}
                </Text>
              </View>

              <View>
                <Text style={styles.invoiceSectionLabel}>DELIVERY DATE</Text>
                <Text style={styles.invoiceMetaValue}>
                  {formatDate(selectedOrder.delivery_date)}
                </Text>
              </View>
            </View>

            {selectedPhoto ? (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.invoicePhoto}
                resizeMode="cover"
              />
            ) : null}

            <View style={styles.invoiceTableHeader}>
              <Text style={styles.invoiceTableHeading}>DESCRIPTION</Text>
              <Text style={styles.invoiceTableHeading}>AMOUNT</Text>
            </View>

            <View style={styles.invoiceTableRow}>
              <View>
                <Text style={styles.invoiceItemName}>Laundry service</Text>
                <Text style={styles.invoiceItemDescription}>
                  {selectedItem?.weight_kg != null
                    ? `${Number(selectedItem.weight_kg)} kg`
                    : "Laundry"}
                  {" · "}
                  {getPricingLabel(selectedItem?.pack)}
                </Text>
              </View>

              <Text style={styles.invoiceItemAmount}>
                {money(Number(selectedOrder.total))}
              </Text>
            </View>

            <View style={styles.invoiceRule} />

            <View style={styles.invoiceTotalRow}>
              <Text style={styles.invoiceTotalLabel}>TOTAL</Text>
              <Text style={styles.invoiceTotal}>
                {money(Number(selectedOrder.total))}
              </Text>
            </View>

            <View style={styles.invoicePaymentRow}>
              <Text style={styles.invoicePaymentLabel}>Amount paid</Text>
              <Text style={styles.invoicePaymentValue}>
                {money(Number(selectedOrder.amount_paid))}
              </Text>
            </View>

            <View style={styles.invoicePaymentRow}>
              <Text style={styles.invoicePaymentLabel}>Balance due</Text>
              <Text style={styles.invoiceBalance}>
                {money(
                  Math.max(
                    Number(selectedOrder.total) -
                      Number(selectedOrder.amount_paid),
                    0
                  )
                )}
              </Text>
            </View>

            <View style={styles.invoiceFooter}>
              <Text style={styles.invoiceFooterTitle}>
                Thank you for choosing Express Laundry.
              </Text>
              <Text style={styles.invoiceFooterText}>
                Please keep this invoice for your records.
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoCell({
  icon,
  label,
  value,
  styles,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.infoCell}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatusAction({
  icon,
  title,
  description,
  active,
  onPress,
  loading,
  colors,
  styles,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onPress: () => void;
  loading: boolean;
  colors: AppColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      style={[
        styles.actionRow,
        active && styles.actionRowActive,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.actionIcon}>{icon}</View>

      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>

      <View
        style={[
          styles.checkCircle,
          active && {
            backgroundColor: colors.success,
            borderColor: colors.success,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : active ? (
          <Check size={14} color={colors.white} />
        ) : null}
      </View>
    </Pressable>
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
      paddingBottom: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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

    addButton: {
      backgroundColor: colors.primary,
      width: 45,
      height: 45,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    loader: {
      marginTop: 40,
    },

    list: {
      paddingHorizontal: 20,
      paddingBottom: 30,
      gap: 12,
      flexGrow: 1,
    },

    card: {
        backgroundColor: colors.surface,
        borderRadius: 0,
        borderWidth: 0,
        padding: 0,
        overflow: "hidden",
    },

    cardPressed: {
      opacity: 0.8,
    },

    photoPlaceholder: {
  width: "100%",
  height: 190,
  backgroundColor: colors.iconBackground,
  alignItems: "center",
  justifyContent: "center",
},
cardBody: {
  padding: 15,
},

    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },

    cardPhoto: {
      width: 48,
      height: 48,
      borderRadius: 13,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

   thumbnail: {
  width: "100%",
  height: 190,
  borderWidth: 0,
},

    clientInfo: {
      flex: 1,
      gap: 4,
    },

    clientName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "800",
    },

    phone: {
      color: colors.textSecondary,
      fontSize: 11,
    },

    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 2,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    status: {
      fontSize: 9,
      fontWeight: "800",
      textTransform: "capitalize",
    },

    cardRight: {
      alignItems: "flex-end",
      gap: 7,
    },

    totalAmount: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "800",
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },

    cardBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 5,
    },

    detail: {
      flex: 1,
    },

    caption: {
      color: colors.textSecondary,
      fontSize: 9,
      marginBottom: 5,
    },

    value: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
    },

    cardFlags: {
      flexDirection: "row",
      gap: 5,
    },

    miniFlag: {
      width: 25,
      height: 25,
      borderRadius: 8,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
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
    },

    // Details sheet
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0,0,0,0.5)",
    },

    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      maxHeight: "92%",
      paddingTop: 11,
      paddingBottom: 20,
    },

    sheetHandle: {
      width: 38,
      height: 4,
      borderRadius: 4,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 18,
    },

    sheetHeader: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    sheetEyebrow: {
      color: colors.primary,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1.3,
    },

    sheetTitle: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "800",
      marginTop: 5,
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    sheetContent: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },

    detailPhoto: {
      width: "100%",
      height: 205,
      borderRadius: 17,
      backgroundColor: colors.surface,
    },

    noPhoto: {
      width: "100%",
      height: 150,
      borderRadius: 17,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    noPhotoText: {
      color: colors.textSecondary,
      fontSize: 12,
    },

    clientBlock: {
      marginTop: 15,
      gap: 5,
    },

    clientBlockName: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "800",
    },

    clientBlockPhone: {
      color: colors.textSecondary,
      fontSize: 12,
    },

    sectionDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 19,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "800",
      marginBottom: 12,
    },

    sectionDescription: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 17,
      marginTop: -5,
      marginBottom: 12,
    },

    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    infoCell: {
      width: "48%",
      flexGrow: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 13,
      padding: 11,
    },

    infoIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    infoText: {
      flex: 1,
      gap: 4,
    },

    infoLabel: {
      color: colors.textSecondary,
      fontSize: 9,
    },

    infoValue: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
    },

    amountPanel: {
      marginTop: 16,
      padding: 15,
      borderRadius: 15,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 11,
    },

    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    amountLabel: {
      color: colors.textSecondary,
      fontSize: 11,
    },

    amountValue: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
    },

    amountDivider: {
      height: 1,
      backgroundColor: colors.border,
    },

    balanceLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "800",
    },

    balanceValue: {
      fontSize: 13,
      fontWeight: "900",
    },

    actions: {
      gap: 9,
    },

    actionRow: {
      minHeight: 68,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },

    actionRowActive: {
      borderColor: colors.success,
    },

    actionIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    actionText: {
      flex: 1,
      gap: 4,
    },

    actionTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "800",
    },

    actionDescription: {
      color: colors.textSecondary,
      fontSize: 10,
    },

    checkCircle: {
      width: 23,
      height: 23,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    shareButton: {
      marginTop: 18,
      height: 49,
      borderRadius: 14,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    disabledButton: {
      opacity: 0.7,
    },

    shareButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "800",
    },

    sheetFooter: {
      color: colors.textSecondary,
      fontSize: 10,
      textAlign: "center",
      marginTop: 15,
    },

    // Invoice image
    invoiceCanvas: {
      position: "absolute",
      left: -1000,
      top: 0,
      width: 360,
      backgroundColor: "#FFFFFF",
    },

    invoice: {
      width: 360,
      padding: 25,
      backgroundColor: "#FFFFFF",
    },

    invoiceHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    invoiceBrand: {
      color: "#20242D",
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: 0.7,
    },

    invoiceTagline: {
      color: "#7B8493",
      fontSize: 9,
      marginTop: 5,
    },

    invoiceLabel: {
      color: "#6366F1",
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 1.5,
    },

    invoiceRule: {
      height: 1,
      backgroundColor: "#E6E8ED",
      marginVertical: 18,
    },

    invoiceSectionLabel: {
      color: "#9299A5",
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 6,
    },

    invoiceClient: {
      color: "#20242D",
      fontSize: 15,
      fontWeight: "800",
    },

    invoicePhone: {
      color: "#747D8B",
      fontSize: 10,
      marginTop: 4,
    },

    invoiceMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },

    invoiceMetaValue: {
      color: "#20242D",
      fontSize: 10,
      fontWeight: "700",
    },

    invoicePhoto: {
      width: "100%",
      height: 145,
      borderRadius: 10,
      marginTop: 20,
    },

    invoiceTableHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#E6E8ED",
      marginTop: 22,
    },

    invoiceTableHeading: {
      color: "#9299A5",
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 0.8,
    },

    invoiceTableRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
    },

    invoiceItemName: {
      color: "#20242D",
      fontSize: 11,
      fontWeight: "800",
    },

    invoiceItemDescription: {
      color: "#7B8493",
      fontSize: 9,
      marginTop: 5,
    },

    invoiceItemAmount: {
      color: "#20242D",
      fontSize: 10,
      fontWeight: "700",
    },

    invoiceTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    invoiceTotalLabel: {
      color: "#20242D",
      fontSize: 10,
      fontWeight: "900",
    },

    invoiceTotal: {
      color: "#20242D",
      fontSize: 16,
      fontWeight: "900",
    },

    invoicePaymentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
    },

    invoicePaymentLabel: {
      color: "#7B8493",
      fontSize: 10,
    },

    invoicePaymentValue: {
      color: "#20242D",
      fontSize: 10,
      fontWeight: "700",
    },

    invoiceBalance: {
      color: "#D97706",
      fontSize: 10,
      fontWeight: "800",
    },

    invoiceFooter: {
      borderTopWidth: 1,
      borderTopColor: "#E6E8ED",
      marginTop: 25,
      paddingTop: 17,
      alignItems: "center",
    },

    invoiceFooterTitle: {
      color: "#20242D",
      fontSize: 10,
      fontWeight: "800",
      textAlign: "center",
    },

    invoiceFooterText: {
      color: "#9299A5",
      fontSize: 8,
      marginTop: 5,
      textAlign: "center",
    },
  });
}
