
import { supabase } from "@/utils/supabase";

export interface BusinessPricing {
  id: string;
  business_id: string;
  price_per_kg_500: number;
  price_per_kg_1000: number;
  currency: "XAF";
  created_at: string;
  updated_at: string;
}

export interface UpdateBusinessPricingInput {
  price_per_kg_500: number;
  price_per_kg_1000: number;
}

export async function getBusinessPricing(
  businessId: string
): Promise<BusinessPricing> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const { data, error } = await supabase
    .from("business_pricing")
    .select(
      "id, business_id, price_per_kg_500, price_per_kg_1000, currency, created_at, updated_at"
    )
    .eq("business_id", businessId)
    .single();

  if (error) throw error;

  return {
    ...data,
    price_per_kg_500: Number(data.price_per_kg_500),
    price_per_kg_1000: Number(data.price_per_kg_1000),
  } as BusinessPricing;
}

export async function updateBusinessPricing(
  businessId: string,
  input: UpdateBusinessPricingInput
): Promise<BusinessPricing> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const rates = [
    input.price_per_kg_500,
    input.price_per_kg_1000,
  ];

  if (
    rates.some(
      (rate) => !Number.isFinite(rate) || rate <= 0
    )
  ) {
    throw new Error("Please enter valid prices greater than zero.");
  }

  const { data, error } = await supabase
    .from("business_pricing")
    .update({
      price_per_kg_500: input.price_per_kg_500,
      price_per_kg_1000: input.price_per_kg_1000,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .select(
      "id, business_id, price_per_kg_500, price_per_kg_1000, currency, created_at, updated_at"
    )
    .single();

  if (error) throw error;

  return {
    ...data,
    price_per_kg_500: Number(data.price_per_kg_500),
    price_per_kg_1000: Number(data.price_per_kg_1000),
  } as BusinessPricing;
}
