
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

export type PricingPack = "per_kg_500" | "per_kg_1000" | "custom";

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes?: string | null;
}

export interface OrderItem {
  id: string;
  dress_type: string;
  pack: PricingPack;
  weight_kg: number | null;
  unit_price: number;
  price: number;
  photo_url: string | null;
  photo_signed_url: string | null;

  item_notes?: {
    id: string;
    note: string;
  }[];
}

export interface Order {
  id: string;
  client_id: string;
  status: OrderStatus;
  pickup_date: string;
  delivery_date: string;
  total: number;
  amount_paid: number;
  is_delivered: boolean;
  is_washed: boolean;
  created_at: string;
  clients: {
    name: string;
    phone: string;
  } | null;
  items: OrderItem[];
}

export interface CreateOrderInput {
  client_id: string;
  pickup_date: string;
  delivery_date: string;
}

const ORDER_SELECT = `
  id,
  client_id,
  status,
  pickup_date,
  delivery_date,
  total,
  amount_paid,
  is_delivered,
  is_washed,
  created_at,
  clients!orders_client_business_fkey (
    name,
    phone
  ),
  items!items_order_business_fkey (
  id, dress_type, pack, weight_kg, unit_price, price, photo_url,
  item_notes!item_notes_item_business_fkey (id, note)
)
)
`;



async function attachSignedPhotoUrls(
  orders: Order[]
): Promise<Order[]> {
  return Promise.all(
    orders.map(async (order) => {
      const items = await Promise.all(
        (order.items ?? []).map(async (item) => {
          if (!item.photo_url) {
            return {
              ...item,
              photo_signed_url: null,
            };
          }

          const { data, error } = await supabase.storage
            .from("items-photos")
            .createSignedUrl(item.photo_url, 60 * 60);

          if (error) {
            console.warn(
              `Could not generate photo URL for order ${order.id}:`,
              error.message
            );

            return {
              ...item,
              photo_signed_url: null,
            };
          }

          return {
            ...item,
            photo_signed_url: data.signedUrl,
          };
        })
      );

      return {
        ...order,
        items,
      };
    })
  );
}

async function getEnrichedOrder(
  businessId: string,
  orderId: string
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .eq("business_id", businessId)
    .single();

  if (error) throw error;

  const [order] = await attachSignedPhotoUrls([
    data as unknown as Order,
  ]);

  return order;
}


export async function getClients(
  businessId: string
): Promise<Client[]> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, phone, notes")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Client[];
}




export async function createClient(
  businessId: string,
  input: {
    name: string;
    phone: string;
    notes?: string;
  }
): Promise<Client> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const name = input.name.trim();
  const phone = input.phone.trim();
  const notes = input.notes?.trim() || null;

  if (!name || !phone) {
    throw new Error(
      "Please enter the client's name and phone number."
    );
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      business_id: businessId,
      name,
      phone,
      notes,
    })
    .select("id, name, phone, notes")
    .single();

  if (error) throw error;

  return data as Client;
}

export async function updateClient(
  businessId: string,
  clientId: string,
  input: {
    name: string;
    phone: string;
    notes?: string;
  }
): Promise<Client> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const name = input.name.trim();
  const phone = input.phone.trim();
  const notes = input.notes?.trim() || null;

  if (!name || !phone) {
    throw new Error("Please enter the client's name and phone number.");
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      name,
      phone,
      notes,
    })
    .eq("id", clientId)
    .eq("business_id", businessId)
    .select("id, name, phone, notes")
    .single();

  if (error) throw error;

  return data as Client;
}



export async function getOrders(
  businessId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET ORDERS ERROR:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw error;
  }

  return attachSignedPhotoUrls(
    (data ?? []) as unknown as Order[]
  );
}

export async function getOrder(
  id: string,
  businessId: string
): Promise<Order> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  return getEnrichedOrder(businessId, id);
}

export async function createOrder(
  businessId: string,
  input: CreateOrderInput
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      business_id: businessId,
      client_id: input.client_id,
      pickup_date: input.pickup_date,
      delivery_date: input.delivery_date,
      status: "received",
      total: 0,
      amount_paid: 0,
      is_delivered: false,
      is_washed: false,
    })
    .select("id")
    .single();

  if (error) throw error;

 return getOrder(data.id, businessId);
}


export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  businessId: string
): Promise<Order> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) throw error;

  return getOrder(id, businessId);
}

/**
 * Delivery is independent of washing and payment.
 */
export async function updateOrderDelivery(
  id: string,
  isDelivered: boolean,
  businessId: string
): Promise<Order> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ is_delivered: isDelivered })
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) throw error;

  return getOrder(id, businessId);
}

/**
 * Washing is independent of delivery and payment.
 */
export async function updateOrderWashed(
  id: string,
  isWashed: boolean,
  businessId: string
): Promise<Order> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ is_washed: isWashed })
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) throw error;

  return getOrder(id, businessId);
}

/**
 * Supports full and partial payments.
 */
export async function updateOrderPayment(
  id: string,
  amountPaid: number,
  businessId: string
): Promise<Order> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

  if (!Number.isFinite(amountPaid) || amountPaid < 0) {
    throw new Error("Please enter a valid payment amount.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("total")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (orderError) throw orderError;

  if (amountPaid > Number(order.total)) {
    throw new Error("Payment cannot exceed the order total.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ amount_paid: amountPaid })
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) throw error;

  return getOrder(id, businessId);
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


export async function getOrdersDueSoon(
  businessId: string
): Promise<Order[]> {
  const { start, end } = getLocalDayRange();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("business_id", businessId)
    .gte("delivery_date", start)
    .lt("delivery_date", end)
    .eq("is_delivered", false)
    .order("delivery_date", { ascending: true });

  if (error) throw error;

  return attachSignedPhotoUrls(
    (data ?? []) as unknown as Order[]
  );
}



export async function getOrdersInProgress(
  businessId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("business_id", businessId)
    .in("status", ["confirmed", "washing", "ironing", "ready"])
    .eq("is_delivered", false)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return attachSignedPhotoUrls(
    (data ?? []) as unknown as Order[]
  );
}



export async function getUnpaidOrders(
  businessId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("business_id", businessId)
    .gt("total", 0)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const orders = await attachSignedPhotoUrls(
    (data ?? []) as unknown as Order[]
  );

  return orders.filter(
    (order) => Number(order.amount_paid) < Number(order.total)
  );
}

