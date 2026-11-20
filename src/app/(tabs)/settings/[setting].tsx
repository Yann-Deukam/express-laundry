import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Construction } from "lucide-react-native";
import { useMemo } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AppColors } from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";

const settingsPages: Record<
  string,
  { title: string; description: string }
> = {
  "business-information": {
    title: "Business information",
    description:
      "Manage your business name, contact details, address and logo.",
  },
  "team-members": {
    title: "Team members",
    description:
      "Invite employees and manage their roles and permissions.",
  },
  "pricing-payments": {
    title: "Pricing and payments",
    description:
      "Configure your laundry pricing and payment preferences.",
  },
  "account-profile": {
    title: "Account profile",
    description:
      "Manage your personal account information.",
  },
  appearance: {
    title: "Appearance",
    description:
      "Customize the appearance of Express Laundry.",
  },
  notifications: {
    title: "Notifications",
    description:
      "Manage your order and delivery notification preferences.",
  },
  "help-support": {
    title: "Help and support",
    description:
      "Find assistance and contact the support team.",
  },
  "about-legal": {
    title: "About and legal",
    description:
      "Application information, privacy policy and terms.",
  },
};

export default function SettingsPlaceholderScreen() {
  const router = useRouter();
  const { setting } = useLocalSearchParams<{
    setting: string;
  }>();

  const { colors } = useTheme();

  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );

  const page = settingsPages[setting ?? ""];

  if (!page) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Page not found</Text>

        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <ArrowLeft
          size={20}
          color={colors.text}
        />
        <Text style={styles.backText}>More</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.icon}>
          <Construction
            color={colors.primary}
            size={28}
          />
        </View>

        <Text style={styles.title}>
          {page.title}
        </Text>

        <Text style={styles.description}>
          {page.description}
        </Text>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            This section is coming soon. We're building
            it as part of the Express Laundry settings
            improvements.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingVertical: 17,
      alignSelf: "flex-start",
    },

    backText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },

    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingBottom: 70,
    },

    icon: {
      width: 62,
      height: 62,
      borderRadius: 19,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },

    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
    },

    description: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 9,
    },

    notice: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 13,
      padding: 15,
      marginTop: 25,
    },

    noticeText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 19,
      textAlign: "center",
    },
  });
}