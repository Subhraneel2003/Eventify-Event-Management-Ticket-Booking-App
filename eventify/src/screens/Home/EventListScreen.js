import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setError, setEvents, setFilteredEvents, setLoading } from '../../store/slices/eventSlice'
import { fetchEvents, filterByCategory, searchEvents } from '../../api/eventService'
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext'
import EventCard from '../../components/EventCard'

export default function EventListScreen({ navigation }) {
    const dispatch = useDispatch()
    const { events, filteredEvents, loading, error } = useSelector(state => state.events)
    const { colors } = useContext(ThemeContext)
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("ALL")
    const CATEGORIES = ["Music", "Technology", "Sports", "Arts & Theatre", "Food & Drink", "Business", "Comedy", "Workshops"]
    useFocusEffect(React.useCallback(() => {
        loadEvents()
    }, []))
    const loadEvents = async () => {
        try {
            dispatch(setLoading(true))
            const data = await fetchEvents()
            dispatch(setEvents(data))
        }
        catch (err) {
            dispatch(setError(err.message))
        }
        finally {
            dispatch(setLoading(false))
        }
    }
    const handleSearch = async (query) => {
        setSearch(query)
        if (query.trim === "") {
            dispatch(setFilteredEvents(events))
            return
        }
        try {
            dispatch(setLoading(true))
            const data = await searchEvents(query)
            dispatch(setFilteredEvents(events))
        } catch (err) {
            dispatch(setError(err.message))
        }
        finally {
            dispatch(setLoading(false))
        }
    }
    const handleCategory = async (cat) => {
        setCategory(cat)
        if (cat.trim === "ALL") {
            dispatch(setFilteredEvents(events))
            return
        }
        try {
            dispatch(setLoading(true))
            const data = await filterByCategory(cat)
            dispatch(setFilteredEvents(events))
        } catch (err) {
            dispatch(setError(err.message))
        }
        finally {
            dispatch(setLoading(false))
        }
    }
    if (loading) {
        return (
            <View style={[styles.centred], { backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }
    if (error) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.danger }}>Something went wrong: {error}</Text>
                <TouchableOpacity onPress={loadEvents}>
                    <Text style={{ color: colors.primary, marginTop: 10 }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TextInput style={[styles.searchBar, {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
            }]} placeholder='Search...' value={search} onChangeText={handleSearch} />
            <View style={styles.pillRow}>
                {
                    CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat} onPress={() => handleCategory(cat)} style={[styles.pill, { backgroundColor: category === cat ? colors.primary : colors.surface }]}>
                            <Text style={{ color: category === cat ? '#fff' : colors.textSecondary, fontSize: 12 }}>{cat}</Text>
                        </TouchableOpacity>
                    ))

                }
            </View>
            <FlatList data={filteredEvents} keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <EventCard events={item} onPress={() => navigation.navigate("Event Details", { eventId: item.id })} />
                )}
                ListEmptyComponent={
                    <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
                        No events found
                    </Text>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        borderRadius: 8,
        borderWidth: 0.5,
        padding: 10,
        marginBottom: 12,
        fontSize: 14,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 0.5,
    },
    card: {
        borderRadius: 12,
        borderWidth: 0.5,
        marginBottom: 12,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    cardContent: {
        padding: 12,
    },
});