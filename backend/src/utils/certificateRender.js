import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const DEFAULT_PUPPETEER_ARGS = ["--no-sandbox", "--disable-setuid-sandbox"];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeMimeFromPath(filePath = "") {
  const ext = path.extname(String(filePath || "")).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function normalizeImageMime(mime = "", filePath = "") {
  const raw = String(mime || "").trim().toLowerCase();
  if (raw.startsWith("image/")) {
    return raw.split(";")[0];
  }
  return normalizeMimeFromPath(filePath);
}

function toDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function getStudentPhotoDataUrl(source) {
  const raw = String(source || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    try {
      const response = await fetch(raw);
      if (!response.ok) return "";

      const bytes = Buffer.from(await response.arrayBuffer());
      const mimeType = normalizeImageMime(
        response.headers.get("content-type"),
        raw
      );
      return toDataUrl(bytes, mimeType);
    } catch {
      return "";
    }
  }

  const localPath = path.isAbsolute(raw)
    ? raw
    : path.join(process.cwd(), raw.replace(/^\/+/, ""));

  if (!fs.existsSync(localPath)) return "";

  try {
    const bytes = fs.readFileSync(localPath);
    return toDataUrl(bytes, normalizeImageMime("", localPath));
  } catch {
    return "";
  }
}

function resolveDurationLabel({ startDate, endDate }) {
  if (!startDate && !endDate) return "-";
  return `${formatDate(startDate)} to ${formatDate(endDate)}`;
}

function buildCertificateHtml({
  certNo,
  verifyUrl,
  qrDataUrl,
  studentName,
  studentPhotoDataUrl,
  courseTitle,
  startDate,
  endDate,
  issueDate,
  performance,
  remarks,
}) {
  const safeCertNo = escapeHtml(certNo);
  const safeStudentName = escapeHtml(studentName || "Student");
  const safeCourseTitle = escapeHtml(courseTitle || "Course");
  const safePerformance = escapeHtml(performance || "-");
  const safeRemarks = escapeHtml(remarks || "-");
  const safeDuration = escapeHtml(resolveDurationLabel({ startDate, endDate }));
  const safeIssueDate = escapeHtml(formatDate(issueDate));
  const safeGeneratedDate = escapeHtml(formatDate(new Date()));
  const safeVerifyUrl = escapeHtml(verifyUrl || "");
  const photoHtml = studentPhotoDataUrl
    ? `<img src="${studentPhotoDataUrl}" alt="Student photo" class="student-photo" />`
    : `<div class="photo-placeholder">No Photo</div>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Certificate ${safeCertNo}</title>
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        background: #f8fbff;
      }
      body {
        color: #0f172a;
      }
      .page {
        position: relative;
        width: 210mm;
        height: 297mm;
        padding: 14mm;
        background:
          radial-gradient(circle at 10% 10%, rgba(0, 0, 128, 0.08), transparent 35%),
          radial-gradient(circle at 90% 92%, rgba(0, 128, 0, 0.08), transparent 35%),
          #f8fbff;
      }
      .frame-outer {
        position: absolute;
        inset: 8mm;
        border: 3px solid #000080;
        border-radius: 14px;
      }
      .frame-inner {
        position: absolute;
        inset: 11mm;
        border: 1px solid #008000;
        border-radius: 10px;
      }
      .content {
        position: relative;
        z-index: 2;
        height: 100%;
      }
      .header {
        background: #000080;
        color: #ffffff;
        border-radius: 10px;
        padding: 10mm 8mm 7mm;
        text-align: center;
      }
      .brand {
        margin: 0;
        font-size: 34px;
        letter-spacing: 1px;
        font-weight: 800;
      }
      .tagline {
        margin-top: 4mm;
        font-size: 13px;
        color: #dbe7ff;
      }
      .title-wrap {
        margin-top: 8mm;
        text-align: center;
      }
      .sub-title {
        margin: 0;
        color: #008000;
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 1px;
      }
      .title {
        margin: 3mm 0 0;
        color: #000080;
        font-family: "Times New Roman", Times, serif;
        font-size: 46px;
        font-weight: 700;
      }
      .meta {
        margin-top: 4mm;
        margin-left: auto;
        width: 64mm;
        font-size: 12px;
        line-height: 1.8;
      }
      .meta-row {
        display: flex;
        gap: 4mm;
      }
      .meta-label {
        width: 30mm;
        font-weight: 700;
        color: #334155;
      }
      .main {
        margin-top: 3mm;
        display: grid;
        grid-template-columns: 40mm 1fr 40mm;
        gap: 6mm;
      }
      .side-card {
        border: 1px solid #c8dcf6;
        border-radius: 10px;
        background: #ffffff;
        padding: 3mm;
      }
      .side-title {
        margin: 0 0 2mm;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        color: #334155;
      }
      .photo-slot {
        border: 1px solid #d6e5fa;
        border-radius: 8px;
        height: 52mm;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f9fbff;
      }
      .student-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .photo-placeholder {
        color: #64748b;
        font-size: 12px;
      }
      .center {
        text-align: center;
      }
      .lead {
        margin-top: 9mm;
        font-size: 20px;
      }
      .student-name {
        margin-top: 2mm;
        color: #111827;
        font-family: "Times New Roman", Times, serif;
        font-size: 52px;
        font-style: italic;
        font-weight: 700;
        line-height: 1.1;
        word-break: break-word;
      }
      .statement {
        margin-top: 5mm;
        font-size: 20px;
      }
      .course-box {
        margin-top: 5mm;
        border: 1px solid #bdd6fa;
        border-radius: 10px;
        background: #f2f8ff;
        padding: 5mm 4mm;
      }
      .course-title {
        color: #000080;
        font-weight: 700;
        font-size: 28px;
        line-height: 1.2;
      }
      .duration {
        margin-top: 3mm;
        color: #334155;
        font-size: 14px;
      }
      .perf-box {
        margin-top: 5mm;
        border: 1px solid #bee4c7;
        border-radius: 10px;
        background: #f8fff5;
        padding: 3mm 4mm;
        text-align: left;
      }
      .perf-row {
        font-size: 13px;
        margin-top: 1.5mm;
      }
      .perf-label {
        display: inline-block;
        width: 28mm;
        color: #334155;
        font-weight: 700;
      }
      .perf-value {
        color: #0f172a;
      }
      .remarks {
        margin-top: 2mm;
        color: #0f172a;
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
        min-height: 12mm;
      }
      .qr-wrap {
        margin-top: 2mm;
      }
      .qr-card {
        border: 1px solid #c8dcf6;
        border-radius: 10px;
        background: #ffffff;
        padding: 3mm;
        text-align: center;
      }
      .qr-card img {
        width: 28mm;
        height: 28mm;
        margin-top: 1mm;
      }
      .qr-title {
        margin-top: 2mm;
        font-size: 10px;
        color: #334155;
        font-weight: 700;
      }
      .qr-sub {
        margin-top: 1.5mm;
        font-size: 9px;
        color: #64748b;
      }
      .verify-link {
        margin-top: 2mm;
        font-size: 8.5px;
        color: #64748b;
        word-break: break-all;
      }
      .signatures {
        margin-top: 8mm;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20mm;
      }
      .signature {
        text-align: center;
      }
      .line {
        border-top: 1px solid #111827;
        margin: 0 auto;
        width: 46mm;
      }
      .sign-label {
        margin-top: 2mm;
        font-size: 12px;
        font-weight: 700;
      }
      .footer {
        margin-top: 8mm;
        text-align: center;
        color: #6b7280;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="frame-outer"></div>
      <div class="frame-inner"></div>
      <div class="content">
        <header class="header">
          <h1 class="brand">QUEST TECHNOLOGY</h1>
          <div class="tagline">Skill Training | Tuition | Placement Support</div>
        </header>

        <section class="title-wrap">
          <p class="sub-title">CERTIFICATE OF COMPLETION</p>
          <h2 class="title">Achievement Certificate</h2>
        </section>

        <section class="meta">
          <div class="meta-row"><span class="meta-label">Certificate No:</span><span>${safeCertNo}</span></div>
          <div class="meta-row"><span class="meta-label">Issue Date:</span><span>${safeIssueDate}</span></div>
          <div class="meta-row"><span class="meta-label">Generated On:</span><span>${safeGeneratedDate}</span></div>
        </section>

        <section class="main">
          <aside class="side-card">
            <p class="side-title">Student Photo</p>
            <div class="photo-slot">${photoHtml}</div>
          </aside>

          <main class="center">
            <div class="lead">This is to certify that</div>
            <div class="student-name">${safeStudentName}</div>
            <div class="statement">has successfully completed the training program</div>

            <div class="course-box">
              <div class="course-title">${safeCourseTitle}</div>
              <div class="duration">Course Duration: ${safeDuration}</div>
            </div>

            <div class="perf-box">
              <div class="perf-row"><span class="perf-label">Performance:</span><span class="perf-value">${safePerformance}</span></div>
              <div class="perf-row"><span class="perf-label">Remarks:</span></div>
              <div class="remarks">${safeRemarks}</div>
            </div>
          </main>

          <aside class="qr-wrap">
            <div class="qr-card">
              <img src="${qrDataUrl}" alt="Verification QR code" />
              <div class="qr-title">Scan to Verify</div>
              <div class="qr-sub">System generated certificate</div>
              <div class="verify-link">${safeVerifyUrl}</div>
            </div>
          </aside>
        </section>

        <section class="signatures">
          <div class="signature">
            <div class="line"></div>
            <div class="sign-label">Seal</div>
          </div>
          <div class="signature">
            <div class="line"></div>
            <div class="sign-label">Authorized Signatory</div>
          </div>
        </section>

        <footer class="footer">
          Quest Technology | This certificate can be verified using QR code and certificate number.
        </footer>
      </div>
    </div>
  </body>
</html>`;
}

function resolveLaunchOptions() {
  const customArgs = String(process.env.PUPPETEER_ARGS || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const args = [...DEFAULT_PUPPETEER_ARGS, ...customArgs];

  const executablePath = String(
    process.env.PUPPETEER_EXECUTABLE_PATH || ""
  ).trim();

  return {
    headless: "new",
    args,
    ...(executablePath ? { executablePath } : {}),
  };
}

async function loadPuppeteer() {
  try {
    const mod = await import("puppeteer");
    return mod?.default || mod;
  } catch {
    throw new Error(
      "Puppeteer is required for certificate generation. Install backend dependencies and retry."
    );
  }
}

export async function generateCertificateAssets({
  pdfOutPath,
  imageOutPath,
  certNo,
  verifyUrl,
  studentName,
  studentPhotoSource,
  courseTitle,
  startDate,
  endDate,
  issueDate,
  performance,
  remarks,
}) {
  fs.mkdirSync(path.dirname(pdfOutPath), { recursive: true });
  fs.mkdirSync(path.dirname(imageOutPath), { recursive: true });

  const [studentPhotoDataUrl, qrDataUrl] = await Promise.all([
    getStudentPhotoDataUrl(studentPhotoSource),
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 256 }),
  ]);

  const html = buildCertificateHtml({
    certNo,
    verifyUrl,
    qrDataUrl,
    studentName,
    studentPhotoDataUrl,
    courseTitle,
    startDate,
    endDate,
    issueDate,
    performance,
    remarks,
  });

  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch(resolveLaunchOptions());

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    await page.pdf({
      path: pdfOutPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await page.screenshot({
      path: imageOutPath,
      type: "png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

