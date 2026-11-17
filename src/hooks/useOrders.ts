
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createOrder,
    getOrder,
    getOrders,
    updateOrderStatus,
    type CreateOrderInput,
    type OrderStatus,
} from "@/services/orderService";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

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

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
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
      await queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      queryClient.setQueryData(
        orderKeys.detail(updatedOrder.id),
        updatedOrder
      );
    },
  });
}
