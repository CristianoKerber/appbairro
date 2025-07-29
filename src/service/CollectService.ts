// services/CollectService.ts

import api from "./api"; // seu axios configurado

export interface Collect {
  id?: number;
  Collected: boolean;
  collecteDate: string; // formato ISO yyyy-mm-dd
}

const createCollect = async (collectData: Collect): Promise<Collect> => {
  const response = await api.post<Collect>("/collect", collectData);
  return response.data;
};

export default {
  createCollect,
};
