import { api } from "@/services/api";
import type { CurrentUser, User } from "@/types";

export interface LoginResponse extends User {}
export interface CurrentUserResponse extends CurrentUser {}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const data = await api.post("/auth/login", { username, password });
  return data as unknown as LoginResponse;
}

export async function logout() {
  return api.post<void>("/auth/logout");
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const data = await api.get("/user/me");
  return data as unknown as CurrentUserResponse;
}
