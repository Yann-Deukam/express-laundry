
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Redirect } from "expo-router";

export default function Index() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
