
import { Alert, Linking } from "react-native";

export function normalizePhoneNumber(phone: string): string {
  let number = phone.replace(/[^\d+]/g, "");

  if (number.startsWith("00")) {
    number = number.slice(2);
  }

  number = number.replace(/\+/g, "");

  // Convert a local Cameroon mobile number to international format.
  if (number.length === 9 && number.startsWith("6")) {
    number = `237${number}`;
  }

  return number;
}

export async function contactClient(phone: string): Promise<void> {
  const number = normalizePhoneNumber(phone);

  if (!number) {
    Alert.alert(
      "Invalid phone number",
      "This client has no valid phone number."
    );
    return;
  }

  const whatsappUrl = `whatsapp://send?phone=${number}`;
  const phoneUrl = `tel:${number}`;

  try {
    await Linking.openURL(whatsappUrl);
  } catch {
    try {
      await Linking.openURL(phoneUrl);
    } catch {
      Alert.alert(
        "Unable to contact client",
        "Neither WhatsApp nor the phone app could be opened on this device."
      );
    }
  }
}
