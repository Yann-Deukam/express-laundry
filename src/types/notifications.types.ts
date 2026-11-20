
export type NotificationType = "delivery_reminder";

export interface AppNotification {
  id: string;
  business_id: string;
  user_id: string;
  order_id: string;
  type: NotificationType;
  title: string;
  message: string;
  delivery_at: string;
  read_at: string | null;
  created_at: string;
}
