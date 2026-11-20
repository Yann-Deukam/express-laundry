
import { createContext } from "react";

import type { Session, User } from "@supabase/supabase-js";

import type { Business, BusinessRole } from "@/features/businesses/types/business.types";

export interface AuthContextType {
  session: Session | null;
  user: User | null;

  business: Business | null;
  businessId: string | null;
  role: BusinessRole | null;

  loading: boolean;
  businessError: string | null;

  refreshBusiness: () => Promise<void>;
}

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);
