import axios from 'axios';

// Base URL for Django backend API
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export default api;
