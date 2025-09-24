import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Notes API
export const getNotes = () => api.get('/notes');
export const createNote = (formData) => api.post('/notes', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const generateSummary = (id) => api.post(`/notes/${id}/summary`);

export default api;