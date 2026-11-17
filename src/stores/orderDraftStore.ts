import { create } from "zustand";

export type PricingPack = "per_kg_500" | "per_kg_1000" | "custom";

interface OrderDraftState {
  clientId: string | null;
  pickupDate: string;
  deliveryDate: string;
  weightKg: string;
  pack: PricingPack;
  customPrice: string;
  photoUri: string | null;

  setClient: (id: string | null) => void;
  setPickupDate: (date: string) => void;
  setDeliveryDate: (date: string) => void;
  setWeightKg: (weight: string) => void;
  setPack: (pack: PricingPack) => void;
  setCustomPrice: (price: string) => void;
  setPhotoUri: (uri: string | null) => void;
  resetDraft: () => void;
}

function getInitialState() {
  const today = new Date();

  return {
    clientId: null,
    pickupDate: today.toISOString(),
    deliveryDate: "",
    weightKg: "",
    pack: "per_kg_500" as PricingPack,
    customPrice: "",
    photoUri: null,
  };
}

export const useOrderDraftStore = create<OrderDraftState>((set) => ({
  ...getInitialState(),

  setClient: (clientId) => set({ clientId }),
  setPickupDate: (pickupDate) => set({ pickupDate }),
  setDeliveryDate: (deliveryDate) => set({ deliveryDate }),
  setWeightKg: (weightKg) => set({ weightKg }),
  setPack: (pack) => set({ pack }),
  setCustomPrice: (customPrice) => set({ customPrice }),
  setPhotoUri: (photoUri) => set({ photoUri }),

  resetDraft: () => set(getInitialState()),
}));