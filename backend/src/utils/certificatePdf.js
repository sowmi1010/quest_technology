import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN");
}

export async function generateCertificatePDF({
  outPath,
  certNo,
  verifyUrl,
  studentName,
  studentPhotoAbsPath, // absolute file path OR ""
  courseTitle,
  startDate,
  endDate,
  issueDate,
  performance,
  remarks,
}) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // Background light
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#F4FBFF");
  doc.fillColor("#0B1F2A");

  // Border
  doc.lineWidth(2).strokeColor("#0077B6");
  doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();

  // Header
  doc.fontSize(26).fillColor("#0B1F2A").text("QUEST TECHNOLOGY", { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(12).fillColor("#00B894").text("Training • Tuition • Placement Support", { align: "center" });

  doc.moveDown(1);
  doc.fontSize(22).fillColor("#0077B6").text("CERTIFICATE OF COMPLETION", { align: "center" });

  // Cert No
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#0B1F2A").text(`Certificate No: ${certNo}`, { align: "center" });

  // Student Photo box
  const photoX = 60;
  const photoY = 190;
  const photoW = 110;
  const photoH = 130;

  doc.roundedRect(photoX, photoY, photoW, photoH, 10).strokeColor("#D7EEF7").stroke();

  if (studentPhotoAbsPath && fs.existsSync(studentPhotoAbsPath)) {
    try {
      doc.image(studentPhotoAbsPath, photoX + 5, photoY + 5, {
        fit: [photoW - 10, photoH - 10],
        align: "center",
        valign: "center",
      });
    } catch {
      // ignore image error
    }
  } else {
    doc.fontSize(10).fillColor("#6B7280")
      .text("No Photo", photoX, photoY + 55, { width: photoW, align: "center" });
  }

  // Main Text
  doc.fillColor("#0B1F2A");
  doc.fontSize(13);
  doc.text("This is to certify that", 200, 200);

  doc.moveDown(0.5);
  doc.fontSize(22).fillColor("#0B1F2A").text(studentName, 200, 230);

  doc.fontSize(13).fillColor("#0B1F2A");
  doc.text("has successfully completed the course", 200, 270);

  doc.moveDown(0.2);
  doc.fontSize(18).fillColor("#0077B6").text(courseTitle, 200, 300);

  doc.fontSize(12).fillColor("#0B1F2A");
  doc.text(`Course Duration: ${formatDate(startDate)} to ${formatDate(endDate)}`, 200, 340);
  doc.text(`Issue Date: ${formatDate(issueDate)}`, 200, 360);

  if (performance) doc.text(`Performance: ${performance}`, 200, 380);
  if (remarks) doc.text(`Remarks: ${remarks}`, 200, 400);

  // QR code
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrBase64, "base64");

  const qrX = 60;
  const qrY = 600;
  doc.image(qrBuffer, qrX, qrY, { fit: [110, 110] });
  doc.fontSize(9).fillColor("#6B7280").text("Scan to Verify", qrX, qrY + 115, { width: 110, align: "center" });

  // Signature area (simple)
  doc.fillColor("#0B1F2A");
  doc.fontSize(11).text("Authorized Signatory", 420, 660);
  doc.moveTo(400, 650).lineTo(540, 650).strokeColor("#0B1F2A").stroke();

  // Footer
  doc.fontSize(9).fillColor("#6B7280")
    .text("Quest Technology • This certificate is system generated and verifiable by QR.", 40, 780, { align: "center" });

  doc.end();

  await new Promise((resolve) => stream.on("finish", resolve));
}
