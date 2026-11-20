
import { File } from "expo-file-system";

import {
  getOrder,
  type Order,
  type PricingPack,
} from "@/services/orderService";

import { supabase } from "@/utils/supabase";

export interface SaveLaundryOrderInput {
  client_id: string;
  pickup_date: string;
  delivery_date: string;
  weight_kg: number;
  pack: PricingPack;
  custom_price?: number | null;
  photo_uri?: string | null;
}

function calculateTotal(
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

async function uploadWeighingPhoto(
  uri: string,
  businessId: string,
  orderId: string
): Promise<string> {
  const extension = getPhotoExtension(uri);

  const contentType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  const path = `${businessId}/${orderId}/weighing.${extension}`;

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
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  return path;
}

export async function saveLaundryOrder(
  businessId: string,
  input: SaveLaundryOrderInput
): Promise<Order> {
  if (!businessId) {
    throw new Error("No active business was found.");
  }

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

  const { unitPrice, total } = calculateTotal(
    input.weight_kg,
    input.pack,
    input.custom_price
  );

  let orderId: string | null = null;
  let uploadedPhotoPath: string | null = null;

  try {
    // Create the order under the active business.
    const { data: order, error: orderError } = await supabase
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

    if (orderError) throw orderError;

    orderId = order.id;

    // Create the laundry item under the same business.
    const { data: savedItem, error: itemError } = await supabase
      .from("items")
      .insert({
        business_id: businessId,
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

    // Upload a new photo using the business-first Storage path.
    if (input.photo_uri) {
      uploadedPhotoPath = await uploadWeighingPhoto(
        input.photo_uri,
        businessId,
        order.id
      );

      const { error: photoError } = await supabase
        .from("items")
        .update({
          photo_url: uploadedPhotoPath,
        })
        .eq("id", savedItem.id)
        .eq("business_id", businessId);

      if (photoError) throw photoError;
    }

    // Update the order total.
    const { error: totalError } = await supabase
      .from("orders")
      .update({ total })
      .eq("id", order.id)
      .eq("business_id", businessId);

    if (totalError) throw totalError;

    // Fetch the client for the receipt snapshot.
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, phone")
      .eq("id", input.client_id)
      .eq("business_id", businessId)
      .single();

    if (clientError) throw clientError;

    const snapshot = {
      order_id: order.id,
      business_id: businessId,
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

    // Save the receipt version under the same business.
    const { error: receiptError } = await supabase
      .from("receipt_versions")
      .insert({
        business_id: businessId,
        order_id: order.id,
        version: 1,
        snapshot,
        status: "draft",
      });

    if (receiptError) throw receiptError;

    return await getOrder(order.id, businessId);
  } catch (error) {
    // Remove only the photo uploaded during this failed operation.
    if (uploadedPhotoPath) {
      await supabase.storage
        .from("items-photos")
        .remove([uploadedPhotoPath]);
    }

    // Delete only the order created during this failed operation.
    // Related rows are expected to be removed through the existing
    // database foreign-key cascade.
    if (orderId) {
      await supabase
        .from("orders")
        .delete()
        .eq("id", orderId)
        .eq("business_id", businessId);
    }

    throw error;
  }
}
