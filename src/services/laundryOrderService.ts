import type { PricingPack } from "@/stores/orderDraftStore";
import { supabase } from "@/utils/supabase";
import { File } from "expo-file-system";

export interface SaveLaundryOrderInput {
  client_id: string;
  pickup_date: string;
  delivery_date: string;
  weight_kg: number;
  pack: PricingPack;
  custom_price?: number | null;
  photo_uri?: string | null;
}

export interface SavedLaundryOrder {
  id: string;
  client_id: string;
  status: string;
  pickup_date: string;
  delivery_date: string;
  total: number;
  amount_paid: number;
  is_delivered: boolean;
  created_at: string;
  clients: {
    name: string;
    phone: string;
  } | null;
}

function calculateTotal(input: SaveLaundryOrderInput): number {
  if (input.pack === "per_kg_500") {
    return Math.round(input.weight_kg * 500 * 100) / 100;
  }

  if (input.pack === "per_kg_1000") {
    return Math.round(input.weight_kg * 1000 * 100) / 100;
  }

  return Math.round(Number(input.custom_price ?? 0) * 100) / 100;
}

function getPhotoExtension(uri: string): string {
  const cleanUri = uri.split("?")[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (extension === "png") return "png";
  if (extension === "webp") return "webp";

  return "jpg";
}


async function uploadWeighingPhoto(
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

  const path = `${userId}/${orderId}/weighing.${extension}`;

  console.log("WEIGHING PHOTO URI:", uri);

  const file = new File(uri);

  console.log("PHOTO FILE EXISTS:", file.exists);

  if (!file.exists) {
    throw new Error("The weighing photo does not exist on the device.");
  }

  const bytes = await file.bytes();

  console.log("PHOTO BYTE SIZE:", bytes.length);

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

  console.log("WEIGHING PHOTO UPLOADED:", path);

  return path;
}


export async function saveLaundryOrder(
  input: SaveLaundryOrderInput
): Promise<SavedLaundryOrder> {
  if (!input.client_id) {
    throw new Error("Please select a client.");
  }

  if (!Number.isFinite(input.weight_kg) || input.weight_kg <= 0) {
    throw new Error("Enter a valid laundry weight.");
  }

  if (input.pack === "custom" && (!input.custom_price || input.custom_price <= 0)) {
    throw new Error("Enter a valid custom price.");
  }

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;

  const user = authData.user;

  if (!user) {
    throw new Error("You must be signed in to create an order.");
  }

  const total = calculateTotal(input);

  let orderId: string | null = null;
  let photoPath: string | null = null;

  try {
    // Create the order with its final total.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        client_id: input.client_id,
        pickup_date: input.pickup_date,
        delivery_date: input.delivery_date,
        status: "received",
        total,
        amount_paid: 0,
        is_delivered: false,
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    orderId = order.id;

    // Upload the weighing photo, if one was taken.
    if (input.photo_uri) {
      photoPath = await uploadWeighingPhoto(
        input.photo_uri,
        user.id,
        order.id
      );
    }

    const unitPrice =
      input.pack === "per_kg_500"
        ? 500
        : input.pack === "per_kg_1000"
          ? 1000
          : Number(input.custom_price);

    // One order has one summary record, not multiple garment records.
    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({
        order_id: order.id,
        dress_type: "Laundry",
        pack: input.pack,
        weight_kg: input.weight_kg,
        unit_price: unitPrice,
        price: total,
        photo_url: photoPath,
      })
      .select("id, dress_type, pack, weight_kg, unit_price, price, photo_url")
      .single();

    if (itemError) throw itemError;

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
      pricing_pack: input.pack,
      custom_price: input.custom_price ?? null,
      item,
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

    const { data: savedOrder, error: fetchError } = await supabase
      .from("orders")
      .select(`
        id,
        client_id,
        status,
        pickup_date,
        delivery_date,
        total,
        amount_paid,
        is_delivered,
        created_at,
        clients (name, phone)
      `)
      .eq("id", order.id)
      .single();

    if (fetchError) throw fetchError;

    return savedOrder as unknown as SavedLaundryOrder;
  } catch (error) {
    // Clean up uploaded storage data and the order if saving fails.
    if (photoPath) {
      await supabase.storage.from("items-photos").remove([photoPath]);
    }

    if (orderId) {
      await supabase.from("orders").delete().eq("id", orderId);
    }

    throw error;
  }
}