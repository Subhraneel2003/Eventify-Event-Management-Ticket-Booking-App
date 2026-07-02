import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setError, setEvents, setFilteredEvents, setLoading } from '../../store/slices/eventSlice'
import { fetchEvents, filterByCategory, searchEvents } from '../../api/eventService'
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext'
import EventCard from '../../components/EventCard'
import { fetchCategories } from '../../api/categoryService'
import { Ionicons } from '@expo/vector-icons';

export default function EventListScreen({ navigation }) {
    const dispatch = useDispatch()
    const { events, filteredEvents, loading, error } = useSelector(state => state.events)
    const { colors } = useContext(ThemeContext)
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("ALL")
    const [categories, setCategories] = useState([])
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)

    const categoryItems = [{ id: 'ALL', name: 'ALL' }, ...categories]

    useEffect(() => {
        loadCategories()
    }, [])

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
    const loadCategories = async () => {
        try {
            const data = await fetchCategories()
            setCategories(data)
        }
        catch (err) {
            console.error('Failed to load categories:', err.message);
        }
    }
    const handleSearch = async (query) => {
        setSearch(query)
        if (query.trim() === "") {
            dispatch(setFilteredEvents(events))
            return
        }
        try {
            dispatch(setLoading(true))
            const data = await searchEvents(query)
            dispatch(setFilteredEvents(data))
        } catch (err) {
            dispatch(setError(err.message))
        }
        finally {
            dispatch(setLoading(false))
        }
    }
    const handleCategory = async (cat) => {
        setCategory(cat)
        setCategoryMenuVisible(false)
        if (cat.trim() === "ALL") {
            dispatch(setFilteredEvents(events))
            return
        }
        try {
            dispatch(setLoading(true))
            const data = await filterByCategory(cat)
            dispatch(setFilteredEvents(data))
        } catch (err) {
            dispatch(setError(err.message))
        }
        finally {
            dispatch(setLoading(false))
        }
    }
    if (loading) {
        return (
            <View style={[styles.centered], { backgroundColor: colors.background }}>
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

            <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                    style={[styles.dropdownButton, {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    }]}
                    onPress={() => setCategoryMenuVisible(prev => !prev)}>
                    <Text style={[styles.dropdownButtonText, { color: colors.text }]}>Category: {category}</Text>
                    <Text style={[styles.dropdownButtonIcon, { color: colors.textSecondary }]}><Ionicons name="chevron-down" size={18} color={colors.textSecondary} /></Text>
                </TouchableOpacity>
                {categoryMenuVisible && (
                    <View style={[styles.dropdownMenu, {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    }]}> 
                        {categoryItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handleCategory(item.name)}
                                style={[styles.dropdownItem, category === item.name && styles.dropdownItemActive]}>
                                <Text style={[styles.dropdownItemText, {
                                    color: category === item.name ? '#fff' : colors.text,
                                }]}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            <FlatList data={filteredEvents} keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <EventCard event={item} onPress={() => navigation.navigate("Event Details", { eventId: item.id })} />
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
    dropdownWrapper: {
        marginBottom: 16,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    dropdownButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    dropdownButtonIcon: {
        fontSize: 16,
        marginLeft: 10,
    },
    dropdownMenu: {
        marginTop: 8,
        borderRadius: 14,
        borderWidth: 1,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    dropdownItemActive: {
        backgroundColor: '#6F4BFF',
    },
    dropdownItemText: {
        fontSize: 14,
        fontWeight: '500',
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