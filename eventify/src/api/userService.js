import { handleError } from '../errorHandling/handleError';
import api from './apiClient';

export const fetchUserById = async (id) => {
    try {
        const res = await api.get(`/users/${id}`)
        return res.data
    }
    catch (err) {
        throw handleError(err, 'fetchUserById')
    }
}

export const updateProfile = async (id, profileData) => {
    try {
        const res = await api.patch(`/users/${id}`, profileData)
        return res.data
    }
    catch (err) {
        throw handleError(err, 'updateProfile')
    }
}

export const getAllUsers = async () => {
    try {
        const res = await api.get("/users")
        return res.data
    } catch (error) {
        throw handleError(error, 'getAllUsers')
    }
}
