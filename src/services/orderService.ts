
import { supabase } from "@/utils/supabase";
import { File } from "expo-file-system";

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

export interface SaveLaundryOrderInput extends CreateOrderInput {
  weight_kg: number;
  pack: PricingPack;
  custom_price?: number | null;
  photo_uri?: string | null;
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
  clients (
    name,
    phone
  ),
  items (
    id,
    dress_type,
    pack,
    weight_kg,
    unit_price,
    price,
    photo_url
  )
`;

function calculateLaundryPrice(
  weightKg: number,
  pack: PricingPack,
  customPrice?: number | null
) {
  if (pack === "per_kg_500") {
    return {
      unitPrice: 500,
      total: Math.round(weightKg * 500 * 100) / 100,
    };
  }

  if (pack === "per_kg_1000") {
    return {
      unitPrice: 1000,
      total: Math.round(weightKg * 1000 * 100) / 100,
    };
  }

  const total = Number(customPrice);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Please enter a valid custom price.");
  }

  return {
    unitPrice: total,
    total: Math.round(total * 100) / 100,
  };
}

function getPhotoExtension(uri: string) {
  const cleanUri = uri.split("?")[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (extension === "png") return "png";
  if (extension === "webp") return "webp";

  return "jpg";
}

async function uploadLaundryPhoto(
  uri: string,
  userId: string,
  orderId: string
): Promise<string> {
  const extension = getPhotoExtension(uri);

  const contentType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  const path = `${userId}/${orderId}/laundry.${extension}`;

  try {
    const file = new File(uri);

    if (!file.exists) {
      throw new Error("The weighing photo does not exist on the device.");
    }

    const bytes = await file.bytes();

    if (bytes.length === 0) {
      throw new Error("The weighing photo is empty.");
    }

    const { error } = await supabase.storage
      .from("items-photos")
      .upload(path, bytes, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("SUPABASE STORAGE ERROR:", error);
      throw new Error(`Photo upload failed: ${error.message}`);
    }

    return path;
  } catch (error) {
    console.error("WEIGHING PHOTO UPLOAD ERROR:", error);
    throw error;
  }
}

/**
 * Converts the private Storage path into a temporary URL
 * that React Native Image can display.
 */
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
  id: string
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;

  const [order] = await attachSignedPhotoUrls([
    data as unknown as Order,
  ]);

  return order;
}

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, phone, notes")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Client[];
}

export async function createClient(input: {
  name: string;
  phone: string;
}): Promise<Client> {
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!name || !phone) {
    throw new Error("Please enter the client's name and phone number.");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({ name, phone })
    .select("id, name, phone, notes")
    .single();

  if (error) throw error;

  return data as Client;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return attachSignedPhotoUrls((data ?? []) as unknown as Order[]);
}

export async function getOrder(id: string): Promise<Order> {
  return getEnrichedOrder(id);
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
      is_delivered: false,
      is_washed: false,
    })
    .select("id")
    .single();

  if (error) throw error;

  return getOrder(data.id);
}

/**
 * Saves one laundry order.
 *
 * The existing items table is retained for database compatibility,
 * but only one generic laundry row is created per order.
 */
export async function saveLaundryOrder(
  input: SaveLaundryOrderInput
): Promise<Order> {
  if (!input.client_id) {
    throw new Error("Please select a client.");
  }

  if (!Number.isFinite(input.weight_kg) || input.weight_kg <= 0) {
    throw new Error("Please enter a valid laundry weight.");
  }

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;

  const user = authData.user;

  if (!user) {
    throw new Error("You must be signed in to create an order.");
  }

  const { unitPrice, total } = calculateLaundryPrice(
    input.weight_kg,
    input.pack,
    input.custom_price
  );

  let orderId: string | null = null;
  let uploadedPhotoPath: string | null = null;

  try {
    const order = await createOrder({
      client_id: input.client_id,
      pickup_date: input.pickup_date,
      delivery_date: input.delivery_date,
    });

    orderId = order.id;

    const { data: savedItem, error: itemError } = await supabase
      .from("items")
      .insert({
        order_id: order.id,
        dress_type: "Laundry",
        pack: input.pack,
        weight_kg: input.weight_kg,
        unit_price: unitPrice,
        price: total,
        photo_url: null,
      })
      .select("id")
      .single();

    if (itemError) throw itemError;

    if (input.photo_uri) {
      uploadedPhotoPath = await uploadLaundryPhoto(
        input.photo_uri,
        user.id,
        order.id
      );

      const { error: photoError } = await supabase
        .from("items")
        .update({ photo_url: uploadedPhotoPath })
        .eq("id", savedItem.id);

      if (photoError) throw photoError;
    }

    const { error: totalError } = await supabase
      .from("orders")
      .update({ total })
      .eq("id", order.id);

    if (totalError) throw totalError;

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, phone")
      .eq("id", input.client_id)
      .single();

    if (clientError) throw clientError;

    const snapshot = {
      order_id: order.id,
      client,
      pickup_date: input.pickup_date,
      delivery_date: input.delivery_date,
      weight_kg: input.weight_kg,
      pack: input.pack,
      unit_price: unitPrice,
      photo_url: uploadedPhotoPath,
      total,
      currency: "XAF",
      generated_at: new Date().toISOString(),
    };

    const { error: receiptError } = await supabase
      .from("receipt_versions")
      .insert({
        order_id: order.id,
        version: 1,
        snapshot,
        status: "draft",
      });

    if (receiptError) throw receiptError;

    return await getOrder(order.id);
  } catch (error) {
    if (uploadedPhotoPath) {
      await supabase.storage
        .from("items-photos")
        .remove([uploadedPhotoPath]);
    }

    if (orderId) {
      await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
    }

    throw error;
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) throw error;

  return getOrder(id);
}

/**
 * Delivery is independent of washing and payment.
 */
export async function updateOrderDelivery(
  id: string,
  isDelivered: boolean
): Promise<Order> {
  const { error } = await supabase
    .from("orders")
    .update({ is_delivered: isDelivered })
    .eq("id", id);

  if (error) throw error;

  return getOrder(id);
}

/**
 * Washing is independent of delivery and payment.
 */
export async function updateOrderWashed(
  id: string,
  isWashed: boolean
): Promise<Order> {
  const { error } = await supabase
    .from("orders")
    .update({ is_washed: isWashed })
    .eq("id", id);

  if (error) throw error;

  return getOrder(id);
}

/**
 * Supports full and partial payments.
 */
export async function updateOrderPayment(
  id: string,
  amountPaid: number
): Promise<Order> {
  if (!Number.isFinite(amountPaid) || amountPaid < 0) {
    throw new Error("Please enter a valid payment amount.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("total")
    .eq("id", id)
    .single();

  if (orderError) throw orderError;

  if (amountPaid > Number(order.total)) {
    throw new Error("Payment cannot exceed the order total.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ amount_paid: amountPaid })
    .eq("id", id);

  if (error) throw error;

  return getOrder(id);
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
    .select(ORDER_SELECT)
    .gte("delivery_date", start)
    .lt("delivery_date", end)
    .eq("is_delivered", false)
    .order("delivery_date", { ascending: true });

  if (error) throw error;

  return attachSignedPhotoUrls((data ?? []) as unknown as Order[]);
}

export async function getOrdersInProgress(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .in("status", ["confirmed", "washing", "ironing", "ready"])
    .eq("is_delivered", false)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return attachSignedPhotoUrls((data ?? []) as unknown as Order[]);
}

export async function getUnpaidOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
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
