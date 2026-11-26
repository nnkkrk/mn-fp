import { create } from "zustand";

export interface BuyItemPreview {
  slug: string;
  itemSlug: string;
  name: string;
  price?: number;
  dummy?: number;
  image?: string;
}

interface BuyStore {
  selectedBuyItem: BuyItemPreview | null;
  setSelectedBuyItem: (item: BuyItemPreview) => void;
  clearSelectedBuyItem: () => void;
}

export const useBuyStore = create<BuyStore>((set) => ({
  selectedBuyItem: null,
  setSelectedBuyItem: (item) => set({ selectedBuyItem: item }),
  clearSelectedBuyItem: () => set({ selectedBuyItem: null }),
}));
