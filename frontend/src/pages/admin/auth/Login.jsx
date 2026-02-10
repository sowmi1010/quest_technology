import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

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
      setMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const hint = useMemo(
    () => ({ email: "admin@quest.com" }),
    []
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(2,6,23,0.92))] flex items-center justify-center p-4">
      {/* soft animated glow blobs */}
      <div className="pointer-events-none absolute -top-48 -left-48 h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 -right-52 h-[460px] w-[460px] rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_90px_-50px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* top strip */}
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 border border-white/10 text-white font-bold">
                Q
              </div>
              <div className="leading-tight">
                <div className="text-sm text-white/60 uppercase tracking-[0.25em]">
                  Quest Technology
                </div>
                <h1 className="text-xl font-bold text-white">Admin Login</h1>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="px-6 py-6 grid gap-4">
            {/* Email */}
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Email</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
                             focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                  placeholder="admin@quest.com"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            {/* Password */}
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-white/60">Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-12 py-3 text-sm text-white placeholder:text-white/35 outline-none
                             focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                  placeholder="Enter your password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5
                             text-white/70 hover:bg-white/10 transition"
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {/* Error */}
            {msg && (
              <div className="rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                <div className="font-semibold">Login failed</div>
                <div className="text-rose-200/90">{msg}</div>
              </div>
            )}

            {/* Submit */}
            <button
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center rounded-2xl bg-sky-500/85 px-4 py-3 text-sm font-bold text-white
                         shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)]
                         transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            {/* Tip */}
            <div className="pt-2 text-xs text-white/50">
              Tip: Use the admin account you created in Postman:
              <div className="mt-1">
                <span className="text-white/70 font-semibold">Email:</span>{" "}
                <span className="text-white">{hint.email}</span>
              </div>
            </div>
          </form>
        </div>

        {/* bottom tiny note */}
        <div className="mt-4 text-center text-xs text-white/40">
          Secure access for administrators only.
        </div>
      </div>
    </div>
  );
}
