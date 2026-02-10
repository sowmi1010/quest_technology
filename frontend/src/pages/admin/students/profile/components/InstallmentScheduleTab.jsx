import { useEffect, useState } from "react";
import { generateSchedule, getSchedule, payInstallment } from "../../../../../services/paymentScheduleApi";

export default function InstallmentScheduleTab({ studentId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState("Cash");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSchedule(studentId);
      setRows(res.data.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [studentId]);

  const onGenerate = async () => {
    await generateSchedule(studentId);
    load();
  };

  const onPay = async (id) => {
    await payInstallment(id, { method });
    load();
    alert("Installment Paid ✅");
  };

  return (
    <div className="bg-white rounded-2xl border border-peacock-border p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-bold text-peacock-navy">Installment Schedule</h2>
          <p className="text-sm text-gray-600 mt-1">
            Auto schedule based on course total fee and ₹5000 installments.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            className="border rounded-xl p-2"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank</option>
            <option>Online</option>
          </select>

          <button
            onClick={onGenerate}
            className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
          >
            Generate Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 text-gray-600">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="mt-5 text-gray-600">
          No schedule yet. Click <b>Generate Schedule</b>.
        </div>
      ) : (
        <div className="mt-5 overflow-auto border border-peacock-border rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-peacock-bg">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3 font-semibold">{r.installmentNo}</td>
                  <td className="p-3">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-"}</td>
                  <td className="p-3 font-semibold">₹{r.amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg border ${
                        r.status === "PAID"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-yellow-50 border-yellow-200 text-yellow-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.status === "DUE" ? (
                      <button
                        onClick={() => onPay(r._id)}
                        className="px-3 py-1 rounded-xl bg-peacock-green text-white font-semibold hover:opacity-90"
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-gray-500">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        When you mark paid, system auto creates entry in Payments history too ✅
      </div>
    </div>
  );
}
