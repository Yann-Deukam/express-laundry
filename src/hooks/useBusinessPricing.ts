
import { getBusinessPricing, updateBusinessPricing, UpdateBusinessPricingInput } from "@/services/pricingService";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

export const businessPricingKeys = {
  all: ["business-pricing"] as const,
  detail: (businessId: string) =>
    [...businessPricingKeys.all, businessId] as const,
};

export function useBusinessPricing(businessId: string | null | undefined) {
  return useQuery({
    queryKey: businessPricingKeys.detail(businessId ?? ""),
    queryFn: () => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return getBusinessPricing(businessId);
    },
    enabled: Boolean(businessId),
  });
}

export function useUpdateBusinessPricing(
  businessId: string | null | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBusinessPricingInput) => {
      if (!businessId) {
        throw new Error("No active business was found.");
      }

      return updateBusinessPricing(businessId, input);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(
        businessPricingKeys.detail(data.business_id),
        data
      );

      await queryClient.invalidateQueries({
        queryKey: businessPricingKeys.all,
      });
    },
  });
}
