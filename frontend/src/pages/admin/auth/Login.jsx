import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      const token = res.data?.data?.token;
      const admin = res.data?.data?.admin;

      if (!token) throw new Error("Token missing");

      localStorage.setItem("token", token);
      localStorage.setItem("admin", JSON.stringify(admin || {}));

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message || "Login failed. Check email/password.";
      setMsg(`❌ ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-peacock-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-peacock-border shadow p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-peacock-navy">Admin Login</h1>
          <p className="text-sm text-gray-600 mt-1">Quest Technology</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            className="border rounded-xl p-3"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />

          <input
            className="border rounded-xl p-3"
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />

          <button
            disabled={loading}
            className="bg-peacock-blue text-white rounded-xl p-3 font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {msg && (
            <div className="text-sm font-medium bg-peacock-bg border border-peacock-border rounded-xl p-3">
              {msg}
            </div>
          )}
        </form>

        <div className="mt-5 text-xs text-gray-500">
          Tip: Use the admin account you created in Postman:
          <div className="mt-1">
            <b>Email:</b> admin@quest.com
          </div>
        </div>
      </div>
    </div>
  );
}
