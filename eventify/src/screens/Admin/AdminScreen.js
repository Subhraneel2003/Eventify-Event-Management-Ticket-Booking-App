import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Dimensions, } from "react-native";
import React, { useEffect, useMemo, useState, useContext } from "react";
import { fetchBookingsByEventId } from "../../api/bookingService";
import { getAllUsers } from "../../api/userService";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "../../utils/date";
import { useSelector } from "react-redux";
import { ThemeContext } from "../../context/ThemeContext";

const { width } = Dimensions.get('window');
export default function EventBookingsScreen({ route, navigation }) {
    const { eventId, eventTitle } = route.params;
    const [loading, setLoading] = useState(true);
    const { colors } = useContext(ThemeContext);
    const [bookingData, setBookingData] = useState([]);
    const events = useSelector(state => state.events.events);
    const event = useMemo(
        () => events.find(e => e.id === eventId),
        [events, eventId]
    );

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const bookings = await fetchBookingsByEventId(eventId)
            const users = await getAllUsers()
            const mergedData = bookings.map((b) => ({
                ...b,
                user: users.find((user) => user.id === b.userId)
            }))
            setBookingData(mergedData)
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                    },
                ]}
            >
                <View style={styles.header}>
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor: colors.primary,
                            },
                        ]}
                    >
                        <Ionicons
                            name="person"
                            size={22}
                            color="#fff"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={[
                                styles.name,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {item.user.name}
                        </Text>

                        <Text
                            style={[
                                styles.email,
                                {
                                    color: colors.textSecondary,
                                },
                            ]}
                        >
                            {item.user.email}
                        </Text>
                    </View>
                </View>

                <View
                    style={[
                        styles.divider,
                        {
                            backgroundColor: colors.border,
                        },
                    ]}
                />

                <View style={styles.row}>
                    <Ionicons
                        name="ticket-outline"
                        size={18}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.value,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        Tickets : {item.ticketCount}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Ionicons
                        name="cash-outline"
                        size={18}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.value,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        ₹ {item.totalAmount}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.value,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {formatDate(item.bookingDate)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Ionicons
                        name={
                            item.status === "confirmed"
                                ? "checkmark-circle"
                                : "close-circle"
                        }
                        size={18}
                        color={
                            item.status === "confirmed"
                                ? "#16A34A"
                                : colors.danger
                        }
                    />

                    <Text
                        style={[
                            styles.status,
                            {
                                color:
                                    item.status === "confirmed"
                                        ? "#16A34A"
                                        : colors.danger,
                            },
                        ]}
                    >
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View
                style={[
                    styles.center,
                    {
                        backgroundColor: colors.background,
                    },
                ]}
            >
                <ActivityIndicator
                    size="large"
                    color={colors.primary}
                />
            </View>
        );
    }

    if (bookingData.length === 0) {
        return (
            <View
                style={[
                    styles.center,
                    {
                        backgroundColor: colors.background,
                    },
                ]}
            >
                <Text
                    style={{
                        color: colors.text,
                    }}
                >
                    No bookings found.
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <Image
                source={{
                    uri: event.coverImage,
                }}
                style={styles.eventImage}
                resizeMode="cover"
            />

            <TouchableOpacity
                testID="admin-back-button"
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons
                    name="arrow-back"
                    size={20}
                    color="#fff"
                />
            </TouchableOpacity>

            <Text
                style={[
                    styles.heading,
                    {
                        color: colors.text,
                    },
                ]}
            >
                {eventTitle}
            </Text>

            <FlatList
                data={bookingData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        position: 'absolute',
        top: 45,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    email: {
        marginTop: 2,
    },

    divider: {
        height: 1,
        marginVertical: 14,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    value: {
        marginLeft: 10,
        fontSize: 15,
    },

    status: {
        marginLeft: 10,
        fontWeight: "700",
    },

    card: {
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    eventImage: {
        width: width,
        height: 240,
    },

    heading: {
        fontSize: 25,
        fontWeight: "700",
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
        marginTop: 5,
        textAlign: 'center'
    },

    name: {
        fontSize: 18,
        fontWeight: "700",
    },
});