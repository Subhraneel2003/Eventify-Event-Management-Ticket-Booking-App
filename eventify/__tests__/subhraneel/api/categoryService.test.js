import api from '../../../src/api/apiClient';
import { fetchCategories, createCategory } from '../../../src/api/categoryService';

jest.mock('../../../src/api/apiClient', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
    },
}));

jest.mock('../../../src/errorHandling/handleError', () => ({
    handleError: jest.fn((err) => err),
}));

beforeEach(() => jest.clearAllMocks());

describe('fetchCategories', () => {
    it('returns categories data when api call succeeds', async () => {
        const categories = [{ id: '1', name: 'Music' }];
        api.get.mockResolvedValue({ data: categories });

        const result = await fetchCategories();

        expect(api.get).toHaveBeenCalledWith('/categories');
        expect(result).toEqual(categories);
    });

    it('throws when the api call fails', async () => {
        api.get.mockRejectedValue(new Error('Server error'));

        await expect(fetchCategories()).rejects.toThrow('Server error');
    });
});

describe('createCategory', () => {
    it('posts new category and returns created data', async () => {
        const newCat = { name: 'Art' };
        const created = { id: '2', ...newCat };
        api.post.mockResolvedValue({ data: created });

        const result = await createCategory(newCat);

        expect(api.post).toHaveBeenCalledWith('/categories', newCat);
        expect(result).toEqual(created);
    });

    it('throws when the api call fails', async () => {
        api.post.mockRejectedValue(new Error('Network error'));

        await expect(createCategory({ name: 'X' })).rejects.toThrow('Network error');
    });
});
