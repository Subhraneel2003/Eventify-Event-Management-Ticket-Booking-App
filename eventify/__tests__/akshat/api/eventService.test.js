import api from '../../../src/api/apiClient';
import {
  updateEventSeats,
  updateEventsInfo,
  cancelEvent,
  refundUsersForEventCancel,
} from '../../../src/api/eventService';

jest.mock('../../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../../../src/errorHandling/handleError', () => ({
  handleError: jest.fn((err) => err),
}));

// updateEventSeats
describe('updateEventSeats', () => {
  const mockEvent = { id: '1', availableSeats: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockEvent });
  });

  it('decrements seats when status is confirmed', async () => {
    api.patch.mockResolvedValue({ data: { ...mockEvent, availableSeats: 7 } });

    const result = await updateEventSeats('1', 3, 'confirmed');

    expect(api.patch).toHaveBeenCalledWith('/events/1', { availableSeats: 7 });
    expect(result.availableSeats).toBe(7);
  });

  it('does not go below 0 when ticketCount exceeds availableSeats', async () => {
    api.patch.mockResolvedValue({ data: { ...mockEvent, availableSeats: 0 } });

    await updateEventSeats('1', 100, 'confirmed');

    expect(api.patch).toHaveBeenCalledWith('/events/1', { availableSeats: 0 });
  });

  it('increments seats when status is cancelled', async () => {
    api.patch.mockResolvedValue({ data: { ...mockEvent, availableSeats: 13 } });

    const result = await updateEventSeats('1', 3, 'cancelled');

    expect(api.patch).toHaveBeenCalledWith('/events/1', { availableSeats: 13 });
    expect(result.availableSeats).toBe(13);
  });

  it('returns the event without patching for an unknown status', async () => {
    const result = await updateEventSeats('1', 3, 'pending');

    expect(api.patch).not.toHaveBeenCalled();
    expect(result).toEqual(mockEvent);
  });

  it('throws when the api call fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    await expect(updateEventSeats('1', 2, 'confirmed')).rejects.toThrow(
      'Network error'
    );
  });
});

// updateEventsInfo
describe('updateEventsInfo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('patches the event with the given values and returns the updated data', async () => {
    const updatedEvent = { id: '1', title: 'New Title' };
    api.patch.mockResolvedValue({ data: updatedEvent });

    const result = await updateEventsInfo('1', { title: 'New Title' });

    expect(api.patch).toHaveBeenCalledWith('/events/1', { title: 'New Title' });
    expect(result).toEqual(updatedEvent);
  });

  it('throws when the api call fails', async () => {
    api.patch.mockRejectedValue(new Error('Server error'));

    await expect(updateEventsInfo('1', { title: 'X' })).rejects.toThrow(
      'Server error'
    );
  });
});

// cancelEvent
describe('cancelEvent', () => {
  beforeEach(() => jest.clearAllMocks());

  const confirmedBookings = [
    { id: 'b1', status: 'confirmed', totalAmount: 50 },
    { id: 'b2', status: 'confirmed', totalAmount: 0 },
  ];

  it('marks the event as cancelled with refundStatus pending for a paid event', async () => {
    api.patch.mockResolvedValue({ data: {} });
    api.get.mockResolvedValue({ data: confirmedBookings });

    await cancelEvent('e1', false);

    expect(api.patch).toHaveBeenCalledWith('/events/e1', {
      status: 'cancelled',
      refundStatus: 'pending',
    });
  });

  it('marks the event as cancelled with refundStatus not_applicable for a free event', async () => {
    api.patch.mockResolvedValue({ data: {} });
    api.get.mockResolvedValue({ data: [] });

    await cancelEvent('e1', true);

    expect(api.patch).toHaveBeenCalledWith('/events/e1', {
      status: 'cancelled',
      refundStatus: 'not_applicable',
    });
  });

  it('cancels only confirmed bookings and sets refundStatus correctly', async () => {
    const bookings = [
      { id: 'b1', status: 'confirmed', totalAmount: 50 },
      { id: 'b2', status: 'confirmed', totalAmount: 0 },
      { id: 'b3', status: 'pending', totalAmount: 20 },
    ];
    api.patch.mockResolvedValue({ data: {} });
    api.get.mockResolvedValue({ data: bookings });

    await cancelEvent('e1', false);

    expect(api.patch).toHaveBeenCalledWith('/bookings/b1', {
      status: 'cancelled_by_organizer',
      refundStatus: 'pending',
    });

    expect(api.patch).toHaveBeenCalledWith('/bookings/b2', {
      status: 'cancelled_by_organizer',
      refundStatus: 'not_applicable',
    });

    expect(api.patch).not.toHaveBeenCalledWith(
      '/bookings/b3',
      expect.anything()
    );
  });

  it('throws when the api call fails', async () => {
    api.patch.mockRejectedValue(new Error('Server error'));

    await expect(cancelEvent('e1', false)).rejects.toThrow('Server error');
  });
});

// refundUsersForEventCancel
describe('refundUsersForEventCancel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('issues refunds for bookings that are cancelled_by_organizer with a pending refund', async () => {
    const bookings = [
      { id: 'b1', status: 'cancelled_by_organizer', refundStatus: 'pending' },
      { id: 'b2', status: 'cancelled_by_organizer', refundStatus: 'issued' },
      { id: 'b3', status: 'confirmed', refundStatus: 'pending' },
    ];
    api.get.mockResolvedValue({ data: bookings });
    api.patch.mockResolvedValue({ data: {} });

    await refundUsersForEventCancel('e1');

    expect(api.patch).toHaveBeenCalledWith('/bookings/b1', {
      refundStatus: 'issued',
    });
    expect(api.patch).not.toHaveBeenCalledWith(
      '/bookings/b2',
      expect.anything()
    );
    expect(api.patch).not.toHaveBeenCalledWith(
      '/bookings/b3',
      expect.anything()
    );
  });

  it('updates the event refundStatus to issued', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.patch.mockResolvedValue({ data: {} });

    await refundUsersForEventCancel('e1');

    expect(api.patch).toHaveBeenCalledWith('/events/e1', {
      refundStatus: 'issued',
    });
  });

  it('does nothing to bookings when none qualify', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.patch.mockResolvedValue({ data: {} });

    await refundUsersForEventCancel('e1');

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/events/e1', {
      refundStatus: 'issued',
    });
  });

  it('throws when the api call fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    await expect(refundUsersForEventCancel('e1')).rejects.toThrow(
      'Network error'
    );
  });
});
