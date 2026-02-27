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
  UserRound,
} from "lucide-react";
import PublicSeo from "../../components/seo/PublicSeo";
import { publicVerifyCertificate } from "../../services/certificateApi";
import { resolveAssetUrl } from "../../utils/apiConfig";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function certificateDuration(cert) {
  if (cert?.courseId?.duration) return cert.courseId.duration;
  if (cert?.startDate || cert?.endDate) {
    return `${formatDate(cert.startDate)} to ${formatDate(cert.endDate)}`;
  }
  return "-";
}

function certificateValidity(cert) {
  if (cert?.startDate || cert?.endDate) {
    return `${formatDate(cert.startDate)} to ${formatDate(cert.endDate)}`;
  }
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

export default function VerifyCertificate() {
  const { certNo } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [status, setStatus] = useState("loading");
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
        if (error?.response?.status === 404) {
          setStatus("not_found");
        } else {
          setStatus("error");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [normalizedCertNo, refreshKey]);

  const canonicalPath = normalizedCertNo
    ? `/verify/${encodeURIComponent(normalizedCertNo)}`
    : "/verify";

  const studentPhotoUrl = resolveAssetUrl(certificate?.studentId?.photoUrl || "");
  const certificatePdfUrl = resolveAssetUrl(certificate?.pdfUrl || "");
  const certificateImageUrl = resolveAssetUrl(certificate?.imageUrl || "");

  return (
    <div className="mx-auto w-full max-w-5xl px-0">
      <PublicSeo
        title={`Certificate Verification ${normalizedCertNo ? `- ${normalizedCertNo}` : ""}`}
        description="Verify the authenticity of Quest Technology certificates using certificate number."
        canonicalPath={canonicalPath}
        robots="noindex,follow"
      />

      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-peacock-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-peacock-green/15 blur-3xl" />

        <p className="badge-soft">Quest Technology</p>
        <h1 className="mt-4 text-2xl font-extrabold text-peacock-navy sm:text-3xl">
          Certificate Verification
        </h1>
        <p className="mt-2 text-sm text-peacock-muted">
          Certificate No:{" "}
          <span className="font-bold text-peacock-navy">
            {normalizedCertNo || "Not provided"}
          </span>
        </p>

        {status === "loading" && (
          <div className="mt-6 rounded-2xl border border-peacock-border/70 bg-white/80 px-4 py-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-peacock-navy">
              <LoaderCircle className="h-5 w-5 animate-spin text-peacock-blue" />
              Validating certificate details...
            </div>
          </div>
        )}

        {status === "not_found" && (
          <div className="mt-6 rounded-2xl border border-rose-300/60 bg-rose-50/80 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-700" />
              <div>
                <h2 className="text-base font-bold text-rose-900">
                  Certificate not found
                </h2>
                <p className="mt-1 text-sm text-rose-800/90">
                  The certificate number is invalid or has no matching record.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 rounded-2xl border border-amber-300/70 bg-amber-50/85 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <h2 className="text-base font-bold text-amber-900">
                  Verification unavailable
                </h2>
                <p className="mt-1 text-sm text-amber-900/85">
                  We could not verify this certificate right now. Please retry.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/60 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-white"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {status === "success" && certificate && (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50/75 px-4 py-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
                <div>
                  <h2 className="text-base font-bold text-emerald-900">
                    Certificate is valid
                  </h2>
                  <p className="mt-1 text-sm text-emerald-900/85">
                    This certificate was issued by Quest Technology.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
              <div className="rounded-2xl border border-peacock-border/75 bg-white/85 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      Certificate No
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {certificate.certNo || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      Issue Date
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {formatDate(certificate.issueDate)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      <UserRound className="h-3.5 w-3.5" />
                      Student Name
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {certificate.studentId?.name || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      <IdCard className="h-3.5 w-3.5" />
                      Student ID
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {certificate.studentId?.studentId || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3 sm:col-span-2">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Course
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {certificate.courseId?.title || "-"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-peacock-muted">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {certificateDuration(certificate)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      Performance
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {certificate.performance || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      Certificate Status
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      Valid
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      Validity
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {certificateValidity(certificate)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-peacock-border/60 bg-peacock-bg/45 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      Remarks
                    </p>
                    <p className="mt-1 text-sm font-bold text-peacock-navy">
                      {certificate.remarks || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {certificatePdfUrl && (
                    <>
                      <a
                        href={certificatePdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                      >
                        <FileText className="h-4 w-4" />
                        View Certificate PDF
                      </a>
                      <a
                        href={certificatePdfUrl}
                        download={`${certificate.certNo || "certificate"}.pdf`}
                        className="btn-secondary"
                      >
                        <FileText className="h-4 w-4" />
                        Download PDF
                      </a>
                    </>
                  )}

                  <Link to="/" className="btn-secondary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                {certificateImageUrl && (
                  <div className="rounded-2xl border border-peacock-border/70 bg-white/80 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Certificate Preview
                    </p>

                    <div className="mt-3 overflow-hidden rounded-xl border border-peacock-border/70 bg-peacock-bg/40">
                      <img
                        src={certificateImageUrl}
                        alt={`${certificate.certNo || "Certificate"} preview`}
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-peacock-border/70 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-peacock-muted">
                    Student Photo
                  </p>

                  <div className="mt-3 overflow-hidden rounded-xl border border-peacock-border/70 bg-peacock-bg/40">
                    {studentPhotoUrl ? (
                      <img
                        src={studentPhotoUrl}
                        alt={certificate.studentId?.name || "Student"}
                        className="h-60 w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-60 place-items-center text-peacock-muted">
                        <UserRound className="h-8 w-8" />
                        <span className="mt-2 text-sm font-semibold">No photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
