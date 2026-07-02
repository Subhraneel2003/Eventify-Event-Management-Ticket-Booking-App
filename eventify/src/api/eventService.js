import { handleError } from '../errorHandling/handleError';
import { API_BASE_URL } from '../utils/constants';
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchEvents = async () => {
  try {
    const res = await api.get('/events');
    return res.data;
  } catch (err) {
    throw handleError(err, 'fetchEvents');
  }
};

export const fetchEventById = async (id) => {
  try {
    const res = await api.get(`/events/${id}`);
    return res.data;
  } catch (err) {
    throw handleError(err, 'fetchEventById');
  }
};

export const searchEvents = async (query) => {
  try {
    const res = await api.get('/events', { params: { q: query } });
    return res.data;
  } catch (err) {
    throw handleError(err, 'searchEvents');
  }
};

export const filterByCategory = async (category) => {
  try {
    const res = await api.get('/events', { params: { category } });
    return res.data;
  } catch (err) {
    throw handleError(err, 'filterByCategory');
  }
};

export const filterByDate = async (date) => {
  try {
    const res = await api.get('/events', { params: { date } });
    return res.data;
  } catch (err) {
    throw handleError(err, 'filterByDate');
  }
};