import {
    MessageCircle,
    Pencil,
    UserRound,
} from "lucide-react-native";

import {
    Pressable,
    Text,
    View,
} from "react-native";

import type { Client } from "@/services/orderService";
import { ClientStyles } from "@/styles/clients.styles";
import { contactClient } from "@/utils/clientContact";

interface ClientCardProps {
  client: Client;
  styles: ClientStyles;
  primaryColor: string;
  onEdit: (client: Client) => void;
}

export function ClientCard({
  client,
  styles,
  primaryColor,
  onEdit,
}: ClientCardProps) {
  return (
    <View style={styles.clientCard}>
      <View style={styles.avatar}>
        <UserRound size={20} color={primaryColor} />
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.name}>{client.name}</Text>
        <Text style={styles.phone}>{client.phone}</Text>
      </View>

      <Pressable
        onPress={() => onEdit(client)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${client.name}`}
        style={{
          padding: 9,
          borderRadius: 10,
          marginRight: 5,
        }}
      >
        <Pencil size={18} color={primaryColor} />
      </Pressable>

      <Pressable
        onPress={() => void contactClient(client.phone)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Contact ${client.name} on WhatsApp`}
        style={styles.whatsappIcon}
      >
        <MessageCircle size={20} color={primaryColor} />
      </Pressable>
    </View>
  );
}