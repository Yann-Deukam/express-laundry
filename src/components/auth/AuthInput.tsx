
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

interface AuthInputProps extends TextInputProps {
  label: string;
  password?: boolean;
}

export function AuthInput({
  label,
  password = false,
  style,
  ...inputProps
}: AuthInputProps) {
  const [visible, setVisible] = useState(false);

  const secure = password && !visible;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          {...inputProps}
          style={[styles.input, password && styles.passwordInput, style]}
          secureTextEntry={secure}
          placeholderTextColor="#929BA9"
          selectionColor="#F28C72"
        />

        {password && (
          <Pressable
            onPress={() => setVisible((current) => !current)}
            style={styles.visibilityButton}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              visible ? "Hide password" : "Show password"
            }
          >
            {visible ? (
              <EyeOff size={20} color="#778397" />
            ) : (
              <Eye size={20} color="#778397" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 9,
  },
  label: {
    color: "#263449",
    fontSize: 13,
    fontWeight: "700",
  },
  inputWrapper: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E1E7EF",
    borderRadius: 14,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#263449",
    fontSize: 14,
  },
  passwordInput: {
    paddingRight: 4,
  },
  visibilityButton: {
    width: 48,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});
