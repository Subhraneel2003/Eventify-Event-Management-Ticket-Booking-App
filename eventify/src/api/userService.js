import { handleError } from '../errorHandling/handleError';
import { API_BASE_URL } from '../utils/constants';
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchUserById = async(id) =>{
    try{
        const res= await api.get(`/users/${id}`)
        return res.data 
    }
    catch(err){
        throw handleError(err, 'fetchUserById')
    }
}