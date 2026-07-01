import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  events: [],
  filteredEvents: [],
  loading: false,
  error: null,
};

const eventSlice=createSlice({
    name: "events",
    initialState,
    reducers:{
        setEvents(state, action){
            state.events=action.payload
            state.filteredEvents=action.payload
        },
        setFilteredEvents(state, action){
            state.filteredEvents=action.payload
        },
        setLoading(state, action){
            state.loading=action.payload
        },
        setError(state, action){
            state.loading=action.payload
        }
    }
})
export const{setEvents, setFilteredEvents, setLoading, setError}=eventSlice.actions
export default eventSlice.reducer