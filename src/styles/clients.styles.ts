
import { StyleSheet } from "react-native";

import type { AppColors } from "@/constants/colors";

export function createClientStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 18,
    },

    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },

    headerContent: {
      flex: 1,
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 11,
    },

    addButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },

    searchContainer: {
      marginHorizontal: 20,
      marginBottom: 17,
      paddingHorizontal: 14,
      height: 49,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },

    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
    },

    loader: {
      marginTop: 35,
    },

    list: {
      paddingHorizontal: 20,
      paddingBottom: 30,
      gap: 10,
      flexGrow: 1,
    },

    clientCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 12,
    },

    clientCardPressed: {
      opacity: 0.7,
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    clientInfo: {
      flex: 1,
      gap: 4,
    },

    name: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
    },

    phone: {
      color: colors.textSecondary,
      fontSize: 11,
    },

    whatsappIcon: {
      backgroundColor: colors.iconBackground,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 8,
    },

    whatsappText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "700",
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
      lineHeight: 18,
    },

    // Add client modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      padding: 20,
    },

    modalKeyboard: {
      width: "100%",
    },

    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },

    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
    },

    modalSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 22,
    },

    closeButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: colors.surface,
    },

    fieldContainer: {
      gap: 7,
      marginBottom: 16,
    },

    fieldLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "700",
    },

    fieldInput: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      paddingHorizontal: 13,
      color: colors.text,
      backgroundColor: colors.surface,
      fontSize: 13,
    },

    notesInput: {
      minHeight: 90,
      paddingTop: 13,
      textAlignVertical: "top",
    },

    required: {
      color: colors.primary,
    },

    formError: {
      color: "#DC5252",
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 14,
    },

    modalActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 5,
    },

    cancelButton: {
      flex: 1,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    cancelButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },

    submitButton: {
      flex: 1,
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 11,
      backgroundColor: colors.primary,
      gap: 8,
    },

    submitButtonDisabled: {
      opacity: 0.6,
    },

    submitButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
  });
}

export type ClientStyles = ReturnType<typeof createClientStyles>;
