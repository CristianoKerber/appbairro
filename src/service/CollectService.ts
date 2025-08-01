// services/CollectService.ts

import api from "./api";

export interface Collect {
  id?: number;
  Collected: boolean;
  collecteDate: string; 
}

const createCollect = async (collectData: Collect): Promise<Collect> => {
  const response = await api.post<Collect>("/api/collects/save", collectData);
  return response.data;
};

export default {
  createCollect,
};
