
import { AppNotification } from "@/types/notifications.types";
import { supabase } from "@/utils/supabase";



export async function getNotifications(
  businessId: string,
  userId: string
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AppNotification[];
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead(
  businessId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    throw error;
  }
}
