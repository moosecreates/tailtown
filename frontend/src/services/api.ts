import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3003', // Updated to match the new backend port
  headers: {
    'Content-Type': 'application/json'
  },
  validateStatus: (status) => status < 500
});

export default api;
