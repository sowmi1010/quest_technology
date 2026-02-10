import { api } from "./api";

export const adminGetCourses = () => api.get("/courses");
export const adminGetCourse = (id) => api.get(`/courses/${id}`);

export const adminCreateCourse = (formData) =>
  api.post("/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminUpdateCourse = (id, formData) =>
  api.patch(`/courses/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });


  // PUBLIC
export const publicGetCourses = (categoryId) =>
  api.get("/courses/public", { params: categoryId ? { categoryId } : {} });

export const publicGetCourse = (id) => api.get(`/courses/public/${id}`);
