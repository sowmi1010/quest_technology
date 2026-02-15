import { api } from "./api";

export const adminListGallery = (category) =>
  api.get("/gallery", { params: category ? { category } : {} });

export const adminGetGallery = (id) => api.get(`/gallery/${id}`);

export const adminCreateGallery = (formData) =>
  api.post("/gallery", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminUpdateGallery = (id, payload, isMultipart = false) =>
  api.patch(`/gallery/${id}`, payload, isMultipart ? { headers: { "Content-Type": "multipart/form-data" } } : {});

export const adminDeleteGallery = (id) => api.delete(`/gallery/${id}`);

export const publicListGallery = (category) =>
  api.get("/gallery/public", { params: category ? { category } : {} });
