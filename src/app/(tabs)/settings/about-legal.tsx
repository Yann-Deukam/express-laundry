
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    ChevronRight,
    FileText,
    Globe,
    Heart,
    ShieldCheck,
    Smartphone,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Linking,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/ThemeProvider";

// Update these when your official legal pages are published.
const PRIVACY_POLICY_URL = "";
const TERMS_URL = "";

const APP_VERSION = "1.0.0";

export default function AboutLegalScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [openingLink, setOpeningLink] = useState(false);

  async function openLegalPage(url: string, title: string) {
    if (!url) {
      Alert.alert(
        `${title} unavailable`,
        `The ${title.toLowerCase()} link has not been configured yet.`
      );
      return;
    }

    try {
      setOpeningLink(true);
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open page",
        "Please try again later."
      );
    } finally {
      setOpeningLink(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 36,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 26,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>

          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              About and legal
            </Text>
            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 13 }}>
              Information about Express Laundry.
            </Text>
          </View>
        </View>

        {/* App identity */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: 28,
            paddingHorizontal: 20,
            backgroundColor: colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              backgroundColor: colors.background,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <Smartphone size={32} color={colors.primary} />
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: 21,
              fontWeight: "800",
            }}
          >
            Express Laundry
          </Text>

          <Text
            style={{
              color: colors.text,
              opacity: 0.6,
              fontSize: 13,
              marginTop: 6,
            }}
          >
            Laundry management, made simpler.
          </Text>

          <View
            style={{
              marginTop: 16,
              paddingHorizontal: 13,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: colors.background,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              VERSION {APP_VERSION}
            </Text>
          </View>
        </View>

        {/* App information */}
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: "800",
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          Application
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.background,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Globe size={20} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Express Laundry
              </Text>
              <Text
                style={{
                  color: colors.text,
                  opacity: 0.6,
                  fontSize: 12,
                }}
              >
                Your laundry business management platform
              </Text>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.background,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart size={20} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Made for laundry businesses
              </Text>
              <Text
                style={{
                  color: colors.text,
                  opacity: 0.6,
                  fontSize: 12,
                }}
              >
                Helping businesses manage their daily operations.
              </Text>
            </View>
          </View>
        </View>

        {/* Legal */}
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: "800",
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          Legal
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 15,
          }}
        >
          <Pressable
            onPress={() =>
              void openLegalPage(
                PRIVACY_POLICY_URL,
                "Privacy policy"
              )
            }
            disabled={openingLink}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              gap: 13,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.background,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={20} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Privacy policy
              </Text>
              <Text
                style={{
                  color: colors.text,
                  opacity: 0.6,
                  fontSize: 12,
                }}
              >
                How we handle and protect your information
              </Text>
            </View>

            <ChevronRight size={19} color={colors.text} />
          </Pressable>

          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
            }}
          />

          <Pressable
            onPress={() =>
              void openLegalPage(TERMS_URL, "Terms and conditions")
            }
            disabled={openingLink}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              gap: 13,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.background,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={20} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Terms and conditions
              </Text>
              <Text
                style={{
                  color: colors.text,
                  opacity: 0.6,
                  fontSize: 12,
                }}
              >
                Rules and conditions for using the app
              </Text>
            </View>

            <ChevronRight size={19} color={colors.text} />
          </Pressable>
        </View>

        <Text
          style={{
            color: colors.text,
            opacity: 0.5,
            fontSize: 11,
            textAlign: "center",
            marginTop: 26,
          }}
        >
          © {new Date().getFullYear()} Express Laundry. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
