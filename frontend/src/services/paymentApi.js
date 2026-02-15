import { api } from "./api";

export const addPayment = (payload) =>
  api.post("/payments", payload);

export const getPaymentsOverview = () =>
  api.get("/payments/overview");

export const getStudentPayments = (studentId) =>
  api.get(`/payments/student/${studentId}`);

export const deletePayment = (id) =>
  api.delete(`/payments/${id}`);
