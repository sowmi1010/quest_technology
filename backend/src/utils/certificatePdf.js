import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN");
}

function fitFontSize(doc, text, maxWidth, maxSize, minSize = 12) {
  let size = maxSize;
  while (size > minSize) {
    doc.fontSize(size);
    if (doc.widthOfString(text) <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function drawInfoLine(doc, { x, y, label, value, width }) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#334155")
    .text(`${label}:`, x, y, { width: 88 });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#0F172A")
    .text(String(value || "-"), x + 90, y, { width: width - 90 });
}

async function getStudentPhotoBuffer(source) {
  const raw = String(source || "").trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const response = await fetch(raw);
      if (!response.ok) return null;

      const bytes = await response.arrayBuffer();
      return Buffer.from(bytes);
    } catch {
      return null;
    }
  }

  const localPath = path.isAbsolute(raw)
    ? raw
    : path.join(process.cwd(), raw.replace(/^\/+/, ""));

  if (!fs.existsSync(localPath)) return null;

  try {
    return fs.readFileSync(localPath);
  } catch {
    return null;
  }
}

export async function generateCertificatePDF({
  outPath,
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
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const studentPhotoBuffer = await getStudentPhotoBuffer(studentPhotoSource);

  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const pageW = doc.page.width;
  const pageH = doc.page.height;

  // Base background
  doc.rect(0, 0, pageW, pageH).fill("#F8FBFF");

  // Subtle decorative glows
  doc.save();
  doc.fillOpacity(0.15).fillColor("#000080");
  doc.circle(40, 40, 110).fill();
  doc.fillOpacity(0.12).fillColor("#008000");
  doc.circle(pageW - 30, pageH - 30, 120).fill();
  doc.restore();

  // Premium dual frame
  doc.lineWidth(3).strokeColor("#000080");
  doc.roundedRect(24, 24, pageW - 48, pageH - 48, 16).stroke();
  doc.lineWidth(1).strokeColor("#008000");
  doc.roundedRect(32, 32, pageW - 64, pageH - 64, 12).stroke();

  // Header bar
  doc.save();
  doc.roundedRect(48, 48, pageW - 96, 88, 10).fill("#000080");
  doc.restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(29)
    .fillColor("#FFFFFF")
    .text("QUEST TECHNOLOGY", 48, 72, { width: pageW - 96, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#DDE7FF")
    .text("Skill Training | Tuition | Placement Support", 48, 108, {
      width: pageW - 96,
      align: "center",
    });

  // Title + metadata
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#008000")
    .text("CERTIFICATE OF COMPLETION", 48, 158, { width: pageW - 96, align: "center" });

  doc
    .font("Times-Bold")
    .fontSize(31)
    .fillColor("#000080")
    .text("Achievement Certificate", 48, 176, { width: pageW - 96, align: "center" });

  drawInfoLine(doc, {
    x: 345,
    y: 226,
    label: "Certificate No",
    value: certNo,
    width: 200,
  });

  drawInfoLine(doc, {
    x: 345,
    y: 244,
    label: "Issue Date",
    value: formatDate(issueDate),
    width: 200,
  });

  drawInfoLine(doc, {
    x: 345,
    y: 262,
    label: "Generated On",
    value: formatDate(new Date()),
    width: 200,
  });

  // Left photo card
  const photoCardX = 58;
  const photoCardY = 228;
  const photoCardW = 142;
  const photoCardH = 176;

  doc.roundedRect(photoCardX, photoCardY, photoCardW, photoCardH, 10).fillAndStroke("#FFFFFF", "#C8DCF6");

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#334155")
    .text("Student Photo", photoCardX, photoCardY + 10, { width: photoCardW, align: "center" });

  const photoX = photoCardX + 11;
  const photoY = photoCardY + 34;
  const photoW = photoCardW - 22;
  const photoH = photoCardH - 46;

  doc.roundedRect(photoX, photoY, photoW, photoH, 8).strokeColor("#D6E5FA").stroke();

  if (studentPhotoBuffer) {
    try {
      doc.image(studentPhotoBuffer, photoX + 4, photoY + 4, {
        fit: [photoW - 8, photoH - 8],
        align: "center",
        valign: "center",
      });
    } catch {
      // Ignore student image loading errors and keep placeholder.
    }
  } else {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#64748B")
      .text("No Photo", photoX, photoY + photoH / 2 - 6, { width: photoW, align: "center" });
  }

  // Main statement
  const contentX = 220;
  const contentW = 315;

  doc
    .font("Helvetica")
    .fontSize(13)
    .fillColor("#0F172A")
    .text("This is to certify that", contentX, 300, { width: contentW, align: "center" });

  const nameText = String(studentName || "Student");
  const nameSize = fitFontSize(doc, nameText, contentW - 8, 32, 19);
  doc
    .font("Times-BoldItalic")
    .fontSize(nameSize)
    .fillColor("#111827")
    .text(nameText, contentX, 322, { width: contentW, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(13)
    .fillColor("#0F172A")
    .text("has successfully completed the training program", contentX, 366, {
      width: contentW,
      align: "center",
    });

  // Course highlight card
  const courseBoxY = 396;
  const courseBoxH = 90;
  doc.roundedRect(contentX, courseBoxY, contentW, courseBoxH, 10).fillAndStroke("#F2F8FF", "#BDD6FA");

  const courseText = String(courseTitle || "Course");
  const courseSize = fitFontSize(doc, courseText, contentW - 30, 20, 13);
  doc
    .font("Helvetica-Bold")
    .fontSize(courseSize)
    .fillColor("#000080")
    .text(courseText, contentX + 14, courseBoxY + 18, {
      width: contentW - 28,
      align: "center",
    });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#334155")
    .text(`Course Duration: ${formatDate(startDate)} to ${formatDate(endDate)}`, contentX + 14, courseBoxY + 58, {
      width: contentW - 28,
      align: "center",
    });

  // Performance and remarks
  const perfBoxY = 500;
  const perfBoxH = 118;
  doc.roundedRect(contentX, perfBoxY, contentW, perfBoxH, 10).fillAndStroke("#F8FFF5", "#BEE4C7");

  drawInfoLine(doc, {
    x: contentX + 12,
    y: perfBoxY + 14,
    label: "Performance",
    value: performance || "-",
    width: contentW - 24,
  });

  drawInfoLine(doc, {
    x: contentX + 12,
    y: perfBoxY + 34,
    label: "Remarks",
    value: "",
    width: contentW - 24,
  });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#0F172A")
    .text(String(remarks || "-"), contentX + 102, perfBoxY + 34, {
      width: contentW - 114,
      height: 56,
      ellipsis: true,
    });

  // QR code + verification panel
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrBase64, "base64");

  const qrCardX = 58;
  const qrCardY = 430;
  const qrCardW = 142;
  const qrCardH = 188;
  doc.roundedRect(qrCardX, qrCardY, qrCardW, qrCardH, 10).fillAndStroke("#FFFFFF", "#C8DCF6");

  const qrX = qrCardX + 17;
  const qrY = qrCardY + 20;
  doc.image(qrBuffer, qrX, qrY, { fit: [108, 108] });

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#334155")
    .text("Scan to Verify", qrCardX, qrY + 114, { width: qrCardW, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#64748B")
    .text("System generated certificate", qrCardX + 10, qrY + 132, {
      width: qrCardW - 20,
      align: "center",
    });

  // Sign-off area
  const signLineY = 678;
  doc.lineWidth(1).strokeColor("#111827");
  doc.moveTo(330, signLineY).lineTo(510, signLineY).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#0F172A")
    .text("Authorized Signatory", 330, signLineY + 8, { width: 180, align: "center" });

  doc.lineWidth(1).strokeColor("#111827");
  doc.moveTo(95, signLineY).lineTo(250, signLineY).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#0F172A")
    .text("Seal", 95, signLineY + 8, { width: 155, align: "center" });

  // Footer
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#6B7280")
    .text("Quest Technology | This certificate can be verified using QR code and certificate number.", 48, 792, {
      width: pageW - 96,
      align: "center",
    });

  doc.end();
  await new Promise((resolve) => stream.on("finish", resolve));
}
