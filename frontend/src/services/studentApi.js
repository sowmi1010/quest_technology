import { api } from "./api";

export const adminGetStudents = (params = {}) => api.get("/students", { params });
export const adminGetStudent = (id) => api.get(`/students/${id}`);

export const adminCreateStudent = (formData) =>
  api.post("/students", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const adminUpdateStudent = (id, formData) =>
  api.patch(`/students/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

export const adminDeleteStudent = (id) => api.delete(`/students/${id}`);
