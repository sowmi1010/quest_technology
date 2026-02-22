import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../services/api";
import { clearAuthStorage, getStoredToken, hasValidToken } from "../utils/auth";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking"); // checking | authorized | unauthorized

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const token = getStoredToken();

      if (!token || !hasValidToken(token)) {
        clearAuthStorage();
        if (active) setStatus("unauthorized");
        return;
      }

      try {
        await api.get("/auth/me");
        if (active) setStatus("authorized");
      } catch {
        clearAuthStorage();
        if (active) setStatus("unauthorized");
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
