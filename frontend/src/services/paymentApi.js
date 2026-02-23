import { api } from "./api";

export const addPayment = (payload) =>
  api.post("/payments", payload);

export const getPaymentsOverview = (params = {}) =>
  api.get("/payments/overview", { params });

export const getStudentPayments = (studentId) =>
  api.get(`/payments/student/${studentId}`);

export const deletePayment = (id) =>
  api.delete(`/payments/${id}`);
