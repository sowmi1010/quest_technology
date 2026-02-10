export function generateCertNo(seq) {
  const year = new Date().getFullYear();
  return `QT-CERT-${year}-${String(seq).padStart(4, "0")}`;
}
