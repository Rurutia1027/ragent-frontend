import axios from "axios";
import { toast } from "sonner";

import { storage } from "@/utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message || error.message
      : "Request failed";
    toast.error(message);
    return Promise.reject(error);
  },
);
