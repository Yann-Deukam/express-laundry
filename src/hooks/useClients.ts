import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
    createClient,
    getClients,
    updateClient,
    type Client,
} from "@/services/orderService";

export const clientKeys = {
  all: ["clients"] as const,
  list: (businessId: string) =>
    [...clientKeys.all, businessId, "list"] as const,
};

type ClientInput = {
  name: string;
  phone: string;
  notes?: string;
};

export function useClients() {
  const { businessId, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: businessId
      ? clientKeys.list(businessId)
      : [...clientKeys.all, "no-business", "list"],

    queryFn: () => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return getClients(businessId);
    },

    enabled: !authLoading && !!businessId,
  });

  const createClientMutation = useMutation({
    mutationFn: (input: ClientInput): Promise<Client> => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return createClient(businessId, input);
    },

    onSuccess: async () => {
      if (!businessId) return;

      await queryClient.invalidateQueries({
        queryKey: clientKeys.list(businessId),
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({
      clientId,
      input,
    }: {
      clientId: string;
      input: ClientInput;
    }): Promise<Client> => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return updateClient(businessId, clientId, input);
    },

    onSuccess: async () => {
      if (!businessId) return;

      await queryClient.invalidateQueries({
        queryKey: clientKeys.list(businessId),
      });
    },
  });

  return {
    ...query,
    businessId,
    authLoading,
    createClientMutation,
    updateClientMutation,
  };
}