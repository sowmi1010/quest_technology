import { Routes, Route } from "react-router-dom";

import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Admin panel */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}
