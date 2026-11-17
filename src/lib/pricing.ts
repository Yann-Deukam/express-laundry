
/**
 * src/lib/pricing.ts
 *
 * Central pricing engine for Express Laundry.
 *
 * All returned prices are in FCFA.
 */

export type PricingPack =
  | "per_kg_500"
  | "per_kg_1000"
  | "custom";

export interface PricingItem {
  pack: PricingPack;
  weightKg?: number | null;

  // Required when pack === "custom"
  customPrice?: number | null;

  // Optional manual override. Takes priority over all other pricing.
  priceOverride?: number | null;
}

const PACK_RATES: Record<
  Exclude<PricingPack, "custom">,
  number
> = {
  per_kg_500: 500,
  per_kg_1000: 1000,
};

/**
 * Validates that a monetary amount is a finite,
 * non-negative number.
 */
function validatePrice(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a valid non-negative number.`);
  }
}

/**
 * Rounds an amount to the nearest whole FCFA.
 */
function roundFCFA(amount: number): number {
  return Math.round(amount + Number.EPSILON * Math.abs(amount));
}

/**
 * Calculates the price of one laundry item.
 *
 * Priority:
 * 1. Manual override
 * 2. Custom price
 * 3. Weight × pack rate
 */
export function calculateItemPrice(item: PricingItem): number {
  // A manual override always takes priority.
  if (item.priceOverride !== undefined && item.priceOverride !== null) {
    validatePrice(item.priceOverride, "Price override");
    return roundFCFA(item.priceOverride);
  }

  // Custom pricing is a fixed amount per item.
  if (item.pack === "custom") {
    if (item.customPrice === undefined || item.customPrice === null) {
      throw new Error("A custom price is required for this item.");
    }

    validatePrice(item.customPrice, "Custom price");
    return roundFCFA(item.customPrice);
  }

  // Weight-based pricing.
  if (item.pack !== "per_kg_500" && item.pack !== "per_kg_1000") {
    throw new Error("Invalid pricing pack.");
  }

  if (
    item.weightKg === undefined ||
    item.weightKg === null ||
    !Number.isFinite(item.weightKg) ||
    item.weightKg <= 0
  ) {
    throw new Error("A valid item weight greater than zero is required.");
  }

  const rate = PACK_RATES[item.pack];
  const calculatedPrice = item.weightKg * rate;

  return roundFCFA(calculatedPrice);
}

/**
 * Calculates the total price of an order.
 *
 * Each item is rounded individually before the
 * order total is calculated.
 */
export function calculateOrderTotal(
  items: readonly PricingItem[]
): number {
  return items.reduce((total, item) => {
    return total + calculateItemPrice(item);
  }, 0);
}
