
import { supabase } from "@/utils/supabase";

import type {
    Business,
    BusinessMembership,
    BusinessRole,
} from "../types/business.types";

export interface UserBusinessContext {
  business: Business | null;
  role: BusinessRole | null;
}

export async function getUserBusiness(
  userId: string
): Promise<UserBusinessContext> {
  const { data, error } = await supabase
    .from("business_members")
    .select(
      `
        business_id,
        user_id,
        role,
        created_at,
        businesses!inner (
          id,
          name,
          slug,
          created_by
        )
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Business loading failed:", error.message);
    throw error;
  }

  if (!data) {
    return {
      business: null,
      role: null,
    };
  }

  const membership = data as unknown as BusinessMembership;

  const businessData = Array.isArray(membership.businesses)
    ? membership.businesses[0] ?? null
    : membership.businesses;

  return {
    business: businessData,
    role: membership.role,
  };
}
