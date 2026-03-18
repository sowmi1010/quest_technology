import { api } from "./api";

export const listQuizzes = (params = {}) => api.get("/quizzes", { params });
export const getQuiz = (id) => api.get(`/quizzes/${id}`);
export const createQuiz = (payload) => api.post("/quizzes", payload);
export const updateQuiz = (id, payload) => api.patch(`/quizzes/${id}`, payload);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);
export const regenerateQuizLink = (id) => api.post(`/quizzes/${id}/regenerate-link`);
export const listQuizAttempts = (quizId, params = {}) =>
  api.get(`/quizzes/${quizId}/attempts`, { params });
export const deleteQuizAttempt = (quizId, attemptId) =>
  api.delete(`/quizzes/${quizId}/attempts/${attemptId}`);

export const getPublicQuiz = (shareToken) => api.get(`/quizzes/public/${shareToken}`);
export const registerQuizAttempt = (shareToken, payload) =>
  api.post(`/quizzes/public/${shareToken}/register`, payload);
export const getCurrentQuizQuestion = (attemptToken) =>
  api.get(`/quizzes/public/attempts/${attemptToken}/current`);
export const submitQuizAnswer = (attemptToken, payload) =>
  api.post(`/quizzes/public/attempts/${attemptToken}/answer`, payload);
export const getQuizAttemptResult = (attemptToken) =>
  api.get(`/quizzes/public/attempts/${attemptToken}/result`);
