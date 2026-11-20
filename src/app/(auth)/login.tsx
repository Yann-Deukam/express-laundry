
import { AuthInput } from "@/components/auth/AuthInput";
import { Colors } from "@/constants/colors";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Image,
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


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        Alert.alert(
          "Unable to sign in",
          "Please check your email and password and try again."
        );
        return;
      }

      // AuthProvider receives the session change.
      // Expo Router will automatically unlock the private route.
    } catch (error) {
      console.error("Login error:", error);

      Alert.alert(
        "Something went wrong",
        "Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
            {/* Decorative background panel */}
            <Animated.View
              entering={FadeInUp.duration(700)}
              style={styles.hero}
            >
              <View style={styles.yellowShape} />
              <View style={styles.mintShape} />

              <View style={styles.heroContent}>
                <Image
                    source={require("../../../assets/images/express-laundry.png")}
                    style={{ width: 160, height: 70 }}
                    resizeMode="contain"
                />

                <Text style={styles.heroBrand}>
                  Express Laundry
                </Text>

                <Text style={styles.heroTitle}>
                  Laundry management,{"\n"}made simple.
                </Text>

                <Text style={styles.heroSubtitle}>
                  Everything your business needs, in one place.
                </Text>
              </View>
            </Animated.View>

            {/* Login card */}
            <Animated.View
              entering={FadeInDown.delay(150).springify().damping(18)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.heading}>Welcome back.</Text>

                <Text style={styles.description}>
                  Sign in to access your workspace.
                </Text>
              </View>

              <View style={styles.form}>
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
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  password
                  autoCapitalize="none"
                  autoComplete="current-password"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Signing in..." : "Sign in"}
                </Text>

                {!loading && (
                  <Text style={styles.buttonArrow}>→</Text>
                )}
              </Pressable>

              <View style={styles.divider} />


              <View style={styles.signupPrompt}>
                <Text style={styles.signupText}>
                  Don't have an account?
                </Text>

                <Pressable
                  onPress={() => router.push("/(auth)/signup")}
                  disabled={loading}
                >
                  <Text style={styles.signupLink}>
                    Create account
                  </Text>
                </Pressable>
              </View>


              <Text style={styles.footer}>
                Private workspace · Express Laundry
              </Text>
            </Animated.View>
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
  justifyContent: "center",
  paddingHorizontal: 22,
  paddingVertical: 28,
},

  wrapper: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  hero: {
  height: 250,
  backgroundColor: Colors.coral,
  borderRadius: 34,
  overflow: "hidden",
  justifyContent: "center",
  paddingHorizontal: 30,
  paddingTop: 10,
  marginBottom: -35,
},

  yellowShape: {
    position: "absolute",
    width: 175,
    height: 175,
    borderRadius: 100,
    backgroundColor: Colors.yellow,
    top: 45,
    left: -115,
    opacity: 0.9,
  },

  mintShape: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 110,
    backgroundColor: Colors.mint,
    bottom: -135,
    right: -75,
  },

  heroContent: {
    zIndex: 1,
    alignItems: "center",
    gap: 10,
  },

  heroBrand: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  heroTitle: {
    color: Colors.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.7,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    textAlign: "center",
  },

  card: {
      backgroundColor: Colors.white,
        borderRadius: 32,
        paddingHorizontal: 25,
        paddingTop: 45,
        paddingBottom: 30,
    shadowColor: "#24344F",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 8,
  },

  cardHeader: {
    gap: 8,
    marginBottom: 30,
  },

  heading: {
    color: Colors.text,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  description: {
    color: Colors.textSecondary,
    fontSize: 13,
  },

  form: {
    gap: 21,
  },

  button: {
    marginTop: 30,
    height: 57,
    backgroundColor: Colors.black,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  buttonArrow: {
    color: Colors.white,
    fontSize: 20,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 27,
    marginBottom: 20,
  },

  footer: {
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 11,
  },


signupPrompt: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 5,
  marginBottom: 18,
},

signupText: {
  color: Colors.textSecondary,
  fontSize: 12,
},

signupLink: {
  color: Colors.coral,
  fontSize: 12,
  fontWeight: "800",
},

});
