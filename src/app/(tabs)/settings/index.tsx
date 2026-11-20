
import { SettingsRow } from "@/components/settings/SettingRow";
import { SettingsSection } from "@/components/settings/SettingSection";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { queryClient } from "@/lib/queryClient";
import { useTheme } from "@/providers/ThemeProvider";
import { createSettingsStyles } from "@/styles/settings.styles";
import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
    Bell,
    Building2,
    CircleHelp,
    Info,
    LogOut,
    Palette,
    UserRound,
    Users,
    Wallet,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MoreScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();
  const { user, business, role } = useAuth();

  const { unreadCount } = useNotifications();

  const styles = useMemo(
    () => createSettingsStyles(colors),
    [colors]
  );

  const userEmail = user?.email ?? "No email available";
  const businessName = business?.name ?? "Your business";

  const userInitial = (
    user?.email?.trim().charAt(0) || "U"
  ).toUpperCase();

  function navigate(setting: string) {
    router.push(`/(tabs)/settings/${setting}` as never);
  }

  function openNotifications() {
    navigate("notifications");
  }

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      queryClient.clear();

      await AsyncStorage.removeItem(
        "express-laundry-query-cache"
      );
    } catch (error) {
      console.error("Logout failed:", error);

      Alert.alert(
        "Unable to sign out",
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmLogout() {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of Express Laundry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => void handleLogout(),
        },
      ]
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>WORKSPACE</Text>
            <Text style={styles.title}>More</Text>
            <Text style={styles.subtitle}>
              Manage your business and account.
            </Text>
          </View>

          <Pressable
            onPress={openNotifications}
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
          >
            <Bell color={colors.text} size={21} />

            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  minWidth: 19,
                  height: 19,
                  borderRadius: 10,
                  backgroundColor: colors.danger,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                  borderWidth: 2,
                  borderColor: colors.background,
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 9,
                    fontWeight: "800",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Active business */}
        <Pressable
          style={styles.businessCard}
          onPress={() => navigate("business-information")}
        >
          <View style={styles.businessIcon}>
            <Building2
              color={colors.primary}
              size={22}
            />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.businessName}>
              {businessName}
            </Text>

            <Text style={styles.businessDetails}>
              Business profile · {role ?? "Member"}
            </Text>
          </View>
        </Pressable>

        {/* Business management */}
        <SettingsSection
          title="Business management"
          colors={colors}
        >
          <SettingsRow
            icon={Building2}
            title="Business information"
            description="Name, contact details and address"
            colors={colors}
            onPress={() => navigate("business-information")}
          />

          <View style={styles.separator} />

          <SettingsRow
            icon={Users}
            title="Team members"
            description="Manage staff and access permissions"
            colors={colors}
            onPress={() => navigate("team-members")}
          />

          <View style={styles.separator} />

          <SettingsRow
            icon={Wallet}
            title="Pricing and payments"
            description="Pricing packs and payment preferences"
            colors={colors}
            onPress={() => navigate("pricing-payments")}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection
          title="Account"
          colors={colors}
        >
          <SettingsRow
            icon={UserRound}
            title="Account profile"
            description="Personal details and account information"
            colors={colors}
            onPress={() => navigate("account-profile")}
          />

          <View style={styles.separator} />

          <View style={styles.accountCard}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountInitial}>
                {userInitial}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>
                {userEmail}
              </Text>

              <Text style={styles.accountDetails}>
                {role ?? "Business member"}
              </Text>
            </View>
          </View>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection
          title="Preferences"
          colors={colors}
        >
          <SettingsRow
            icon={Palette}
            title="Appearance"
            description="Light and dark mode"
            colors={colors}
            onPress={() => navigate("appearance")}
          />

          <View style={styles.separator} />

          <SettingsRow
            icon={Bell}
            title="Notifications"
            description={
              unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "Order and delivery notifications"
            }
            colors={colors}
            onPress={openNotifications}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection
          title="Support"
          colors={colors}
        >
          <SettingsRow
            icon={CircleHelp}
            title="Help and support"
            description="Get assistance and report a problem"
            colors={colors}
            onPress={() => navigate("help-support")}
          />

          <View style={styles.separator} />

          <SettingsRow
            icon={Info}
            title="About and legal"
            description="Version, privacy policy and terms"
            colors={colors}
            onPress={() => navigate("about-legal")}
          />
        </SettingsSection>

        {/* Sign out */}
        <Pressable
          style={[
            styles.logoutButton,
            loading && styles.disabled,
          ]}
          onPress={confirmLogout}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <LogOut
            size={19}
            color={colors.danger}
          />

          <Text style={styles.logoutText}>
            {loading ? "Signing out..." : "Sign out"}
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Express Laundry · Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
