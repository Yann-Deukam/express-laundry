
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    Hash,
    Pencil,
    Save,
    X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/utils/supabase";

interface BusinessInformation {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function BusinessInformationScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { businessId } = useAuth();

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const businessQuery = useQuery({
    queryKey: ["business-information", businessId],
    enabled: Boolean(businessId),
    queryFn: async (): Promise<BusinessInformation> => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, created_at")
        .eq("id", businessId!)
        .single();

      if (error) throw error;

      return data as BusinessInformation;
    },
  });

  const business = businessQuery.data;

  useEffect(() => {
    if (business) {
      setName(business.name);
    }
  }, [business]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (newName: string) => {
      const { data, error } = await supabase
        .from("businesses")
        .update({ name: newName })
        .eq("id", businessId!)
        .select("id, name, slug, created_at")
        .single();

      if (error) throw error;

      return data as BusinessInformation;
    },
    onSuccess: async (updatedBusiness) => {
      queryClient.setQueryData(
        ["business-information", businessId],
        updatedBusiness,
      );

      await queryClient.invalidateQueries({
        queryKey: ["business-information", businessId],
      });

      setName(updatedBusiness.name);
      setIsEditing(false);

      Alert.alert("Changes saved", "Your business name has been updated.");
    },
    onError: (error) => {
      Alert.alert(
        "Update failed",
        error instanceof Error
          ? error.message
          : "Unable to update your business information.",
      );
    },
  });

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Business name required", "Please enter a business name.");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert(
        "Invalid business name",
        "Your business name must contain at least 2 characters.",
      );
      return;
    }

    if (trimmedName === business?.name) {
      setIsEditing(false);
      return;
    }

    updateBusinessMutation.mutate(trimmedName);
  };

  const handleCancel = () => {
    setName(business?.name ?? "");
    setIsEditing(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isSaving = updateBusinessMutation.isPending;

  if (businessQuery.isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading business information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (businessQuery.isError || !business) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
          >
            <ArrowLeft color={colors.text} size={22} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Business information
          </Text>
        </View>

        <View style={styles.centered}>
          <Building2 color={colors.textSecondary} size={38} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Unable to load business
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {businessQuery.error instanceof Error
              ? businessQuery.error.message
              : "Please try again."}
          </Text>

          <Pressable
            onPress={() => businessQuery.refetch()}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft color={colors.text} size={22} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Business information
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage your business details
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.businessCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.businessIcon,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Building2 color={colors.primary} size={28} />
          </View>

          <Text style={[styles.businessName, { color: colors.text }]}>
            {business.name}
          </Text>

          <Text style={[styles.businessLabel, { color: colors.textSecondary }]}>
            Business workspace
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Business details
          </Text>
          {!isEditing && (
            <Pressable
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <Pencil color={colors.primary} size={16} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                Edit
              </Text>
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.detailsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Business name
            </Text>

            {isEditing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter business name"
                placeholderTextColor={colors.textSecondary}
                editable={!isSaving}
                maxLength={100}
                autoCapitalize="words"
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                  },
                ]}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {business.name}
              </Text>
            )}
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Hash color={colors.textSecondary} size={15} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Business slug
              </Text>
            </View>

            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {business.slug}
            </Text>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              This identifier is managed automatically and cannot be edited here.
            </Text>
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <CalendarDays color={colors.textSecondary} size={15} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Date created
              </Text>
            </View>

            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {formatDate(business.created_at)}
            </Text>
          </View>
        </View>

        {isEditing && (
          <View style={styles.actions}>
            <Pressable
              onPress={handleCancel}
              disabled={isSaving}
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <X color={colors.text} size={18} />
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
                isSaving && styles.disabledButton,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Save color="#FFFFFF" size={18} />
              )}
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Saving..." : "Save changes"}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.note}>
          <Check color={colors.success} size={17} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            Your business information is securely stored in your Express
            Laundry workspace.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  content: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  businessCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
  },
  businessIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  businessLabel: {
    fontSize: 13,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  field: {
    paddingVertical: 17,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 7,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 17,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.65,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 22,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
  },
});
