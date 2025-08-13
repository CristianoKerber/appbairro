import api from "./api";

type LoginPayload = {
  email: string;
  password: string;
};

  
type LoginResponse = {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
};

export async function registerUser(userData: {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  address: string;
}) {
  const response = await api.post("/api/users/save", userData);
  return response.data;
}

export async function loginUser(data: LoginPayload): Promise<LoginResponse> {
  const response = await api.post("/api/users/login", data);
  return response.data;
}

export async function getALLUsers(){
  const response = await api.get("/api/users/all");
  return response.data;
}

export async function getUser(userId: string){
    const response = await api.get(`api/users/${userId}`);
  return response.data;
}

export const updateUser = async (userId: string, updatedUserData: any) => {
  try {
    const response = await api.put(`/api/users/update/${userId}`, updatedUserData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export default {
  updateUser,
  registerUser,
  loginUser,
  getUser,
  getALLUsers,
}