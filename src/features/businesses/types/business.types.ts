
export type BusinessRole = "owner" | "admin" | "staff";

export interface Business {
  id: string;
  name: string;
  slug: string;
  created_by: string;
}

export interface BusinessMembership {
  business_id: string;
  user_id: string;
  role: BusinessRole;
  created_at: string;
  businesses: Business | Business[];
}
