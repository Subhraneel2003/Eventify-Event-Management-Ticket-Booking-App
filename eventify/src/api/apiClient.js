import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';
import { clearAsyncStorageData } from '../services/storageService';
import { isTokenValid } from '../utils/tokenManager';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token && !isTokenValid(token)) {
    store.dispatch(logout());
    clearAsyncStorageData();
    throw new axios.Cancel('Token expired — request blocked');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
