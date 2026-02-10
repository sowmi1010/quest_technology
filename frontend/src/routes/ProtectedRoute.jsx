import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // if no token -> go login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
