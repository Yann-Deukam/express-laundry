import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";

type DateField = "pickup" | "delivery";

interface OrderDateFieldsProps {
  pickupDate: string;
  deliveryDate: string;
  onPickupChange: (date: string) => void;
  onDeliveryChange: (date: string) => void;
}

function parseDate(value: string): Date {
  const date = value ? new Date(value) : new Date();

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function displayDate(value: string): string {
  if (!value) return "Choose a date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Choose a date";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrderDateFields({
  pickupDate,
  deliveryDate,
  onPickupChange,
  onDeliveryChange,
}: OrderDateFieldsProps) {
  const { colors } = useTheme();
  const [activeField, setActiveField] = useState<DateField | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const currentValue =
    activeField === "pickup" ? pickupDate : deliveryDate;

  const minimumDate =
    activeField === "delivery" && pickupDate
      ? parseDate(pickupDate)
      : undefined;

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android" && event.type === "dismissed") {
      setActiveField(null);
      return;
    }

    if (!selected || !activeField) return;

    const isoDate = selected.toISOString();

    if (activeField === "pickup") {
      onPickupChange(isoDate);

      // Keep delivery date valid if pickup is moved forward.
      if (deliveryDate && selected > parseDate(deliveryDate)) {
        onDeliveryChange(isoDate);
      }
    } else {
      onDeliveryChange(isoDate);
    }

    if (Platform.OS === "android") {
      setActiveField(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.iconContainer}>
          <CalendarDays size={18} color={colors.primary} />
        </View>
        <View style={styles.headingText}>
          <Text style={styles.title}>Order dates</Text>
          <Text style={styles.description}>
            Set collection and expected delivery.
          </Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateColumn}>
          <Text style={styles.label}>Pickup date</Text>
          <Pressable
            onPress={() => setActiveField("pickup")}
            style={styles.dateButton}
          >
            <Text
              style={[
                styles.dateText,
                !pickupDate && styles.placeholder,
              ]}
            >
              {displayDate(pickupDate)}
            </Text>
          </Pressable>
        </View>

        <View style={styles.dateColumn}>
          <Text style={styles.label}>Delivery date</Text>
          <Pressable
            onPress={() => setActiveField("delivery")}
            style={styles.dateButton}
          >
            <Text
              style={[
                styles.dateText,
                !deliveryDate && styles.placeholder,
              ]}
            >
              {displayDate(deliveryDate)}
            </Text>
          </Pressable>
        </View>
      </View>

      {activeField && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={parseDate(currentValue)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minimumDate}
            onChange={handleChange}
            style={styles.picker}
          />

          {Platform.OS === "ios" && (
            <Pressable
              onPress={() => setActiveField(null)}
              style={styles.doneButton}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      marginBottom: 28,
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
    dateRow: {
      flexDirection: "row",
      gap: 12,
    },
    dateColumn: {
      flex: 1,
    },
    label: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 8,
    },
    dateButton: {
      minHeight: 52,
      paddingHorizontal: 11,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.surface,
    },
    dateText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    placeholder: {
      color: colors.textSecondary,
      fontWeight: "400",
    },
    pickerContainer: {
      marginTop: 14,
      padding: 10,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    picker: {
      alignSelf: "center",
    },
    doneButton: {
      alignSelf: "flex-end",
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    doneText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
  });
}