import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { saveLaundryOrder } from "@/services/laundryOrderService";
import {
    createClient,
    getClients,
    type Client,
} from "@/services/orderService";
import { useOrderDraftStore } from "@/stores/orderDraftStore";
import {
    calculateOrderTotal,
    dateInputToISO,
    isValidDateInput,
    toLocalDateInput,
} from "@/utils/orderUtils";

export function useNewOrder() {
  const queryClient = useQueryClient();

  const draft = useOrderDraftStore();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const clients = clientsQuery.data ?? [];

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === draft.clientId) ?? null,
    [clients, draft.clientId]
  );

  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: async (client: Client) => {
      await queryClient.invalidateQueries({
        queryKey: ["clients"],
      });

      draft.setClient(client.id);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: () =>
      saveLaundryOrder({
        client_id: draft.clientId!,
        pickup_date: dateInputToISO(toLocalDateInput(draft.pickupDate)),
        delivery_date: dateInputToISO(toLocalDateInput(draft.deliveryDate)),
        weight_kg: Number(draft.weightKg.replace(",", ".")),
        pack: draft.pack,
        custom_price:
          draft.pack === "custom"
            ? Number(draft.customPrice.replace(",", "."))
            : null,
        photo_uri: draft.photoUri,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  const weight = Number(draft.weightKg.replace(",", "."));
  const customPrice = Number(draft.customPrice.replace(",", "."));

  const total = calculateOrderTotal(
    Number.isFinite(weight) ? weight : 0,
    draft.pack,
    Number.isFinite(customPrice) ? customPrice : 0
  );

  function validate(): string | null {
    if (!draft.clientId) {
      return "Please select a client.";
    }

    if (!isValidDateInput(toLocalDateInput(draft.pickupDate))) {
      return "Please select a valid pickup date.";
    }

    if (!isValidDateInput(toLocalDateInput(draft.deliveryDate))) {
      return "Please select a valid delivery date.";
    }

    const pickup = new Date(draft.pickupDate);
    const delivery = new Date(draft.deliveryDate);

    if (delivery < pickup) {
      return "The delivery date cannot be earlier than the pickup date.";
    }

    if (!draft.weightKg.trim() || !Number.isFinite(weight) || weight <= 0) {
      return "Please enter a valid laundry weight.";
    }

    if (
      draft.pack === "custom" &&
      (!draft.customPrice.trim() ||
        !Number.isFinite(customPrice) ||
        customPrice <= 0)
    ) {
      return "Please enter a valid custom price.";
    }

    return null;
  }

  async function submit() {
    const validationError = validate();

    if (validationError) {
      throw new Error(validationError);
    }

    return createOrderMutation.mutateAsync();
  }

  return {
    clients,
    selectedClient,

    isLoadingClients: clientsQuery.isLoading,
    clientsError: clientsQuery.error,

    createClient: createClientMutation.mutateAsync,
    isCreatingClient: createClientMutation.isPending,

    total,
    submit,
    validate,

    isSaving: createOrderMutation.isPending,
    saveError: createOrderMutation.error,

    reset: draft.resetDraft,
  };
}