
import { useQuery } from "@tanstack/react-query";

import {
    getOrdersDueSoon,
    getOrdersInProgress,
    getUnpaidOrders,
} from "@/services/orderService";

export function useDashboard() {
  const dueSoon = useQuery({
    queryKey: ["dashboard", "due-soon"],
    queryFn: getOrdersDueSoon,
  });

  const inProgress = useQuery({
    queryKey: ["dashboard", "in-progress"],
    queryFn: getOrdersInProgress,
  });

  const unpaid = useQuery({
    queryKey: ["dashboard", "unpaid"],
    queryFn: getUnpaidOrders,
  });

  return {
    dueSoon: dueSoon.data ?? [],
    inProgress: inProgress.data ?? [],
    unpaid: unpaid.data ?? [],

    isLoading:
      dueSoon.isLoading ||
      inProgress.isLoading ||
      unpaid.isLoading,

    isError:
      dueSoon.isError ||
      inProgress.isError ||
      unpaid.isError,

    error:
      dueSoon.error ||
      inProgress.error ||
      unpaid.error,

    refetch: async () => {
      await Promise.all([
        dueSoon.refetch(),
        inProgress.refetch(),
        unpaid.refetch(),
      ]);
    },
  };
}
