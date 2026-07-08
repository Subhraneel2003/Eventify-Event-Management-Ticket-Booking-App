import api from '../../../src/api/apiClient';
import {
    fetchEvents,
    fetchEventById,
    searchEvents,
    filterByCategory,
    filterByDate,
    addEvent,
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

beforeEach(() => jest.clearAllMocks());

describe('fetchEvents', () => {
    it('returns events list', async () => {
        const events = [{ id: 'e1' }];
        api.get.mockResolvedValue({ data: events });

        const result = await fetchEvents();

        expect(api.get).toHaveBeenCalledWith('/events');
        expect(result).toEqual(events);
    });

    it('throws when api fails', async () => {
        api.get.mockRejectedValue(new Error('Network error'));
        await expect(fetchEvents()).rejects.toThrow('Network error');
    });
});

describe('fetchEventById', () => {
    it('fetches single event by id', async () => {
        const event = { id: 'e1', title: 'T' };
        api.get.mockResolvedValue({ data: event });

        const result = await fetchEventById('e1');

        expect(api.get).toHaveBeenCalledWith('/events/e1');
        expect(result).toEqual(event);
    });

    it('throws when api fails', async () => {
        api.get.mockRejectedValue(new Error('Server error'));
        await expect(fetchEventById('e1')).rejects.toThrow('Server error');
    });
});

describe('searchEvents', () => {
    it('calls api with query param and returns results', async () => {
        const data = [{ id: 'e2' }];
        api.get.mockResolvedValue({ data });

        const result = await searchEvents('concert');

        expect(api.get).toHaveBeenCalledWith('/events', { params: { q: 'concert' } });
        expect(result).toEqual(data);
    });

    it('throws when api fails', async () => {
        api.get.mockRejectedValue(new Error('Server error'));
        await expect(searchEvents('x')).rejects.toThrow('Server error');
    });
});

describe('filterByCategory', () => {
    it('calls api with category param and returns results', async () => {
        const data = [{ id: 'e3' }];
        api.get.mockResolvedValue({ data });

        const result = await filterByCategory('music');

        expect(api.get).toHaveBeenCalledWith('/events', { params: { category: 'music' } });
        expect(result).toEqual(data);
    });

    it('throws when api fails', async () => {
        api.get.mockRejectedValue(new Error('Server error'));
        await expect(filterByCategory('x')).rejects.toThrow('Server error');
    });
});

describe('filterByDate', () => {
    it('calls api with date param and returns results', async () => {
        const data = [{ id: 'e4' }];
        api.get.mockResolvedValue({ data });

        const result = await filterByDate('2026-01-01');

        expect(api.get).toHaveBeenCalledWith('/events', { params: { date: '2026-01-01' } });
        expect(result).toEqual(data);
    });

    it('throws when api fails', async () => {
        api.get.mockRejectedValue(new Error('Network error'));
        await expect(filterByDate('x')).rejects.toThrow('Network error');
    });
});

describe('addEvent', () => {
    it('posts event and returns created event', async () => {
        const event = { title: 'New' };
        const created = { id: 'e5', ...event };
        api.post.mockResolvedValue({ data: created });

        const result = await addEvent(event);

        expect(api.post).toHaveBeenCalledWith('/events', event);
        expect(result).toEqual(created);
    });

    it('throws when api fails', async () => {
        api.post.mockRejectedValue(new Error('Server error'));
        await expect(addEvent({})).rejects.toThrow('Server error');
    });
});
