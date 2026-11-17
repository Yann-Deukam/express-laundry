import type { PricingPack } from "@/stores/orderDraftStore";

export function formatCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
}

export function calculateOrderTotal(
  weight: number,
  pack: PricingPack,
  customPrice: number
): number {
  let total = 0;

  if (pack === "per_kg_500") {
    total = weight * 500;
  } else if (pack === "per_kg_1000") {
    total = weight * 1000;
  } else {
    total = customPrice;
  }

  return Math.round(total * 100) / 100;
}

export function getPricingLabel(pack: PricingPack): string {
  switch (pack) {
    case "per_kg_500":
      return "Standard · 500 FCFA/kg";
    case "per_kg_1000":
      return "Premium · 1,000 FCFA/kg";
    case "custom":
      return "Custom pricing";
  }
}

export function toLocalDateInput(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateInputToISO(value: string): string {
  const [year, month, day] = value.split("-").map(Number);

  // Use local midday to avoid date shifts caused by UTC conversion.
  const date = new Date(year, month - 1, day, 12, 0, 0);

  return date.toISOString();
}

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}