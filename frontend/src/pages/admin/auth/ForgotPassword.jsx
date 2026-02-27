import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { api } from "../../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [resetToken, setResetToken] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setResetUrl("");
    setResetToken("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(
        res?.data?.message ||
          "If this email exists, password reset instructions have been generated."
      );
      const generatedUrl = String(res?.data?.data?.resetUrl || "").trim();
      const generatedToken = String(res?.data?.data?.resetToken || "").trim();
      if (generatedUrl) setResetUrl(generatedUrl);
      if (generatedToken) setResetToken(generatedToken);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(2,6,23,0.92))] flex items-center justify-center p-4">
      <div className="pointer-events-none absolute -top-48 -left-48 h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 -right-52 h-[460px] w-[460px] rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_90px_-50px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">Forgot Password</h1>
          <p className="mt-1 text-sm text-white/60">
            Enter your admin email to generate a reset link.
          </p>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-white/60">Email</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/30 transition"
                placeholder="admin@quest.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <div>{success}</div>
              {resetUrl ? (
                <a
                  href={resetUrl}
                  className="mt-2 inline-block font-semibold underline break-all"
                >
                  {resetUrl}
                </a>
              ) : null}
              {resetToken ? (
                <Link
                  to={`/admin/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="mt-2 inline-block font-semibold underline"
                >
                  Open reset page in this app
                </Link>
              ) : null}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500/85 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_45px_-25px_rgba(56,189,248,0.65)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Generating link..." : "Generate Reset Link"}
          </button>

          <Link to="/admin/login" className="text-sm text-white/70 hover:text-white underline">
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
