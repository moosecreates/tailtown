import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json'
  },
  validateStatus: (status) => status < 500
});

export default api;
