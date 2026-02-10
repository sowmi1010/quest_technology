import { api } from "./api";

export const generateSchedule = (studentId) =>
  api.post(`/payment-schedule/student/${studentId}/generate`);

export const getSchedule = (studentId) =>
  api.get(`/payment-schedule/student/${studentId}`);

export const payInstallment = (scheduleId, payload) =>
  api.post(`/payment-schedule/${scheduleId}/pay`, payload);
