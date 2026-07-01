import { View, Text } from 'react-native'
import React from 'react'
import { API_BASE_URL } from '../utils/constants'
import axios from 'axios'

const api = axios.create({
    baseURL: API_BASE_URL
})

export const fetchEvents = async () => {
    const res = await api.get('/events')
    return res.data
}

export const fetchEventById = async (id) => {
    const res = await api.get(`/event/${id}`)
    return res.data
}

export const searchEvents = async (query) => {
    const res = await api.get('/events/', { params: { q:query } })
    return res.data
}

export const filterByCategory = async (category) => {
    const res = await api.get('/events/', { params: { category } })
    return res.data
}

export const filterByDate = async (date) => {
    const res = await api.get('/events/', { params: { date } })
    return res.data
}