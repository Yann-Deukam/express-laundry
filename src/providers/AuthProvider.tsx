
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Session } from "@supabase/supabase-js";

import { AuthContext } from "@/features/auth/context/AuthContext";
import { getUserBusiness } from "@/features/businesses/services/businessService";
import type { Business, BusinessRole } from "@/features/businesses/types/business.types";
import { supabase } from "@/utils/supabase";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [role, setRole] = useState<BusinessRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessError, setBusinessError] = useState<string | null>(
    null
  );

  const requestId = useRef(0);
  const currentUserId = useRef<string | null>(null);

  const loadBusiness = useCallback(async (userId: string) => {
    const request = ++requestId.current;

    setBusinessError(null);

    try {
      const result = await getUserBusiness(userId);

      // Ignore outdated requests, such as a request finishing
      // after the user has signed out.
      if (request !== requestId.current) return;

      setBusiness(result.business);
      setRole(result.role);
    } catch (error) {
      if (request !== requestId.current) return;

      console.error("Could not load business:", error);

      setBusiness(null);
      setRole(null);

      setBusinessError(
        error instanceof Error
          ? error.message
          : "Could not load your business."
      );
    }
  }, []);

  const refreshBusiness = useCallback(async () => {
    if (!session?.user.id) {
      setBusiness(null);
      setRole(null);
      return;
    }

    await loadBusiness(session.user.id);
  }, [session, loadBusiness]);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    async function syncSession(nextSession: Session | null) {
      if (!mounted) return;

      setSession(nextSession);

      if (!nextSession) {
        requestId.current += 1;
        currentUserId.current = null;

        setBusiness(null);
        setRole(null);
        setBusinessError(null);
        setLoading(false);

        return;
      }

      const userId = nextSession.user.id;

      // Avoid reloading the business on token refresh events
      // when the authenticated user has not changed.
      if (currentUserId.current === userId) {
        setLoading(false);
        return;
      }

      currentUserId.current = userId;
      setBusiness(null);
      setRole(null);
      setBusinessError(null);
      setLoading(true);

      await loadBusiness(userId);

      if (mounted && currentUserId.current === userId) {
        setLoading(false);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;

      // Run the business query after the auth callback completes.
      setTimeout(() => {
        void syncSession(nextSession);
      }, 0);
    });

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted || authEventReceived) return;

      if (error) {
        console.error("Session restoration failed:", error.message);
      }

      await syncSession(data.session);
    }

    void restoreSession();

    return () => {
      mounted = false;
      requestId.current += 1;
      subscription.unsubscribe();
    };
  }, [loadBusiness]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        business,
        businessId: business?.id ?? null,
        role,
        loading,
        businessError,
        refreshBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
