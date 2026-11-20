
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getOrder,
  getOrders,
  markOrderAsPaid,
  updateOrderDelivery,
  updateOrderPayment,
  updateOrderStatus,
  updateOrderWashed,
  type Order,
  type OrderStatus,
} from "@/services/orderService";

import {
  saveLaundryOrder,
  type SaveLaundryOrderInput,
} from "@/services/laundryOrderService";

import { useAuth } from "@/features/auth/hooks/useAuth";

export const orderKeys = {
  all: (businessId: string) =>
    ["orders", businessId] as const,

  lists: (businessId: string) =>
    ["orders", businessId, "list"] as const,

  detail: (businessId: string, id: string) =>
    ["orders", businessId, "detail", id] as const,
};

function requireBusinessId(
  businessId: string | null | undefined
): string {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  return businessId;
}

async function refreshOrderQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  businessId: string,
  updatedOrder?: Order
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: orderKeys.all(businessId),
    }),
    queryClient.invalidateQueries({
      queryKey: ["dashboard", businessId],
    }),
  ]);

  if (updatedOrder) {
    queryClient.setQueryData(
      orderKeys.detail(businessId, updatedOrder.id),
      updatedOrder
    );
  }
}

export function useOrders() {
  const { businessId, loading } = useAuth();

  return useQuery({
    queryKey: businessId
      ? orderKeys.lists(businessId)
      : ["orders", "no-business", "list"],

    queryFn: () => getOrders(requireBusinessId(businessId)),

    enabled: !loading && !!businessId,
  });
}

export function useOrder(id: string) {
  const { businessId, loading } = useAuth();

  return useQuery({
    queryKey: businessId
      ? orderKeys.detail(businessId, id)
      : ["orders", "no-business", "detail", id],

    queryFn: () =>
      getOrder(id, requireBusinessId(businessId)),

    enabled: !loading && !!businessId && !!id,
  });
}

export function useCreateLaundryOrder() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveLaundryOrderInput) =>
      saveLaundryOrder(
        requireBusinessId(businessId),
        input
      ),

    onSuccess: async () => {
      await refreshOrderQueries(
        queryClient,
        requireBusinessId(businessId)
      );
    },
  });
}

export function useUpdateOrderStatus() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: OrderStatus;
    }) =>
      updateOrderStatus(
        id,
        status,
        requireBusinessId(businessId)
      ),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(
        queryClient,
        requireBusinessId(businessId),
        updatedOrder
      );
    },
  });
}

export function useUpdateOrderDelivery() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isDelivered,
    }: {
      id: string;
      isDelivered: boolean;
    }) =>
      updateOrderDelivery(
        id,
        isDelivered,
        requireBusinessId(businessId)
      ),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(
        queryClient,
        requireBusinessId(businessId),
        updatedOrder
      );
    },
  });
}

export function useUpdateOrderWashed() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isWashed,
    }: {
      id: string;
      isWashed: boolean;
    }) =>
      updateOrderWashed(
        id,
        isWashed,
        requireBusinessId(businessId)
      ),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(
        queryClient,
        requireBusinessId(businessId),
        updatedOrder
      );
    },
  });
}

/**
 * Marks an entire order as paid.
 * The service records the full order total, staff member, and timestamp.
 */
export function useMarkOrderAsPaid() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      markOrderAsPaid(
        id,
        requireBusinessId(businessId)
      ),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(
        queryClient,
        requireBusinessId(businessId),
        updatedOrder
      );
    },
  });
}

/**
 * Kept temporarily for compatibility with existing screens.
 * Partial payments are rejected by the service.
 */
export function useUpdateOrderPayment() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      amountPaid,
    }: {
      id: string;
      amountPaid: number;
    }) =>
      updateOrderPayment(
        id,
        amountPaid,
        requireBusinessId(businessId)
      ),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(
        queryClient,
        requireBusinessId(businessId),
        updatedOrder
      );
    },
  });
}
