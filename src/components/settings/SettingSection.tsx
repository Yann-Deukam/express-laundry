import type { ReactNode } from "react";
import { Text, View } from "react-native";

import type { AppColors } from "@/constants/colors";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  colors: AppColors;
}

export function SettingsSection({
  title,
  children,
  colors,
}: SettingsSectionProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 17,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 9,
          fontWeight: "800",
          letterSpacing: 1.2,
          marginTop: 17,
          marginBottom: 5,
        }}
      >
        {title.toUpperCase()}
      </Text>

      {children}
    </View>
  );
}