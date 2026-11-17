
import { supabase } from "@/utils/supabase";

export const ORDER_STATUSES = [
  "received",
  "awaiting_validation",
  "confirmed",
  "washing",
  "ironing",
  "ready",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  client_id: string;
  status: string;
  pickup_date: string;
  delivery_date: string;
  total: number;
  amount_paid: number;
  created_at: string;
  clients: {
    name: string;
    phone: string;
  } | null;
}

export interface CreateOrderInput {
  client_id: string;
  pickup_date: string;
  delivery_date: string;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      client_id,
      status,
      pickup_date,
      delivery_date,
      total,
      amount_paid,
      created_at,
      clients (
        name,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as unknown as Order[];
}

export async function getOrder(id: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      client_id,
      status,
      pickup_date,
      delivery_date,
      total,
      amount_paid,
      created_at,
      clients (
        name,
        phone
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as unknown as Order;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: input.client_id,
      pickup_date: input.pickup_date,
      delivery_date: input.delivery_date,
      status: "received",
      total: 0,
      amount_paid: 0,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as Order;
}

function getLocalDayRange() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 2
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function getOrdersDueSoon(): Promise<Order[]> {
  const { start, end } = getLocalDayRange();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      client_id,
      status,
      pickup_date,
      delivery_date,
      total,
      amount_paid,
      created_at,
      clients (
        name,
        phone
      )
    `)
    .gte("delivery_date", start)
    .lt("delivery_date", end)
    .neq("status", "delivered")
    .order("delivery_date", { ascending: true });

  if (error) throw error;

  return (data ?? []) as unknown as Order[];
}

export async function getOrdersInProgress(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      client_id,
      status,
      pickup_date,
      delivery_date,
      total,
      amount_paid,
      created_at,
      clients (
        name,
        phone
      )
    `)
    .in("status", ["confirmed", "washing", "ironing", "ready"])
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []) as unknown as Order[];
}

export async function getUnpaidOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      client_id,
      status,
      pickup_date,
      delivery_date,
      total,
      amount_paid,
      created_at,
      clients (
        name,
        phone
      )
    `)
    .gt("total", 0)
    .neq("status", "received")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  // Supabase cannot compare two columns in a normal filter.
  // Filter the returned records using the actual amounts.
  return ((data ?? []) as unknown as Order[]).filter(
    (order) => Number(order.amount_paid) < Number(order.total)
  );
}
