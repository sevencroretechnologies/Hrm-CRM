import apiClient from "./apiClient";
import type { User } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/login", { email, password }).then((r) => r.data),
  getUser: () =>
    apiClient.get<User>("/user").then((r) => r.data),
  logout: () =>
    apiClient.post("/logout").catch(() => {}),
};
