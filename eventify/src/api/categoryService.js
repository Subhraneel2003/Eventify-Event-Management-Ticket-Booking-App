import { API_BASE_URL } from '../utils/constants';
import axios from 'axios';

const api = axios.create({
    baseURL: API_BASE_URL,
});

const handleError = (err, context) => {
    if (err.response) {
        console.error(`${context} — Server Error:`, err.response.status, err.response.data);
        throw new Error(`Server error: ${err.response.status}`);
    } else if (err.request) {
        console.error(`${context} — No Response (server down or wrong IP)`);
        throw new Error('No response from server');
    } else {
        console.error(`${context} — Request Setup Error:`, err.message);
        throw new Error(err.message);
    }
};

export const fetchCategories = async () => {
    try {
        const res = await api.get("/categories")
        return res.data
    }
    catch (err) {
        throw handleError(err, 'fetchCategories');

    }

}