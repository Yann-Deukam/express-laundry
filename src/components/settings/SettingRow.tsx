import { ChevronRight } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";

import type { AppColors } from "@/constants/colors";

interface SettingsRowProps {
  icon: ComponentType<{ color?: string; size?: number }>;
  title: string;
  description?: string;
  colors: AppColors;
  onPress: () => void;
}

export function SettingsRow({
  icon: Icon,
  title,
  description,
  colors,
  onPress,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          gap: 12,
          opacity: pressed ? 0.65 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.iconBackground,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon color={colors.primary} size={19} />
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>

        {description ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <ChevronRight color={colors.textSecondary} size={19} />
    </Pressable>
  );
}