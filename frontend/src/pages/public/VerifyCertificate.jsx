import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ImageIcon,
  FileText,
  GraduationCap,
  IdCard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import PublicSeo from "../../components/seo/PublicSeo";
import { publicVerifyCertificate } from "../../services/certificateApi";
import { resolveAssetUrl } from "../../utils/apiConfig";

/* ----------------------------- Utils ----------------------------- */

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function certificateDuration(cert) {
  if (cert?.courseId?.duration) return cert.courseId.duration;
  if (cert?.startDate || cert?.endDate) return `${formatDate(cert.startDate)} to ${formatDate(cert.endDate)}`;
  return "-";
}

function certificateValidity(cert) {
  if (cert?.startDate || cert?.endDate) return `${formatDate(cert.startDate)} to ${formatDate(cert.endDate)}`;
  if (cert?.courseId?.duration) return cert.courseId.duration;
  return "Not specified";
}

function safeDecodeUri(value) {
  try {
    return decodeURIComponent(String(value || "").trim());
  } catch {
    return String(value || "").trim();
  }
}

/* ----------------------------- Premium UI ----------------------------- */

function PremiumShell({ children }) {
  return (
    <div className="relative overflow-x-hidden">
      {/* Neo mesh background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.11),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.10),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>

      {/* subtle noise */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />
      {children}
    </div>
  );
}

function NeoCard({ className = "", children }) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl",
        "dark:bg-slate-950/45 dark:border-white/10",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-500",
        "before:bg-[radial-gradient(circle_at_30%_15%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(167,139,250,0.16),transparent_55%)]",
        "group-hover:before:opacity-100",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, className = "" }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/14 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5 min-w-0",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-600 dark:text-white/60">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white break-words">{value}</div>
    </div>
  );
}

function StatusBanner({ tone = "success", title, desc, action }) {
  const styles =
    tone === "success"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-900 dark:text-emerald-200"
      : tone === "warning"
      ? "border-amber-300/25 bg-amber-400/10 text-amber-950 dark:text-amber-200"
      : "border-rose-300/25 bg-rose-400/10 text-rose-950 dark:text-rose-200";

  return (
    <div className={`rounded-3xl border p-5 ${styles}`}>
      <div className="flex items-start gap-3">
        {tone === "success" ? (
          <BadgeCheck className="mt-0.5 h-5 w-5" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5" />
        )}
        <div className="min-w-0">
          <div className="text-base font-extrabold">{title}</div>
          <div className="mt-1 text-sm opacity-90">{desc}</div>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

function PrimaryBtn({ children, className = "", ...props }) {
  return (
    <a
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2.5 text-sm font-extrabold text-white",
        "transition hover:brightness-110 active:scale-[0.99]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}

function SecondaryBtn({ children, className = "", ...props }) {
  return (
    <a
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/60 px-4 py-2.5 text-sm font-extrabold text-slate-900",
        "transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}

function MediaCard({ title, icon, children }) {
  return (
    <NeoCard className="p-4">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-600 dark:text-white/60">
        {icon}
        {title}
      </p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/12 bg-black/5 dark:border-white/10 dark:bg-white/5">
        {children}
      </div>
    </NeoCard>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function VerifyCertificate() {
  const { certNo } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | not_found | error
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizedCertNo = useMemo(() => safeDecodeUri(certNo), [certNo]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!normalizedCertNo) {
        setCertificate(null);
        setStatus("not_found");
        return;
      }

      setStatus("loading");
      setCertificate(null);

      try {
        const res = await publicVerifyCertificate(normalizedCertNo);
        const payload = res?.data?.data || null;

        if (!cancelled) {
          if (payload) {
            setCertificate(payload);
            setStatus("success");
          } else {
            setStatus("not_found");
          }
        }
      } catch (error) {
        if (cancelled) return;
        if (error?.response?.status === 404) setStatus("not_found");
        else setStatus("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [normalizedCertNo, refreshKey]);

  const canonicalPath = normalizedCertNo ? `/verify/${encodeURIComponent(normalizedCertNo)}` : "/verify";

  const studentPhotoUrl = resolveAssetUrl(certificate?.studentId?.photoUrl || "");
  const certificatePdfUrl = resolveAssetUrl(certificate?.pdfUrl || "");
  const certificateImageUrl = resolveAssetUrl(certificate?.imageUrl || "");

  return (
    <PremiumShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <PublicSeo
          title={`Certificate Verification ${normalizedCertNo ? `- ${normalizedCertNo}` : ""}`}
          description="Verify the authenticity of Quest Technology certificates using certificate number."
          canonicalPath={canonicalPath}
          robots="noindex,follow"
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <Pill>
                <ShieldCheck className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                Quest Technology
              </Pill>
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
                Certificate Verification
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
                Certificate No:{" "}
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {normalizedCertNo || "Not provided"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/14 bg-white/60 px-4 py-2 text-xs font-extrabold text-slate-900 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>

              <button
                type="button"
                onClick={() => setRefreshKey((p) => p + 1)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        <NeoCard className="p-6 sm:p-8">
          {/* Loading */}
          {status === "loading" && (
            <div className="rounded-3xl border border-white/12 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-white">
                <LoaderCircle className="h-5 w-5 animate-spin text-cyan-600 dark:text-cyan-300" />
                Validating certificate details...
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-white/55">
                Please wait while we verify the record.
              </p>
            </div>
          )}

          {/* Not found */}
          {status === "not_found" && (
            <StatusBanner
              tone="danger"
              title="Certificate not found"
              desc="The certificate number is invalid or has no matching record."
              action={
                <button
                  type="button"
                  onClick={() => setRefreshKey((p) => p + 1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/14 bg-white/60 px-4 py-2 text-sm font-extrabold text-slate-900 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              }
            />
          )}

          {/* Error */}
          {status === "error" && (
            <StatusBanner
              tone="warning"
              title="Verification unavailable"
              desc="We could not verify this certificate right now. Please retry."
              action={
                <button
                  type="button"
                  onClick={() => setRefreshKey((p) => p + 1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/30 bg-white/60 px-4 py-2 text-sm font-extrabold text-amber-950 transition hover:bg-white/80 dark:border-amber-300/20 dark:bg-white/5 dark:text-amber-200 dark:hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              }
            />
          )}

          {/* Success */}
          {status === "success" && certificate && (
            <div className="space-y-6">
              <StatusBanner
                tone="success"
                title="Certificate is valid"
                desc="This certificate was issued by Quest Technology."
              />

              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                {/* Details */}
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatCard
                      icon={<FileText className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />}
                      label="Certificate No"
                      value={certificate.certNo || "-"}
                    />

                    <StatCard
                      icon={<CalendarDays className="h-4 w-4 text-violet-700 dark:text-violet-300" />}
                      label="Issue Date"
                      value={formatDate(certificate.issueDate)}
                    />

                    <StatCard
                      icon={<UserRound className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />}
                      label="Student Name"
                      value={certificate.studentId?.name || "-"}
                    />

                    <StatCard
                      icon={<IdCard className="h-4 w-4 text-violet-700 dark:text-violet-300" />}
                      label="Student ID"
                      value={certificate.studentId?.studentId || "-"}
                    />

                    <div className="sm:col-span-2">
                      <StatCard
                        icon={<GraduationCap className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />}
                        label="Course"
                        value={certificate.courseId?.title || "-"}
                      />
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                        <CalendarDays className="h-4 w-4" />
                        {certificateDuration(certificate)}
                      </p>
                    </div>

                    <StatCard
                      icon={<BadgeCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />}
                      label="Performance"
                      value={certificate.performance || "-"}
                    />

                    <StatCard
                      icon={<ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />}
                      label="Status"
                      value="Valid"
                      className="bg-emerald-400/10 dark:bg-emerald-400/10"
                    />

                    <div className="sm:col-span-2">
                      <StatCard
                        icon={<CalendarDays className="h-4 w-4 text-violet-700 dark:text-violet-300" />}
                        label="Validity"
                        value={certificateValidity(certificate)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <StatCard
                        icon={<FileText className="h-4 w-4 text-slate-700 dark:text-white/70" />}
                        label="Remarks"
                        value={certificate.remarks || "-"}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {certificatePdfUrl ? (
                      <>
                        <PrimaryBtn href={certificatePdfUrl} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4" />
                          View PDF
                        </PrimaryBtn>

                        <SecondaryBtn
                          href={certificatePdfUrl}
                          download={`${certificate.certNo || "certificate"}.pdf`}
                        >
                          <FileText className="h-4 w-4" />
                          Download PDF
                        </SecondaryBtn>
                      </>
                    ) : null}

                    <SecondaryBtn as={undefined} href={undefined} className="hidden" />
                    <Link
                      to="/"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/60 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Home
                    </Link>
                  </div>
                </div>

                {/* Media */}
                <div className="space-y-5">
                  {certificateImageUrl ? (
                    <MediaCard title="Certificate Preview" icon={<ImageIcon className="h-4 w-4" />}>
                      <img
                        src={certificateImageUrl}
                        alt={`${certificate.certNo || "Certificate"} preview`}
                        className="h-48 w-full object-cover"
                        loading="lazy"
                      />
                    </MediaCard>
                  ) : (
                    <MediaCard title="Certificate Preview" icon={<ImageIcon className="h-4 w-4" />}>
                      <div className="grid h-48 place-items-center text-slate-600 dark:text-white/60">
                        <ImageIcon className="h-7 w-7" />
                        <span className="mt-2 text-sm font-semibold">No preview</span>
                      </div>
                    </MediaCard>
                  )}

                  <MediaCard title="Student Photo" icon={<UserRound className="h-4 w-4" />}>
                    {studentPhotoUrl ? (
                      <img
                        src={studentPhotoUrl}
                        alt={certificate.studentId?.name || "Student"}
                        className="h-64 w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-64 place-items-center text-slate-600 dark:text-white/60">
                        <UserRound className="h-7 w-7" />
                        <span className="mt-2 text-sm font-semibold">No photo</span>
                      </div>
                    )}
                  </MediaCard>
                </div>
              </div>
            </div>
          )}
        </NeoCard>
      </div>
    </PremiumShell>
  );
}