
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getOrder,
  getOrders,
  updateOrderDelivery,
  updateOrderPayment,
  updateOrderStatus,
  updateOrderWashed,
  type OrderStatus,
} from "@/services/orderService";

import {
  saveLaundryOrder,
  type SaveLaundryOrderInput,
} from "@/services/laundryOrderService";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

async function refreshOrderQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  updatedOrder: Awaited<ReturnType<typeof getOrder>>
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: orderKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: ["dashboard"],
    }),
  ]);

  queryClient.setQueryData(
    orderKeys.detail(updatedOrder.id),
    updatedOrder
  );
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: getOrders,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
}

export function useCreateLaundryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveLaundryOrderInput) =>
      saveLaundryOrder(input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orderKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: OrderStatus;
    }) => updateOrderStatus(id, status),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(queryClient, updatedOrder);
    },
  });
}

export function useUpdateOrderDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isDelivered,
    }: {
      id: string;
      isDelivered: boolean;
    }) => updateOrderDelivery(id, isDelivered),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(queryClient, updatedOrder);
    },
  });
}

export function useUpdateOrderWashed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isWashed,
    }: {
      id: string;
      isWashed: boolean;
    }) => updateOrderWashed(id, isWashed),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(queryClient, updatedOrder);
    },
  });
}

export function useUpdateOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      amountPaid,
    }: {
      id: string;
      amountPaid: number;
    }) => updateOrderPayment(id, amountPaid),

    onSuccess: async (updatedOrder) => {
      await refreshOrderQueries(queryClient, updatedOrder);
    },
  });
}
