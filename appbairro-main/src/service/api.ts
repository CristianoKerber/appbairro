import axios from "axios";

const api = axios.create({
  baseURL: "http://10.35.231.198:3000", // troque pelo seu IPv4
  timeout: 10000,
});

export default api;