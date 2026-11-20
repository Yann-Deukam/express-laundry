
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Crown,
    MoreVertical,
    Plus,
    RefreshCw,
    ShieldCheck,
    UserRound,
    Users
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/utils/supabase";

interface TeamMember {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function TeamMembersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { colors } = useTheme();
  const { businessId, user } = useAuth();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    null,
  );

  const membersQuery = useQuery({
    queryKey: ["team-members", businessId],
    enabled: Boolean(businessId),
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from("business_members")
        .select(`
          id,
          business_id,
          user_id,
          role,
          created_at,
          profile:profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("business_id", businessId!)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data ?? []) as unknown as TeamMember[];
    },
  });

  const members = membersQuery.data ?? [];

  const currentMember = useMemo(
    () => members.find((member) => member.user_id === user?.id),
    [members, user?.id],
  );

  const isAdmin =
    currentMember?.role === "owner" ||
    currentMember?.role === "admin";

  const owner = members.find((member) => member.role === "owner");

  const removeMemberMutation = useMutation({
    mutationFn: async (member: TeamMember) => {
      if (!isAdmin) {
        throw new Error("You do not have permission to remove team members.");
      }

      if (member.role === "owner") {
        throw new Error("The business owner cannot be removed.");
      }

      const { error } = await supabase
        .from("business_members")
        .delete()
        .eq("id", member.id)
        .eq("business_id", businessId!);

      if (error) throw error;
    },
    onSuccess: async () => {
      setSelectedMemberId(null);

      await queryClient.invalidateQueries({
        queryKey: ["team-members", businessId],
      });

      Alert.alert("Member removed", "The team member has been removed.");
    },
    onError: (error) => {
      Alert.alert(
        "Unable to remove member",
        error instanceof Error ? error.message : "Please try again.",
      );
    },
  });

  const handleRemoveMember = useCallback(
    (member: TeamMember) => {
      if (!isAdmin) {
        Alert.alert(
          "Permission required",
          "Only a business administrator can remove team members.",
        );
        return;
      }

      if (member.role === "owner") {
        Alert.alert(
          "Owner protected",
          "The business owner cannot be removed.",
        );
        return;
      }

      Alert.alert(
        "Remove team member",
        `Are you sure you want to remove ${
          member.profile?.full_name || "this member"
        } from your business?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removeMemberMutation.mutate(member),
          },
        ],
      );
    },
    [isAdmin, removeMemberMutation],
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const renderMember = ({ item }: { item: TeamMember }) => {
    const isOwner = item.role === "owner";
    const isCurrentUser = item.user_id === user?.id;
    const isSelected = selectedMemberId === item.id;

    const displayName =
      item.profile?.full_name?.trim() ||
      (isCurrentUser ? "You" : "Team member");

    return (
      <View
        style={[
          styles.memberCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          {isOwner ? (
            <Crown color={colors.primary} size={21} />
          ) : (
            <UserRound color={colors.primary} size={21} />
          )}
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.memberName, { color: colors.text }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            {isCurrentUser && (
              <Text
                style={[styles.youLabel, { color: colors.primary }]}
              >
                You
              </Text>
            )}
          </View>

          <View style={styles.roleRow}>
            <ShieldCheck
              color={isOwner ? colors.primary : colors.textSecondary}
              size={13}
            />
            <Text
              style={[
                styles.roleText,
                { color: colors.textSecondary },
              ]}
            >
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
          </View>

          <Text
            style={[styles.joinedText, { color: colors.textSecondary }]}
          >
            Joined {formatDate(item.created_at)}
          </Text>
        </View>

        {isOwner ? (
          <View
            style={[
              styles.ownerBadge,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.ownerBadgeText, { color: colors.primary }]}>
              Owner
            </Text>
          </View>
        ) : isAdmin ? (
          <Pressable
            onPress={() =>
              setSelectedMemberId(isSelected ? null : item.id)
            }
            style={styles.moreButton}
            hitSlop={8}
          >
            <MoreVertical color={colors.textSecondary} size={20} />
          </Pressable>
        ) : null}

        {isSelected && isAdmin && (
          <View
            style={[
              styles.memberActions,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              onPress={() => handleRemoveMember(item)}
              disabled={removeMemberMutation.isPending}
              style={styles.removeButton}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                Remove member
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  if (!businessId) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No business found
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Your business workspace could not be loaded.
          </Text>
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
          style={[
            styles.backButton,
            { backgroundColor: colors.surface },
          ]}
        >
          <ArrowLeft color={colors.text} size={22} />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Team members
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: colors.textSecondary },
            ]}
          >
            Manage your business team
          </Text>
        </View>

        <Pressable
          onPress={() => membersQuery.refetch()}
          style={[
            styles.refreshButton,
            { backgroundColor: colors.surface },
          ]}
        >
          <RefreshCw color={colors.text} size={19} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Users color={colors.primary} size={23} />
          </View>

          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryCount, { color: colors.text }]}>
              {members.length}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                { color: colors.textSecondary },
              ]}
            >
              {members.length === 1 ? "Team member" : "Team members"}
            </Text>
          </View>

          {isAdmin && (
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Team invitations",
                  "The secure invitation feature will be added next.",
                )
              }
              style={[
                styles.addButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Plus color="#FFFFFF" size={18} />
              <Text style={styles.addButtonText}>Invite</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your team
          </Text>
          <Text
            style={[
              styles.sectionCount,
              { color: colors.textSecondary },
            ]}
          >
            {members.length} {members.length === 1 ? "member" : "members"}
          </Text>
        </View>

        {membersQuery.isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text
              style={[
                styles.emptyDescription,
                { color: colors.textSecondary },
              ]}
            >
              Loading team members...
            </Text>
          </View>
        ) : membersQuery.isError ? (
          <View style={styles.centered}>
            <Users color={colors.textSecondary} size={36} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Unable to load your team
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                { color: colors.textSecondary },
              ]}
            >
              {membersQuery.error instanceof Error
                ? membersQuery.error.message
                : "Please check your connection and try again."}
            </Text>
            <Pressable
              onPress={() => membersQuery.refetch()}
              style={[
                styles.retryButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={renderMember}
            contentContainerStyle={[
              styles.listContent,
              members.length === 0 && styles.emptyList,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={membersQuery.isRefetching}
                onRefresh={async () => {
                    await membersQuery.refetch();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Users color={colors.textSecondary} size={38} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No team members yet
                </Text>
                <Text
                  style={[
                    styles.emptyDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Your team members will appear here when they join your business.
                </Text>
              </View>
            }
          />
        )}

        {owner && (
          <View
            style={[
              styles.ownerNote,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Crown color={colors.primary} size={16} />
            <Text style={[styles.ownerNoteText, { color: colors.text }]}>
              {owner.profile?.full_name || "The business owner"} owns this workspace.
            </Text>
          </View>
        )}
      </View>
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
  headerInfo: {
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryInfo: {
    flex: 1,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 12,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  memberCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  memberInfo: {
    flex: 1,
    minWidth: 100,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  youLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "500",
  },
  joinedText: {
    fontSize: 10,
    marginTop: 5,
  },
  ownerBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  moreButton: {
    padding: 5,
  },
  memberActions: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 9,
    padding: 10,
  },
  removeButton: {
    paddingVertical: 4,
  },
  removeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  ownerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: 11,
    marginBottom: 14,
  },
  ownerNoteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
});
