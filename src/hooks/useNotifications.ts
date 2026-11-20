
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/services/notificationsService";



export const notificationKeys = {
  all: ["notifications"] as const,
  business: (businessId: string, userId: string) =>
    ["notifications", businessId, userId] as const,
};

export function useNotifications() {
  const queryClient = useQueryClient();
  const { businessId, user } = useAuth();

  const queryKey = notificationKeys.business(
    businessId ?? "",
    user?.id ?? ""
  );

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: () =>
      getNotifications(businessId!, user!.id),
    enabled: Boolean(businessId && user?.id),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      markAllNotificationsAsRead(businessId!, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const notifications = notificationsQuery.data ?? [];

  const unreadCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refresh: notificationsQuery.refetch,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
