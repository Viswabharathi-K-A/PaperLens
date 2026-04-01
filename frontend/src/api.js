import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api'
});

export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/documents/upload', formData);
};

export const getDocuments = () => API.get('/documents');

export const queryDocument = (question, documentId) =>
  API.post('/query', { question, documentId });