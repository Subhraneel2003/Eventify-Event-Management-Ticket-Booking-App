import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Alert } from 'react-native'
import MapView, { Marker } from "react-native-maps";
import React, { useEffect, useState, useContext } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { deleteEvent, fetchEventById } from '../../api/eventService';
import { ThemeContext } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import Button from '../../components/Button';
import { fetchUserById } from '../../api/userService';

const { width } = Dimensions.get('window');
export default function EventDetailScreen({ navigation, route }) {
    const { eventId } = route.params
    const { colors } = useContext(ThemeContext)
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user } = useSelector(state => state.auth)
    const [organizer, setOrganizer] = useState(null)

    useEffect(() => {
        loadEvent();
    }, []);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const event = await fetchEventById(eventId);
            setEvent(event);
            const organizerDetails = await fetchUserById(event.organizerId);
            setOrganizer(organizerDetails);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isOrganizer = user?.role === "organizer" && user?.id === event?.organizerId

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.danger }}>
                    Something went wrong: {error}
                </Text>
                <TouchableOpacity onPress={loadEvent}>
                    <Text style={{ color: colors.primary, marginTop: 10 }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
    const isSoldOut = event.availableSeats === 0;
    const isCancelled = event.status === 'cancelled';
    const isCompleted = event.status === 'completed';
    const canBook = !isSoldOut && !isCancelled && !isCompleted;

    const getStatusColor = () => {
        if (isCancelled) return colors.danger;
        if (isCompleted) return colors.textSecondary;
        if (isSoldOut) return colors.danger;
        return '#22c55e';
    };

    const getStatusText = () => {
        if (isCancelled) return 'Cancelled';
        if (isCompleted) return 'Completed';
        if (isSoldOut) return 'Sold Out';
        return `${event.availableSeats} seats left`;
    };

    const handleDelete = async () => {
        Alert.alert("Delete Event", "Are you sure you want to delete this event? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: confirmDelete
                }
            ]
        )
    }

    const confirmDelete = async () => {
        try {
            await deleteEvent(event.id)
            Alert.alert("Success", "Event Deleted Successfully")
            navigation.goBack()
        }
        catch (err) {
            console.log(err.message)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                    source={{ uri: event.coverImage }}
                    style={styles.coverImage}
                    resizeMode="cover"
                />

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <View style={styles.row}>
                        <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{event.category}</Text>
                        </View>
                        <Text style={{ color: getStatusColor(), fontSize: 12, fontWeight: '500' }}>
                            <Ionicons name="ellipse" size={8} color={getStatusColor()} /> {getStatusText()}
                        </Text>
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>
                        {event.title}
                    </Text>

                    <View style={styles.infoRow}>
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color={colors.textSecondary}
                        />
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 5 }}>
                            {event.date}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 5 }}>
                            {event.time}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 5 }}>
                            {event.venueName}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 5 }}>
                            {organizer?.name}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 5 }}>
                            {organizer?.email}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons
                            name="location-outline"
                            size={16}
                            color={colors.textSecondary}
                        />
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 5 }}>
                            {event.address}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        About this event
                    </Text>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: 13,
                            lineHeight: 22,
                        }}
                    >
                        {event.description}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
                    <View
                        style={[
                            styles.mapPlaceholder,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: event.location.latitude,
                                longitude: event.location.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: event.location.latitude,
                                    longitude: event.location.longitude,
                                }}
                                title={event.venueName}
                                description={event.address}
                            />
                        </MapView>
                    </View>

                    {/* Total Seats, Available, Price*/}
                    <View style={[styles.seatsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{event.totalSeats}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Total Seats</Text>
                        </View>
                        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: getStatusColor(), fontWeight: '600', fontSize: 16 }}>{event.availableSeats}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Available</Text>
                        </View>
                        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>
                                {event.price === 0 ? 'Free' : `₹${event.price}`}
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Per Ticket</Text>
                        </View>
                    </View>

                    {/* Bottom padding for sticky button */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            <View
                style={[
                    styles.stickyButton,
                    {
                        backgroundColor: colors.background,
                        borderTopColor: colors.border,
                    },
                ]}
            >
                {isCompleted ? (
                    <Button
                        title="Check Reviews"
                        style={[
                            styles.bookButton,
                            { backgroundColor: colors.textSecondary },
                        ]}
                        onPress={() =>
                            navigation.navigate("Reviews", {
                                eventId: event.id,
                            })
                        }
                    />
                ) : isOrganizer ? (
                    <View style={styles.actionRow}>
                        <Button
                            title="Edit Event"
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: colors.primary,
                                    marginRight: 10,
                                },
                            ]}
                            onPress={() =>
                                navigation.navigate("Event Edit", {
                                    mode: "edit",
                                    eventId: event.id,
                                })
                            }
                        />

                        <Button
                            title="Delete Event"
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: colors.danger,
                                },
                            ]}
                            onPress={handleDelete}
                        />
                    </View>
                ) : (
                    <Button
                        title={
                            canBook
                                ? `Book Now · ${event.price === 0 ? "Free" : `₹${event.price}`}`
                                : getStatusText()
                        }
                        style={[
                            styles.bookButton,
                            {
                                backgroundColor: canBook
                                    ? colors.primary
                                    : colors.textSecondary,
                                marginTop: 10,
                            },
                        ]}
                        disabled={!canBook}
                        onPress={() =>
                            navigation.navigate("Booking", {
                                eventId: event.id,
                            })
                        }
                    />
                )}
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 30,
        marginTop: 30
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverImage: {
        width: width,
        height: 240,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 0.5,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    divider: {
        height: 0.5,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    mapPlaceholder: {
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 0.5,
        marginBottom: 16,
    },
    seatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 0.5,
        marginTop: 8,
    },
    verticalDivider: {
        width: 0.5,
        height: 40,
    },
    stickyButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 0.5,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: "space-between",
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    bookButton: {
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
});
