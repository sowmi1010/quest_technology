import axios from "axios";
import {
  clearAuthStorage,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredAdmin,
  setStoredRefreshToken,
} from "../utils/auth";
import { API_BASE } from "../utils/apiConfig";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const authClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let refreshPromise = null;

function stripAuthorizationHeader(headers) {
  if (!headers) return;

  if (typeof headers.delete === "function") {
    headers.delete("Authorization");
    headers.delete("authorization");
    return;
  }

  delete headers.Authorization;
  delete headers.authorization;
}

function enforceCookieOnlyAuth(config = {}) {
  config.withCredentials = true;
  const token = getStoredAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    stripAuthorizationHeader(config.headers);
  }

  return config;
}

api.interceptors.request.use((config) => enforceCookieOnlyAuth(config));
authClient.interceptors.request.use((config) => enforceCookieOnlyAuth(config));

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/admin/login") {
    window.location.replace("/admin/login");
  }
}

function isAuthRoute(url = "") {
  return [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh",
    "/auth/logout",
  ].some((path) => String(url).includes(path));
}

async function refreshSession() {
  if (!refreshPromise) {
    const refreshToken = getStoredRefreshToken();
    refreshPromise = authClient
      .post("/auth/refresh", refreshToken ? { refreshToken } : {})
      .then((res) => {
        const payload = res?.data?.data;
        const admin =
          payload && typeof payload === "object" && payload.admin
            ? payload.admin
            : payload;

        const nextAccessToken = String(payload?.accessToken || "").trim();
        const nextRefreshToken = String(payload?.refreshToken || "").trim();

        if (admin && typeof admin === "object") {
          setStoredAdmin(admin);
        }
        setStoredAccessToken(nextAccessToken);
        setStoredRefreshToken(nextRefreshToken);
        return true;
      })
      .catch(() => {
        clearAuthStorage();
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config || {};
    const url = String(original.url || "");
    const authRequest = isAuthRoute(url);

    if (status === 401 && !authRequest && !original._retry) {
      original._retry = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        return api.request(original);
      }

      clearAuthStorage();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (status === 401 && !authRequest) {
      clearAuthStorage();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);
