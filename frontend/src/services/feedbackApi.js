import { api } from "./api";

export const listFeedback = () => api.get("/feedback");
export const getFeedback = (id) => api.get(`/feedback/${id}`);

export const createFeedback = (formData) =>
  api.post("/feedback", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const updateFeedback = (id, formData) =>
  api.patch(`/feedback/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

export const deleteFeedback = (id) => api.delete(`/feedback/${id}`);


export const listPublicFeedback = () => api.get("/feedback/public");
