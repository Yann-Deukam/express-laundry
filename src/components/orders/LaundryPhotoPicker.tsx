import * as ImagePicker from "expo-image-picker";
import { Camera, RotateCcw, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";

interface LaundryPhotoPickerProps {
  photoUri: string | null;
  onPhotoChange: (uri: string | null) => void;
}

export function LaundryPhotoPicker({
  photoUri,
  onPhotoChange,
}: LaundryPhotoPickerProps) {
  const { colors } = useTheme();
  const [openingCamera, setOpeningCamera] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  async function takePhoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera permission required",
          "Allow camera access to photograph the laundry weighing."
        );
        return;
      }

      setOpeningCamera(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.canceled && result.assets.length > 0) {
        onPhotoChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Could not open camera:", error);

      Alert.alert(
        "Camera unavailable",
        "We couldn't open the camera. Please try again."
      );
    } finally {
      setOpeningCamera(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Weighing photo</Text>
          <Text style={styles.description}>
            Take a photo of the laundry on the scale.
          </Text>
        </View>
        <Camera size={19} color={colors.primary} />
      </View>

      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.preview}
            resizeMode="cover"
          />

          <View style={styles.photoActions}>
            <Pressable
              onPress={takePhoto}
              disabled={openingCamera}
              style={styles.secondaryAction}
            >
              <RotateCcw size={16} color={colors.text} />
              <Text style={styles.secondaryActionText}>Retake</Text>
            </Pressable>

            <Pressable
              onPress={() => onPhotoChange(null)}
              style={styles.removeAction}
            >
              <Trash2 size={16} color={colors.danger} />
              <Text style={styles.removeActionText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={takePhoto}
          disabled={openingCamera}
          style={styles.captureButton}
        >
          {openingCamera ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={styles.cameraIcon}>
              <Camera size={22} color={colors.primary} />
            </View>
          )}

          <Text style={styles.captureTitle}>
            {openingCamera ? "Opening camera..." : "Take weighing photo"}
          </Text>

          <Text style={styles.captureDescription}>
            Use your phone camera to capture the laundry weight.
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      marginBottom: 25,
    },
    heading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    description: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },
    captureButton: {
      minHeight: 145,
      padding: 18,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    cameraIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    captureTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 8,
    },
    captureDescription: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: "center",
      marginTop: 5,
    },
    previewContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    preview: {
      width: "100%",
      height: 210,
      backgroundColor: colors.surface,
    },
    photoActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 12,
    },
    secondaryAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingVertical: 5,
    },
    secondaryActionText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    removeAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingVertical: 5,
    },
    removeActionText: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: "600",
    },
  });
}