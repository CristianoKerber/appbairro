// services/CollectedItemService.ts

import axios from "axios";

const API_BASE_URL = "http://10.35.214.100:3306";

export interface CollectedItem {
  ItemName: string;
  ItemDescription: string;
  quantity: number;
  collectedDate: string;
  collectId: number; 
}

const CollectedItemService = {
  async getLatestCollectStatus() {
    const response = await axios.get(`${API_BASE_URL}/collect/latest`);
    return response.data;
  },

  async getCollectedItemsInMonth() {
    const response = await axios.get(`${API_BASE_URL}/collected-items/month`);
    return response.data;
  },

  async createCollectedItem(itemData: CollectedItem): Promise<CollectedItem> {
    const response = await axios.post<CollectedItem>(`${API_BASE_URL}/collectedItem`, itemData);
    return response.data;
  },
};

export default CollectedItemService;
