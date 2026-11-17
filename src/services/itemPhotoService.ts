
import { decode } from "base64-arraybuffer";
import {
    ImageManipulator,
    SaveFormat,
} from "expo-image-manipulator";

import { supabase } from "@/utils/supabase";

const BUCKET_NAME = "item-photos";
const SIGNED_URL_DURATION = 60 * 60; // 1 hour

/**
 * Compresses an image and uploads it to Supabase Storage.
 * Returns the private storage path, NOT a public URL.
 */
export async function uploadItemPhoto(
  itemId: string,
  imageUri: string
): Promise<string> {
  // Load the image without decoding it beyond 1000px wide.
  const context = ImageManipulator.manipulate(imageUri, {
    maxWidth: 1000,
  });

  const renderedImage = await context.renderAsync();

  // Save as JPEG at 70% quality.
  const compressedImage = await renderedImage.saveAsync({
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!compressedImage.base64) {
    throw new Error("Could not compress the selected image.");
  }

  const filePath = `items/${itemId}/${Date.now()}.jpg`;
  const fileData = decode(compressedImage.base64);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileData, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return filePath;
}

/**
 * Generates a temporary URL for displaying a private item photo.
 */
export async function getItemPhotoUrl(
  filePath: string | null
): Promise<string | null> {
  if (!filePath) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, SIGNED_URL_DURATION);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

/**
 * Uploads an item photo and saves its storage path in items.photo_url.
 * Removes the previous photo after the database update succeeds.
 */
export async function saveItemPhoto(
  itemId: string,
  imageUri: string
): Promise<string> {
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("photo_url")
    .eq("id", itemId)
    .single();

  if (fetchError) throw fetchError;

  const previousPath = item.photo_url as string | null;

  const newPath = await uploadItemPhoto(itemId, imageUri);

  const { error: updateError } = await supabase
    .from("items")
    .update({ photo_url: newPath })
    .eq("id", itemId);

  if (updateError) {
    // Avoid leaving an orphaned image if the database update fails.
    await supabase.storage.from(BUCKET_NAME).remove([newPath]);
    throw updateError;
  }

  // Remove the previous image only after the new path is saved.
  if (previousPath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([previousPath]);

    if (removeError) {
      console.warn("Could not remove previous item photo:", removeError);
    }
  }

  return newPath;
}
