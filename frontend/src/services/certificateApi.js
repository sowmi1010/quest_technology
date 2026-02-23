import { api } from "./api";

export const adminIssueCertificate = (payload) => api.post("/certificates/issue", payload);
export const adminListCertificates = (params = {}) =>
  api.get("/certificates", { params });
export const adminDeleteCertificate = (id) => api.delete(`/certificates/${id}`);
export const publicVerifyCertificate = (certNo) => api.get(`/certificates/verify/${certNo}`);
