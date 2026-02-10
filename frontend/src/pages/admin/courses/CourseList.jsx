import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminGetCourses } from "../../../services/courseApi";

export default function CourseList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetCourses();
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-peacock-navy">Courses</h1>

        <Link
          to="/admin/courses/new"
          className="px-4 py-2 rounded-xl bg-peacock-blue text-white font-semibold hover:opacity-90"
        >
          + Add Course
        </Link>
      </div>

      <div className="mt-4 overflow-auto bg-white rounded-2xl border border-peacock-border">
        <table className="w-full text-sm">
          <thead className="bg-peacock-bg">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Fee</th>
              <th className="p-3 text-left">Public</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-3">
                  {c.imageUrl ? (
                    <img
                      src={`http://localhost:5000${c.imageUrl}`}
                      alt={c.title}
                      className="h-10 w-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded-lg bg-peacock-bg border border-peacock-border flex items-center justify-center text-xs text-gray-500">
                      No Img
                    </div>
                  )}
                </td>

                <td className="p-3 font-semibold text-peacock-navy">
                  {c.title}
                </td>

                <td className="p-3">{c.categoryId?.name || "-"}</td>
                <td className="p-3">{c.duration}</td>
                <td className="p-3">₹{c.totalFee}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg border ${
                      c.isPublic
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    {c.isPublic ? "YES" : "NO"}
                  </span>
                </td>

                <td className="p-3">
                  <Link
                    to={`/admin/courses/${c._id}/edit`}
                    className="text-peacock-blue font-semibold underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No courses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Note: Category name shows only if you saved categoryId properly.
      </div>
    </div>
  );
}
