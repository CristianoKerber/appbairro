// services/CollectedItemService.ts

import api from "./api";

export interface CollectedItem {
  ItemName: string;
  ItemDescription: string;
  quantity: number;
  collectedDate: string;
  collectId: number; 
}

const CollectedItemService = {
  async createCollectedItem(itemData: CollectedItem): Promise<CollectedItem> {
    const response = await api.post<CollectedItem>("/api/collectiten/save", itemData);
    return response.data;
  },
};

export default CollectedItemService;
