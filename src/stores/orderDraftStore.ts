
import { create } from "zustand";

export interface DraftItem {
  id: string;
  dress_type: string;
  pack: "per_kg_500" | "per_kg_1000" | "custom";
  weight_kg: number | null;
  custom_price: number | null;
  price_override: number | null;
  photo_uri: string | null;
  notes: string[];
}

interface OrderDraftState {
  clientId: string | null;
  pickupDate: string;
  deliveryDate: string;
  items: DraftItem[];

  setClient: (clientId: string) => void;
  setPickupDate: (date: string) => void;
  setDeliveryDate: (date: string) => void;
  addItem: (item: DraftItem) => void;
  updateItem: (id: string, updates: Partial<DraftItem>) => void;
  removeItem: (id: string) => void;
  resetDraft: () => void;
}

const initialState = {
  clientId: null,
  pickupDate: new Date().toISOString(),
  deliveryDate: "",
  items: [],
};

export const useOrderDraftStore = create<OrderDraftState>((set) => ({
  ...initialState,

  setClient: (clientId) => set({ clientId }),

  setPickupDate: (pickupDate) => set({ pickupDate }),

  setDeliveryDate: (deliveryDate) => set({ deliveryDate }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  resetDraft: () => set({ ...initialState }),
}));
