// services/CollectService.ts

import api from "./api";

// Interface para os dados de distribuição do gráfico
export interface WasteDistribution {
  itemName: string;
  totalQuantity: number;
}

export interface Collect {
  id?: number;
  collected: boolean;
  collectDate: string; 
  itemName?: string;
  itemDescription?: string;
  quantity?: number;
}

// Criar nova coleta
const createCollect = async (collectData: Collect): Promise<Collect> => {
  console.log("Enviando dados de coleta:", collectData);
  const response = await api.post<Collect>("/api/collects/save", collectData);
  return response.data;
};

// Obter todas as coletas (mantido da sua versão)
const getAllCollects = async () => {
  const response = await api.get("/api/collects/all");
  return response.data;
};

// Atualizar uma coleta (mantido da sua versão)
const updateCollect = async (collectId: number, updatedData: Partial<Collect>): Promise<Collect> => {
  const response = await api.put<Collect>(`/api/collects/update/${collectId}`, updatedData);
  return response.data;
};

// NOVO: Busca o status da coleta mais recente
const getLatestCollectStatus = async (): Promise<Collect | null> => {
  try {
    const response = await api.get<Collect>("/api/collects/latestStatus");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar o status da última coleta:", error);
    return null;
  }
};

// NOVO: Busca os dados de distribuição para o gráfico
const getTotalCollectedInMonth = async (UserId?: Promise<string | null>): Promise<WasteDistribution[]> => {
  try {
    const response = await api.get<WasteDistribution[]>('/api/collects/monthlyDistribution/${userId}');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de distribuição:", error);
    return [];
  }
};

export default {
  createCollect,
  getAllCollects,
  updateCollect,
  getLatestCollectStatus,
  getTotalCollectedInMonth,
};
