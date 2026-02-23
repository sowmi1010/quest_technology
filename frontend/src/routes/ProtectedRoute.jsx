import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../services/api";
import { clearAuthStorage, setStoredAdmin } from "../utils/auth";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking"); // checking | authorized | unauthorized

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const res = await api.get("/auth/me");
        setStoredAdmin(res?.data?.data || {});
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
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="h-3 w-36 animate-pulse rounded bg-white/30" />
            <div className="mt-4 space-y-2">
              <div className="h-2.5 w-full animate-pulse rounded bg-white/15" />
              <div className="h-2.5 w-5/6 animate-pulse rounded bg-white/15" />
              <div className="h-2.5 w-2/3 animate-pulse rounded bg-white/15" />
            </div>
            <p className="mt-4 text-xs font-medium tracking-wide text-white/70">
              Verifying admin session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
