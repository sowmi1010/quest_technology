import { api } from "./api";

export const adminListMou = () => api.get("/mou");
export const adminGetMou = (id) => api.get(`/mou/${id}`);

export const adminCreateMou = (formData) =>
  api.post("/mou", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminUpdateMou = (id, formData) =>
  api.patch(`/mou/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminDeleteMou = (id) => api.delete(`/mou/${id}`);

export const publicListMou = () => api.get("/mou/public");
