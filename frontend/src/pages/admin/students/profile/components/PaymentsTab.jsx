import { useEffect, useState } from "react";
import {
  addPayment,
  getStudentPayments,
  deletePayment,
} from "../../../../../services/paymentApi";

export default function PaymentsTab({ studentId }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");

  const load = async () => {
    const res = await getStudentPayments(studentId);
    setRows(res.data.data.payments);
    setSummary(res.data.data.summary);
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async () => {
    if (!amount) return;

    await addPayment({
      studentId,
      amount: Number(amount),
      method,
    });

    setAmount("");
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete payment?")) return;
    await deletePayment(id);
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-peacock-border p-6">
      <h2 className="font-bold text-peacock-navy">Payments</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
        <Box label="Total Fee" value={`₹${summary.totalFee || 0}`} />
        <Box label="Paid" value={`₹${summary.totalPaid || 0}`} />
        <Box
          label="Balance"
          value={`₹${summary.balance || 0}`}
          highlight
        />
      </div>

      {/* Add payment */}
      <div className="flex gap-2 mt-5">
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-xl p-2"
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="border rounded-xl p-2"
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Bank</option>
          <option>Online</option>
        </select>

        <button
          onClick={onAdd}
          className="bg-peacock-blue text-white px-4 rounded-xl"
        >
          Add
        </button>
      </div>

      {/* History */}
      <table className="w-full mt-5 text-sm">
        <thead className="bg-peacock-bg">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Method</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((p) => (
            <tr key={p._id} className="border-t">
              <td className="p-2">
                {new Date(p.date).toLocaleDateString()}
              </td>
              <td className="p-2 font-semibold">₹{p.amount}</td>
              <td className="p-2">{p.method}</td>
              <td className="p-2">
                <button
                  onClick={() => onDelete(p._id)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Box({ label, value, highlight }) {
  return (
    <div className={`p-3 rounded-xl border ${highlight ? "bg-yellow-50" : "bg-peacock-bg"}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
