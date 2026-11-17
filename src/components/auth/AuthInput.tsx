
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";

import { Colors } from "../../constants/colors";

type Props = TextInputProps & {
  label: string;
  password?: boolean;
};

export function AuthInput({
  label,
  password = false,
  secureTextEntry,
  ...inputProps
}: Props) {
  const [visible, setVisible] = useState(false);

  const hidePassword = password && !visible;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor="#969BA5"
          secureTextEntry={password ? hidePassword : secureTextEntry}
        />

        {password && (
          <Pressable
            onPress={() => setVisible((value) => !value)}
            style={styles.visibility}
            accessibilityLabel={
              visible ? "Hide password" : "Show password"
            }
          >
            <Text style={styles.eye}>
              {visible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 9,
  },

  label: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },

  inputContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.input,
    borderRadius: 15,
    paddingHorizontal: 17,
  },

  input: {
    flex: 1,
    height: "100%",
    color: Colors.text,
    fontSize: 14,
  },

  visibility: {
    padding: 8,
  },

  eye: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});
