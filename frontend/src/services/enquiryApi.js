import { api } from "./api";

export const submitEnquiry = (payload) => api.post("/enquiries", payload);
export const getEnquiries = () => api.get("/enquiries");
export const getEnquiry = (id) => api.get(`/enquiries/${id}`);
