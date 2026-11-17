import { Scale, Shirt } from "lucide-react-native";
import { useMemo } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import type { PricingPack } from "@/stores/orderDraftStore";
import { formatCurrency } from "@/utils/orderUtils";

interface LaundryDetailsFormProps {
  weight: string;
  pack: PricingPack;
  customPrice: string;
  total: number;
  onWeightChange: (value: string) => void;
  onPackChange: (pack: PricingPack) => void;
  onCustomPriceChange: (value: string) => void;
}

const pricingOptions: {
  value: PricingPack;
  title: string;
  description: string;
}[] = [
  {
    value: "per_kg_500",
    title: "Standard laundry",
    description: "500 FCFA per kg",
  },
  {
    value: "per_kg_1000",
    title: "Premium laundry",
    description: "1,000 FCFA per kg",
  },
  {
    value: "custom",
    title: "Custom price",
    description: "Enter the total order price",
  },
];

export function LaundryDetailsForm({
  weight,
  pack,
  customPrice,
  total,
  onWeightChange,
  onPackChange,
  onCustomPriceChange,
}: LaundryDetailsFormProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.iconContainer}>
          <Shirt size={18} color={colors.primary} />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.title}>Laundry details</Text>
          <Text style={styles.description}>
            Record the total weight and choose your pricing.
          </Text>
        </View>
      </View>

      <View style={styles.weightCard}>
        <View style={styles.weightLabelRow}>
          <Scale size={16} color={colors.primary} />
          <Text style={styles.label}>Total laundry weight</Text>
        </View>

        <View style={styles.weightInputRow}>
          <TextInput
            value={weight}
            onChangeText={onWeightChange}
            placeholder="0.0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            style={styles.weightInput}
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        <Text style={styles.helper}>
          Enter the combined weight of the customer's laundry.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Pricing method</Text>

      <View style={styles.options}>
        {pricingOptions.map((option) => {
          const selected = pack === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onPackChange(option.value)}
              style={[
                styles.option,
                selected && styles.optionSelected,
              ]}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  {option.title}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  selected && styles.radioSelected,
                ]}
              >
                {selected && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {pack === "custom" && (
        <View style={styles.customPriceContainer}>
          <Text style={styles.label}>Custom total price</Text>
          <View style={styles.customPriceRow}>
            <TextInput
              value={customPrice}
              onChangeText={onCustomPriceChange}
              placeholder="e.g. 3500"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              style={styles.customPriceInput}
            />
            <Text style={styles.customPriceUnit}>FCFA</Text>
          </View>
        </View>
      )}

      <View style={styles.totalCard}>
        <View>
          <Text style={styles.totalLabel}>Order total</Text>
          <Text style={styles.totalDescription}>
            {pack === "custom"
              ? "Custom amount entered"
              : `${weight || "0"} kg × ${
                  pack === "per_kg_500" ? "500" : "1,000"
                } FCFA`}
          </Text>
        </View>

        <Text style={styles.totalAmount}>
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      marginBottom: 25,
    },
    heading: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    headingText: {
      flex: 1,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    description: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 3,
    },
    weightCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 15,
      marginBottom: 20,
    },
    weightLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    weightInputRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    weightInput: {
      flex: 1,
      color: colors.text,
      fontSize: 30,
      fontWeight: "700",
      paddingVertical: 2,
    },
    unit: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "600",
    },
    helper: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 5,
    },
    sectionLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 10,
    },
    options: {
      gap: 9,
    },
    option: {
      minHeight: 64,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.iconBackground,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    optionDescription: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },
    radio: {
      width: 19,
      height: 19,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.textSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    customPriceContainer: {
      marginTop: 17,
    },
    customPriceRow: {
      minHeight: 49,
      marginTop: 8,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
    },
    customPriceInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      paddingVertical: 10,
    },
    customPriceUnit: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    totalCard: {
      marginTop: 20,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    totalLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    totalDescription: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 5,
    },
    totalAmount: {
      color: colors.primary,
      fontSize: 17,
      fontWeight: "800",
    },
  });
}