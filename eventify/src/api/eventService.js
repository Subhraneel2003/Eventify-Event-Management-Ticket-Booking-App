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

export const updateEventSeats = async (id, ticketCount, status) => {
  try {
    const event = await fetchEventById(id);
    const availableSeats = event.availableSeats ?? 0;

    let updatedSeats = availableSeats;
    if (status === 'confirmed') {
      updatedSeats = Math.max(0, availableSeats - ticketCount);
    } else if (status === 'cancelled') {
      updatedSeats = availableSeats + ticketCount;
    } else {
      return event;
    }

    const res = await api.patch(`/events/${id}`, {
      availableSeats: updatedSeats,
    });
    return res.data;
  } catch (err) {
    throw handleError(err, 'updateEventSeats');
  }
};

export const updateEventsInfo = async (id, value) => {
  try {
    const res = await api.patch(`/events/${id}`, value);
    return res.data;
  } catch (err) {
    throw handleError(err, 'updateEventsInfo');
  }
};

export const addEvent = async (eventData) => {
  try {
    const res = await api.post('/events', eventData);
    return res.data;
  } catch (err) {
    throw handleError(err, 'addEvent');
  }
};

export const cancelEvent = async (eventId, isFree) => {
  try {
    await api.patch(`/events/${eventId}`, {
      status: 'cancelled',
      refundStatus: isFree ? 'not_applicable' : 'pending',
    });

    const { data: bookings } = await api.get(`/bookings?eventId=${eventId}`);

    const updates = bookings
      .filter((b) => b.status === 'confirmed')
      .map((b) =>
        api.patch(`/bookings/${b.id}`, {
          status: 'cancelled_by_organizer',
          refundStatus: b.totalAmount > 0 ? 'pending' : 'not_applicable',
        })
      );

    await Promise.all(updates);
  } catch (err) {
    throw handleError(err, 'cancelEvent');
  }
};

export const refundUsersForEventCancel = async (eventId) => {
  try {
    const { data: bookings } = await api.get(`/bookings?eventId=${eventId}`);

    const updates = bookings
      .filter((b) => b.status === 'cancelled_by_organizer' && b.refundStatus === 'pending')
      .map((b) =>
        api.patch(`/bookings/${b.id}`, {
          refundStatus: 'issued',
        })
      );

    await Promise.all(updates);

    await api.patch(`/events/${eventId}`, { refundStatus: 'issued' });
  } catch (err) {
    throw handleError(err, 'refundUsersForEventCancel');
  }
};
