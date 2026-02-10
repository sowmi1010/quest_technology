import { api } from "./api";

export const getStudentsByBatch = (batchType) =>
  api.get("/attendance/students", { params: { batchType } });

export const getAttendanceByDate = (date, batchType) =>
  api.get("/attendance", { params: { date, batchType } });

export const saveAttendance = (payload) =>
  api.post("/attendance", payload);

export const getAttendanceReport = (start, end, batchType) =>
  api.get("/attendance/report", {
    params: { start, end, batchType: batchType || undefined },
  });

  export const getStudentAttendanceRange = (studentId, start, end) =>
  api.get(`/attendance/student/${studentId}`, { params: { start, end } });
