
import { router } from "expo-router";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock3,
    Info,
    Wallet,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
    useBusinessPricing,
    useUpdateBusinessPricing,
} from "@/hooks/useBusinessPricing";
import {
    useMarkOrderAsPaid,
    useOrders,
} from "@/hooks/useOrders";
import { useTheme } from "@/providers/ThemeProvider";
import type { Order } from "@/services/orderService";

type PaymentTab = "unpaid" | "paid";

const formatMoney = (amount: number) =>
  `${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} FCFA`;

const formatDate = (date: string | null) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PricingPaymentsScreen() {
  const { businessId, role } = useAuth();
  const { colors } = useTheme();

  const pricingQuery = useBusinessPricing(businessId);
  const updatePricing = useUpdateBusinessPricing(businessId);

  const ordersQuery = useOrders();
  const markAsPaid = useMarkOrderAsPaid();

  const [price500, setPrice500] = useState("");
  const [price1000, setPrice1000] = useState("");
  const [activeTab, setActiveTab] = useState<PaymentTab>("unpaid");

  useEffect(() => {
    if (pricingQuery.data) {
      setPrice500(String(pricingQuery.data.price_per_kg_500));
      setPrice1000(String(pricingQuery.data.price_per_kg_1000));
    }
  }, [pricingQuery.data]);

  const canEdit = role === "owner" || role === "admin";

  const orders = ordersQuery.data ?? [];

  const { paidOrders, unpaidOrders, totalPaid, totalUnpaid } =
    useMemo(() => {
      const paid: Order[] = [];
      const unpaid: Order[] = [];

      let paidAmount = 0;
      let unpaidAmount = 0;

      orders.forEach((order) => {
        const total = Number(order.total) || 0;
        const amountPaid = Number(order.amount_paid) || 0;

        if (total > 0 && amountPaid >= total) {
          paid.push(order);
          paidAmount += total;
        } else if (total > 0) {
          unpaid.push(order);
          unpaidAmount += Math.max(total - amountPaid, 0);
        }
      });

      return {
        paidOrders: paid,
        unpaidOrders: unpaid,
        totalPaid: paidAmount,
        totalUnpaid: unpaidAmount,
      };
    }, [orders]);

  const displayedOrders =
    activeTab === "paid" ? paidOrders : unpaidOrders;

  const handleSave = async () => {
    const rate500 = Number(price500);
    const rate1000 = Number(price1000);

    if (
      !price500.trim() ||
      !price1000.trim() ||
      !Number.isFinite(rate500) ||
      !Number.isFinite(rate1000) ||
      rate500 <= 0 ||
      rate1000 <= 0
    ) {
      Alert.alert(
        "Invalid prices",
        "Enter valid prices greater than zero for both packages."
      );
      return;
    }

    try {
      await updatePricing.mutateAsync({
        price_per_kg_500: rate500,
        price_per_kg_1000: rate1000,
      });

      Alert.alert(
        "Saved",
        "Your pricing configuration has been updated."
      );
    } catch (error) {
      Alert.alert(
        "Unable to save",
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your prices."
      );
    }
  };

  const confirmMarkAsPaid = (order: Order) => {
    const clientName = order.clients?.name ?? "this client";

    Alert.alert(
      "Confirm payment",
      `Have you received ${formatMoney(Number(order.total))} from ${clientName} for this order?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, mark as paid",
          onPress: () => {
            markAsPaid.mutate(
              { id: order.id },
              {
                onSuccess: () => {
                  Alert.alert(
                    "Payment recorded",
                    "The full order amount has been recorded as paid."
                  );
                },
                onError: (error) => {
                  Alert.alert(
                    "Unable to record payment",
                    error.message ||
                      "Something went wrong. Please try again."
                  );
                },
              }
            );
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 14,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 3,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      gap: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 5,
    },
    sectionDescription: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 18,
    },
    priceRow: {
      gap: 9,
    },
    priceLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.input,
      paddingHorizontal: 14,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    currency: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    helper: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    saveButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 9,
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 12,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.white,
    },
    infoBox: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: colors.info + "12",
      padding: 15,
      borderRadius: 12,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },
    disabledNote: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    errorText: {
      fontSize: 13,
      color: colors.danger,
      lineHeight: 19,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      gap: 9,
    },
    summaryIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.iconBackground,
      justifyContent: "center",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    summaryAmount: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingVertical: 12,
      borderRadius: 9,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.white,
    },
    tabCount: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    activeTabCount: {
      color: colors.white,
    },
    orderCard: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 13,
    },
    orderTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 10,
    },
    clientName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    orderReference: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
    },
    orderAmount: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    orderDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    detailText: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    markPaidButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 13,
      borderRadius: 11,
    },
    markPaidText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.white,
    },
    paidStatus: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    paidStatusText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.success,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 35,
      paddingHorizontal: 20,
      gap: 10,
    },
    emptyIcon: {
      width: 54,
      height: 54,
      borderRadius: 17,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    emptyDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 19,
    },
  });

  if (pricingQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: 12,
            }}
          >
            Loading pricing...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (pricingQuery.isError || !pricingQuery.data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            Pricing and payments
          </Text>
        </View>

        <View style={{ padding: 20, gap: 14 }}>
          <Text style={styles.errorText}>
            {pricingQuery.error instanceof Error
              ? pricingQuery.error.message
              : "Unable to load your pricing configuration."}
          </Text>

          <Pressable
            onPress={() => pricingQuery.refetch()}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>
              Pricing and payments
            </Text>
            <Text style={styles.headerSubtitle}>
              Manage rates and track received payments
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* PRICING */}

          <View style={{ gap: 5 }}>
            <Text style={styles.sectionTitle}>
              Laundry pricing
            </Text>
            <Text style={styles.sectionDescription}>
              Configure how much your business charges per kilogram.
              These rates will be used when creating new laundry orders.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Standard package
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={price500}
                  onChangeText={setPrice500}
                  editable={canEdit}
                  keyboardType="decimal-pad"
                  placeholder="500"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                />
                <Text style={styles.currency}>FCFA / kg</Text>
              </View>
              <Text style={styles.helper}>
                Current rate:{" "}
                {formatMoney(pricingQuery.data.price_per_kg_500)}/kg
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Premium package
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={price1000}
                  onChangeText={setPrice1000}
                  editable={canEdit}
                  keyboardType="decimal-pad"
                  placeholder="1000"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                />
                <Text style={styles.currency}>FCFA / kg</Text>
              </View>
              <Text style={styles.helper}>
                Current rate:{" "}
                {formatMoney(pricingQuery.data.price_per_kg_1000)}/kg
              </Text>
            </View>

            {canEdit ? (
              <Pressable
                onPress={handleSave}
                disabled={updatePricing.isPending}
                style={[
                  styles.saveButton,
                  {
                    opacity: updatePricing.isPending ? 0.6 : 1,
                  },
                ]}
              >
                {updatePricing.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Check size={18} color={colors.white} />
                )}
                <Text style={styles.saveButtonText}>
                  {updatePricing.isPending
                    ? "Saving..."
                    : "Save changes"}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.disabledNote}>
                Only business owners and administrators can change pricing.
              </Text>
            )}
          </View>

          <View style={styles.infoBox}>
            <Info size={19} color={colors.info} />
            <Text style={styles.infoText}>
              Price changes apply to new orders only. Existing orders and
              previously generated receipts retain their original prices.
            </Text>
          </View>

          {/* PAYMENTS */}

          <View style={{ gap: 5 }}>
            <Text style={styles.sectionTitle}>Payments</Text>
            <Text style={styles.sectionDescription}>
              Keep track of money received and outstanding order balances.
            </Text>
          </View>

          {ordersQuery.isLoading ? (
            <View
              style={{
                paddingVertical: 30,
                alignItems: "center",
                gap: 10,
              }}
            >
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.detailText}>
                Loading payment records...
              </Text>
            </View>
          ) : ordersQuery.isError ? (
            <View style={styles.card}>
              <Text style={styles.errorText}>
                {ordersQuery.error instanceof Error
                  ? ordersQuery.error.message
                  : "Unable to load payment records."}
              </Text>
              <Pressable
                onPress={() => ordersQuery.refetch()}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryIcon}>
                    <CheckCircle2
                      size={19}
                      color={colors.success}
                    />
                  </View>
                  <Text style={styles.summaryLabel}>
                    Total paid
                  </Text>
                  <Text
                    style={styles.summaryAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatMoney(totalPaid)}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    {paidOrders.length} paid orders
                  </Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryIcon}>
                    <Clock3
                      size={19}
                      color={colors.warning}
                    />
                  </View>
                  <Text style={styles.summaryLabel}>
                    Total unpaid
                  </Text>
                  <Text
                    style={styles.summaryAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatMoney(totalUnpaid)}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    {unpaidOrders.length} unpaid orders
                  </Text>
                </View>
              </View>

              <View style={styles.tabs}>
                <Pressable
                  onPress={() => setActiveTab("unpaid")}
                  style={[
                    styles.tab,
                    activeTab === "unpaid" && styles.activeTab,
                  ]}
                >
                  <Clock3
                    size={16}
                    color={
                      activeTab === "unpaid"
                        ? colors.white
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "unpaid" &&
                        styles.activeTabText,
                    ]}
                  >
                    Unpaid
                  </Text>
                  <Text
                    style={[
                      styles.tabCount,
                      activeTab === "unpaid" &&
                        styles.activeTabCount,
                    ]}
                  >
                    {unpaidOrders.length}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveTab("paid")}
                  style={[
                    styles.tab,
                    activeTab === "paid" && styles.activeTab,
                  ]}
                >
                  <CheckCircle2
                    size={16}
                    color={
                      activeTab === "paid"
                        ? colors.white
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "paid" &&
                        styles.activeTabText,
                    ]}
                  >
                    Paid
                  </Text>
                  <Text
                    style={[
                      styles.tabCount,
                      activeTab === "paid" &&
                        styles.activeTabCount,
                    ]}
                  >
                    {paidOrders.length}
                  </Text>
                </Pressable>
              </View>

              {displayedOrders.length === 0 ? (
                <View style={styles.card}>
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      {activeTab === "paid" ? (
                        <Wallet
                          size={24}
                          color={colors.textSecondary}
                        />
                      ) : (
                        <Clock3
                          size={24}
                          color={colors.textSecondary}
                        />
                      )}
                    </View>
                    <Text style={styles.emptyTitle}>
                      {activeTab === "paid"
                        ? "No paid orders yet"
                        : "No unpaid orders"}
                    </Text>
                    <Text style={styles.emptyDescription}>
                      {activeTab === "paid"
                        ? "Orders you mark as paid will appear here."
                        : "All orders with an outstanding balance will appear here."}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {displayedOrders.map((order) => {
                    const isPaid = activeTab === "paid";
                    const isMarkingThisOrder =
                      markAsPaid.isPending &&
                      markAsPaid.variables?.id === order.id;

                    return (
                      <View
                        key={order.id}
                        style={styles.orderCard}
                      >
                        <View style={styles.orderTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.clientName}>
                              {order.clients?.name ??
                                "Unknown client"}
                            </Text>
                            <Text style={styles.orderReference}>
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </Text>
                          </View>

                          <View>
                            <Text style={styles.orderAmount}>
                              {formatMoney(Number(order.total))}
                            </Text>
                            <Text
                              style={[
                                styles.orderReference,
                                { textAlign: "right" },
                              ]}
                            >
                              Order total
                            </Text>
                          </View>
                        </View>

                        <View style={styles.orderDivider} />

                        <Text style={styles.detailText}>
                          Phone: {order.clients?.phone ?? "Not available"}
                        </Text>

                        {isPaid ? (
                          <>
                            <View style={styles.paidStatus}>
                              <CheckCircle2
                                size={16}
                                color={colors.success}
                              />
                              <Text style={styles.paidStatusText}>
                                Payment completed
                              </Text>
                            </View>

                            <Text style={styles.detailText}>
                              Recorded by:{" "}
                              {order.paid_by_name || "Staff member"}
                            </Text>

                            <Text style={styles.detailText}>
                              Payment date: {formatDate(order.paid_at)}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.detailText}>
                              Outstanding:{" "}
                              {formatMoney(
                                Math.max(
                                  Number(order.total) -
                                    Number(order.amount_paid),
                                  0
                                )
                              )}
                            </Text>

                            <Pressable
                              onPress={() =>
                                confirmMarkAsPaid(order)
                              }
                              disabled={markAsPaid.isPending}
                              style={[
                                styles.markPaidButton,
                                {
                                  opacity: markAsPaid.isPending
                                    ? 0.6
                                    : 1,
                                },
                              ]}
                            >
                              {isMarkingThisOrder ? (
                                <ActivityIndicator
                                  size="small"
                                  color={colors.white}
                                />
                              ) : (
                                <CheckCircle2
                                  size={17}
                                  color={colors.white}
                                />
                              )}
                              <Text style={styles.markPaidText}>
                                {isMarkingThisOrder
                                  ? "Recording payment..."
                                  : "Mark as paid"}
                              </Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
