// services/CollectService.ts

import api from "./api";

export interface Collect {
  id?: number;
  collected: boolean;
  collecteDate: string; 
  ItemName?: string;
  ItemDescription?: string;
  quantity?: number;
}

const createCollect = async (collectData: Collect): Promise<Collect> => {
  console.log(collectData);
  const response = await api.post<Collect>("/api/collects/save", collectData);
  return response.data;
};
const getAllCollects = async () => {
  const response = await api.get("/api/collects/all");
  return response.data;
};
const getTotalCollectedInMonth = async () => {
  const response = await api.get("/api/collects/monthly-total"); // ajuste a rota
  return response.data; 
};
const getLatestCollectStatus = async () => {
  const response = await api.get("/api/collects/latest-status");
  return response.data;
};

const updateCollect = async (collectId: number, updatedData: Partial<Collect>): Promise<Collect> => {
  const response = await api.put<Collect>(`/api/collects/update/${collectId}`, updatedData);
  return response.data;
};

export default {
  createCollect,
  getAllCollects,
  getTotalCollectedInMonth,
  getLatestCollectStatus,
  updateCollect,
};
