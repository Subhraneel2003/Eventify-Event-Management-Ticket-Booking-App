import { handleError } from '../errorHandling/handleError';
import api from './apiClient';

export const fetchCategories = async () => {
    try {
        const res = await api.get("/categories")
        return res.data
    }
    catch (err) {
        throw handleError(err, 'fetchCategories');

    }
}

export const createCategory = async (category) => {
    try {
        const res = await api.post("/categories", category);
        return res.data;
    } catch (err) {
        throw handleError(err, "createCategory");
    }
};