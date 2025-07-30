import api from "./api";

type LoginPayload = {
  username: string;
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
  const response = await api.post("/login", data);
  return response.data;
}

export async function getUserProfile() {
  const response = await api.get("/usuario/perfil");
  return response.data;
}
