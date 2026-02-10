import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminDeleteStudent,
  adminGetStudents,
} from "../../../services/studentApi";

export default function StudentList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetStudents();
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    await adminDeleteStudent(id);
    load();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-peacock-navy">Students</h1>

        <Link
          to="/admin/students/new"
          className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
        >
          + Add Student
        </Link>
      </div>

      <div className="mt-4 overflow-auto bg-white rounded-2xl border border-peacock-border">
        <table className="w-full text-sm">
          <thead className="bg-peacock-bg">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Student ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Student Phone</th>
              <th className="p-3 text-left">Parent Phone</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">
                  {s.photoUrl ? (
                    <img
                      src={`http://localhost:5000${s.photoUrl}`}
                      alt={s.name}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-peacock-bg border border-peacock-border flex items-center justify-center text-xs text-gray-500">
                      No
                    </div>
                  )}
                </td>

                <td className="p-3 font-semibold text-peacock-navy">
                  {s.studentId}
                </td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.courseId?.title || "-"}</td>
                <td className="p-3">{s.studentNumber || "-"}</td>
                <td className="p-3">{s.fatherNumber || "-"}</td>
                <td className="p-3">{s.batchType || "-"}</td>

                <td className="p-3">
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/students/${s._id}`}
                      className="text-peacock-blue font-semibold underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => onDelete(s._id)}
                      className="text-red-600 font-semibold underline"
                    >
                      Delete
                    </button>

                    <Link
                      to={`/admin/students/${s._id}/profile`}
                      className="text-peacock-green font-semibold underline"
                    >
                      Profile
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
