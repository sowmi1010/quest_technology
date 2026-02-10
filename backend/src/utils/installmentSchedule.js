export function buildInstallments({
  totalFee,
  installmentStart = 5000,
  startDate = new Date(),
  gapDays = 30, // every month
}) {
  const list = [];
  if (!totalFee || totalFee <= 0) return list;

  let remaining = totalFee;
  let i = 1;

  while (remaining > 0) {
    const amount = remaining >= installmentStart ? installmentStart : remaining;
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + gapDays * (i - 1));

    list.push({
      installmentNo: i,
      dueDate,
      amount,
      status: "DUE",
    });

    remaining -= amount;
    i++;
  }

  return list;
}
