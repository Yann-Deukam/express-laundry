
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/components/auth/AuthInput";
import { Colors } from "@/constants/colors";
import { supabase } from "@/utils/supabase";

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    const normalizedName = fullName.trim();
    const normalizedBusiness = businessName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedName ||
      !normalizedBusiness ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing information",
        "Please complete all fields before continuing."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak password",
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords don't match",
        "Please make sure both passwords are identical."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
          },
        },
      });

      if (error) throw error;

      // A session is needed to call the authenticated business RPC.
      if (!data.session) {
        Alert.alert(
          "Verify your email",
          "Your account has been created, but email confirmation is enabled. Please verify your email first. Business creation must be completed after verification.",
          [
            {
              text: "Go to sign in",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]
        );
        return;
      }

      const { error: businessError } = await supabase.rpc(
        "create_business",
        {
          _business_name: normalizedBusiness,
        }
      );

      if (businessError) {
        console.error("Business creation failed:", businessError);

        Alert.alert(
          "Account created",
          "Your account was created, but we couldn't finish setting up your business. Please sign in and contact support."
        );
        return;
      }

      Alert.alert(
        "Welcome to Express Laundry!",
        "Your account and business workspace have been created successfully."
      );

      // AuthProvider listens for the session change and handles
      // navigation to the authenticated part of the app.
    } catch (error) {
      console.error("Signup error:", error);

      Alert.alert(
        "Unable to create account",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            {/* Back navigation */}
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
            >
              <ArrowLeft size={20} color={Colors.text} />
            </Pressable>

            {/* Heading */}
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={styles.header}
            >
              <View style={styles.iconContainer}>
                <BriefcaseBusiness
                  size={27}
                  color={Colors.coral}
                />
              </View>

              <Text style={styles.eyebrow}>
                GET STARTED
              </Text>

              <Text style={styles.heading}>
                Create your workspace.
              </Text>

              <Text style={styles.description}>
                Set up your account and register your laundry
                business to get started with Express Laundry.
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(120).springify().damping(18)}
              style={styles.card}
            >
              <View style={styles.form}>
                <AuthInput
                  label="Full name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  editable={!loading}
                  returnKeyType="next"
                />

                <AuthInput
                  label="Business name"
                  placeholder="e.g. Express Laundry"
                  value={businessName}
                  onChangeText={setBusinessName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="next"
                />

                <AuthInput
                  label="Email address"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!loading}
                  returnKeyType="next"
                />

                <AuthInput
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  password
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!loading}
                  returnKeyType="next"
                />

                <AuthInput
                  label="Confirm password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  password
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSignup()}
                />
              </View>

              <Pressable
                onPress={() => void handleSignup()}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  {loading
                    ? "Creating your workspace..."
                    : "Create business account"}
                </Text>

                {!loading && (
                  <Text style={styles.buttonArrow}>→</Text>
                )}
              </Pressable>

              <View style={styles.divider} />

              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>
                  Already have an account?
                </Text>

                <Pressable
                  onPress={() => router.replace("/(auth)/login")}
                  disabled={loading}
                >
                  <Text style={styles.loginLink}>
                    Sign in
                  </Text>
                </Pressable>
              </View>
            </Animated.View>

            <Text style={styles.footer}>
              Private workspace · Express Laundry
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF0F7",
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  wrapper: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    gap: 9,
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  eyebrow: {
    color: Colors.coral,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heading: {
    color: Colors.text,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 320,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 25,
    shadowColor: "#24344F",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 6,
  },
  form: {
    gap: 18,
  },
  button: {
    marginTop: 26,
    minHeight: 56,
    backgroundColor: Colors.black,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonArrow: {
    color: Colors.white,
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 24,
    marginBottom: 20,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  loginLink: {
    color: Colors.coral,
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 11,
    marginTop: 22,
  },
});
