import axios from "axios";
import { clearAuthStorage, getStoredToken, hasValidToken } from "../utils/auth";
import { API_BASE } from "../utils/apiConfig";

export const api = axios.create({
  baseURL: API_BASE,
});

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/admin/login") {
    window.location.replace("/admin/login");
  }
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (!token) return config;

  if (!hasValidToken(token)) {
    clearAuthStorage();
    redirectToLogin();
    return config;
  }

  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || "");
    const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401 && !isAuthRequest) {
      clearAuthStorage();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);
