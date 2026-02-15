import { api } from "./api";

export const createPerformanceUpdate = (payload) =>
  api.post("/performance", payload);

export const getStudentPerformanceUpdates = (studentId) =>
  api.get(`/performance/student/${studentId}`);

export const updatePerformanceUpdate = (id, payload) =>
  api.patch(`/performance/${id}`, payload);

export const deletePerformanceUpdate = (id) =>
  api.delete(`/performance/${id}`);
