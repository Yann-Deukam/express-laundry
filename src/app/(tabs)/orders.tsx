
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  CreditCard,
  Droplets,
  Plus,
  Share2,
  Shirt,
  Truck,
  Weight,
  X,
} from "lucide-react-native";
import type { ComponentRef, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
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
import { createStyles, OrdersStyles } from "@/styles/order.styles";

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

  const orderNotices = (selectedOrder?.items ?? [])
    .flatMap((item) => item.item_notes ?? [])
    .map((itemNote) => itemNote.note);

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
    const total = Number(item.total) || 0;
    const paid = Number(item.amount_paid) || 0;
    const balance = Math.max(total - paid, 0);
    const isPaid = total > 0 && paid >= total;

    const photo = item.items?.[0]?.photo_signed_url;
    const firstItem = item.items?.[0];
    const itemCount = item.items?.length ?? 0;

    const weight =
      firstItem?.weight_kg != null
        ? `${Number(firstItem.weight_kg)} kg`
        : "No weight";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => openOrder(item)}
      >
        <View style={styles.cardImageWrap}>
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.photoPlaceholder]}>
              <Shirt color={colors.primary} size={32} />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.clientName} numberOfLines={1}>
              {item.clients?.name ?? "Unknown client"}
            </Text>

            {isPaid && (
              <BadgeCheck size={18} color={colors.success} />
            )}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {getPricingLabel(firstItem?.pack)} · {item.status.replaceAll("_", " ")}
            {balance > 0 ? ` · ${money(balance)} due` : ""}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Weight size={15} color={colors.textSecondary} />
                <Text style={styles.statText}>{weight}</Text>
              </View>

              <View style={styles.stat}>
                <Shirt size={15} color={colors.textSecondary} />
                <Text style={styles.statText}>{itemCount}</Text>
              </View>

              <View style={styles.stat}>
                <Truck size={15} color={colors.textSecondary} />
                <Text style={styles.statText}>
                  {formatDate(item.delivery_date)}
                </Text>
              </View>
            </View>

            <View style={styles.pillButton}>
              <Plus size={16} color={colors.text} />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

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
        <ActivityIndicator color={colors.primary} style={styles.loader} />
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
                    <Text style={styles.balanceLabel}>
                      Remaining balance
                    </Text>
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

                {/* SPECIAL INSTRUCTIONS */}
                <View style={styles.specialInstructions}>
                  <Text style={styles.sectionTitle}>
                    Special instructions
                  </Text>

                  {orderNotices.length > 0 ? (
                    orderNotices.map((notice, index) => (
                      <Text key={`${index}-${notice}`} style={styles.noticeText}>
                        {notice}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.emptyNotice}>
                      No special instructions were added to this order.
                    </Text>
                  )}
                </View>

                <View style={styles.sectionDivider} />

                <Text style={styles.sectionTitle}>Order checklist</Text>
                <Text style={styles.sectionDescription}>
                  Update each step independently. Changing one won't
                  automatically change the others.
                </Text>

                <View style={styles.actions}>
                  <StatusAction
                    icon={
                      <Droplets
                        size={19}
                        color={
                          selectedOrder.is_washed
                            ? colors.success
                            : colors.textSecondary
                        }
                      />
                    }
                    title="Washed"
                    description="Laundry has been washed"
                    active={selectedOrder.is_washed}
                    onPress={handleWashedToggle}
                    loading={washedMutation.isPending}
                    colors={colors}
                    styles={styles}
                  />

                  <StatusAction
                    icon={
                      <Truck
                        size={19}
                        color={
                          selectedOrder.is_delivered
                            ? colors.success
                            : colors.textSecondary
                        }
                      />
                    }
                    title="Delivered"
                    description="Laundry handed to client"
                    active={selectedOrder.is_delivered}
                    onPress={handleDeliveryToggle}
                    loading={deliveryMutation.isPending}
                    colors={colors}
                    styles={styles}
                  />

                  <StatusAction
                    icon={
                      <CreditCard
                        size={19}
                        color={
                          selectedIsPaid
                            ? colors.success
                            : colors.textSecondary
                        }
                      />
                    }
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

            {orderNotices.length > 0 && (
              <View style={styles.invoiceNoticeContainer}>
                <Text style={styles.invoiceNoticeTitle}>
                  SPECIAL INSTRUCTIONS
                </Text>

                {orderNotices.map((notice, index) => (
                  <Text
                    key={`${index}-${notice}`}
                    style={styles.invoiceNoticeText}
                  >
                    • {notice}
                  </Text>
                ))}
              </View>
            )}

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
  icon: ReactNode;
  label: string;
  value: string;
  styles: OrdersStyles;
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
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  onPress: () => void;
  loading: boolean;
  colors: AppColors;
  styles: OrdersStyles;
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
