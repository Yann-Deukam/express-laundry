import { StyleSheet } from "react-native";

import type { AppColors } from "@/constants/colors";

export function createSettingsStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 20,
      paddingBottom: 35,
    },

    header: {
      paddingTop: 20,
      paddingBottom: 22,
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

    businessCard: {
      backgroundColor: colors.surface,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },

    businessIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    businessName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "800",
    },

    businessDetails: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },

    accountCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 2,
      marginBottom: 20,
      paddingHorizontal: 2,
    },

    accountAvatar: {
      width: 37,
      height: 37,
      borderRadius: 19,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    accountInitial: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "800",
    },

    accountName: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "700",
    },

    accountDetails: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 3,
    },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },

    logoutButton: {
      marginTop: 4,
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },

    logoutText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: "800",
    },

    disabled: {
      opacity: 0.5,
    },

    footer: {
      alignItems: "center",
      marginTop: 22,
    },

    footerText: {
      color: colors.textSecondary,
      fontSize: 10,
    },
  });
}

export type MoreStyles = ReturnType<typeof createSettingsStyles>;