
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";

import {
  getOrdersDueSoon,
  getOrdersInProgress,
  getUnpaidOrders,
} from "@/services/orderService";

export function useDashboard() {
  const { businessId, loading: authLoading } = useAuth();

  const enabled = !authLoading && !!businessId;

  const dueSoon = useQuery({
    queryKey: ["dashboard", businessId, "due-soon"],
    queryFn: () => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return getOrdersDueSoon(businessId);
    },
    enabled,
  });

  const inProgress = useQuery({
    queryKey: ["dashboard", businessId, "in-progress"],
    queryFn: () => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return getOrdersInProgress(businessId);
    },
    enabled,
  });

  const unpaid = useQuery({
    queryKey: ["dashboard", businessId, "unpaid"],
    queryFn: () => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return getUnpaidOrders(businessId);
    },
    enabled,
  });

  return {
    dueSoon: dueSoon.data ?? [],
    inProgress: inProgress.data ?? [],
    unpaid: unpaid.data ?? [],

    isLoading:
      authLoading ||
      dueSoon.isLoading ||
      inProgress.isLoading ||
      unpaid.isLoading,

    isError:
      dueSoon.isError ||
      inProgress.isError ||
      unpaid.isError,

    error:
      dueSoon.error ??
      inProgress.error ??
      unpaid.error,

    refetch: async () => {
      return Promise.all([
        dueSoon.refetch(),
        inProgress.refetch(),
        unpaid.refetch(),
      ]);
    },
  };
}
