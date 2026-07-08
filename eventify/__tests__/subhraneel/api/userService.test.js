import api from '../../../src/api/apiClient';
import {
    fetchUserById,
    updateProfile,
    getAllUsers,
} from '../../../src/api/userService';

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

describe('fetchUserById', () => {
    const mockUser = { id: '1', name: 'Alice' };

    it('fetches user by id and returns data', async () => {
        api.get.mockResolvedValue({ data: mockUser });

        const result = await fetchUserById('1');

        expect(api.get).toHaveBeenCalledWith('/users/1');
        expect(result).toEqual(mockUser);
    });

    it('throws when the api call fails', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        await expect(fetchUserById('1')).rejects.toThrow('Network error');
    });
});

describe('updateProfile', () => {
    it('patches the user and returns updated data', async () => {
        const profileData = { name: 'Bob' };
        const updated = { id: '1', ...profileData };
        api.patch.mockResolvedValue({ data: updated });

        const result = await updateProfile('1', profileData);

        expect(api.patch).toHaveBeenCalledWith('/users/1', profileData);
        expect(result).toEqual(updated);
    });

    it('throws when the api call fails', async () => {
        api.patch.mockRejectedValue(new Error('Server error'));

        await expect(updateProfile('1', { name: 'X' })).rejects.toThrow(
            'Server error'
        );
    });
});

describe('getAllUsers', () => {
    it('returns all users', async () => {
        const users = [{ id: '1' }, { id: '2' }];
        api.get.mockResolvedValue({ data: users });

        const result = await getAllUsers();

        expect(api.get).toHaveBeenCalledWith('/users');
        expect(result).toEqual(users);
    });

    it('throws when the api call fails', async () => {
        api.get.mockRejectedValue(new Error('Server error'));

        await expect(getAllUsers()).rejects.toThrow('Server error');
    });
});
