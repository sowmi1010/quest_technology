export function generateStudentId(serial) {
  const safeSerial = Number.isFinite(Number(serial)) ? Number(serial) : 1;
  const normalized = Math.max(1, Math.trunc(safeSerial));
  return `STU${String(normalized).padStart(4, "0")}`;
}

export default { generateStudentId };
