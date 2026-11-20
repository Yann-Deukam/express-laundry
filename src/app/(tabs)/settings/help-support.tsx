
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    Mail,
    MessageCircle,
    MessageSquareWarning,
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

// Replace these with your official support details.
const SUPPORT_EMAIL: string = "contact@codees-cm.com";
const SUPPORT_WHATSAPP: string = "°237 697 443 248";

const FAQS = [
  {
    question: "How do I create a new order?",
    answer:
      "Open the Orders section and select the option to create a new order. Choose or add a client, enter the laundry details, and save the order.",
  },
  {
    question: "How can I update an order's status?",
    answer:
      "Open the order you want to update and select the appropriate status. The available stages include received, awaiting validation, confirmed, washing, ironing, ready, and delivered.",
  },
  {
    question: "How do I add a team member?",
    answer:
      "Go to More, open Team members, and use the option to invite or add a team member. Available actions depend on your account permissions.",
  },
  {
    question: "How can I change my business prices?",
    answer:
      "Open More, select Pricing and payments, and update your laundry pricing packs. Your updated prices will be used when creating new orders.",
  },
  {
    question: "Can I use Express Laundry in dark mode?",
    answer:
      "Yes. Open More and use the Appearance switch under Preferences to change between light and dark mode.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const openSupportEmail = async (report = false) => {
    if (!SUPPORT_EMAIL) {
      Alert.alert(
        "Support email unavailable",
        "The official support email has not been configured yet."
      );
      return;
    }

    const subject = report
      ? "Express Laundry - Problem Report"
      : "Express Laundry - Support Request";

    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open email",
        "Please check that an email application is configured on your device."
      );
    }
  };

  const openWhatsApp = async () => {
    if (!SUPPORT_WHATSAPP) {
      Alert.alert(
        "WhatsApp support unavailable",
        "The official WhatsApp support number has not been configured yet."
      );
      return;
    }

    const number = SUPPORT_WHATSAPP.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${number}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open WhatsApp",
        "Please make sure WhatsApp is installed on your device."
      );
    }
  };

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
              Help and support
            </Text>
            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 13 }}>
              We're here to help you.
            </Text>
          </View>
        </View>

        {/* Contact support */}
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: "800",
            marginBottom: 12,
          }}
        >
          Contact us
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
            onPress={() => void openSupportEmail()}
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
              <Mail size={20} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>
                Email support
              </Text>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 }}>
                Get help with your account or business
              </Text>
            </View>

            <ChevronRight size={19} color={colors.text} />
          </Pressable>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          <Pressable
            onPress={() => void openWhatsApp()}
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
              <MessageCircle size={20} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>
                WhatsApp support
              </Text>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 }}>
                Chat with our support team
              </Text>
            </View>

            <ChevronRight size={19} color={colors.text} />
          </Pressable>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          <Pressable
            onPress={() => void openSupportEmail(true)}
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
              <MessageSquareWarning size={20} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>
                Report a problem
              </Text>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 }}>
                Tell us about a bug or technical issue
              </Text>
            </View>

            <ChevronRight size={19} color={colors.text} />
          </Pressable>
        </View>

        {/* FAQs */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 9,
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          <CircleHelp size={19} color={colors.primary} />
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              fontWeight: "800",
            }}
          >
            Frequently asked questions
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 15,
          }}
        >
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;

            return (
              <View key={faq.question}>
                <Pressable
                  onPress={() =>
                    setExpandedFaq(isExpanded ? null : index)
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 17,
                    gap: 12,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontSize: 13,
                      fontWeight: "700",
                      lineHeight: 19,
                    }}
                  >
                    {faq.question}
                  </Text>

                  <ChevronDown
                    size={18}
                    color={colors.text}
                    style={{
                      transform: [
                        { rotate: isExpanded ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </Pressable>

                {isExpanded && (
                  <Text
                    style={{
                      color: colors.text,
                      opacity: 0.7,
                      fontSize: 13,
                      lineHeight: 21,
                      paddingBottom: 16,
                      paddingRight: 20,
                    }}
                  >
                    {faq.answer}
                  </Text>
                )}

                {index !== FAQS.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        <Text
          style={{
            color: colors.text,
            opacity: 0.5,
            fontSize: 11,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Express Laundry · We're happy to help.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
