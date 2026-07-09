import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { getAllUsers } from '../../api/userService';
import { getAllBookings } from '../../api/bookingService';
import { DashboardCard } from '../../components/Dashboard';

export default function AdminDashboardScreen({ navigation }) {
    const { colors } = useContext(ThemeContext);

    const [loading, setLoading] = useState(true);
    const events = useSelector((state) => state.events.events);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        totalBookings: 0,
        revenue: 0,
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const [users, bookings] = await Promise.all([
                getAllUsers(),
                getAllBookings(),
            ]);

            const today = new Date();

            const upcomingEvents = events.filter(
                (event) => new Date(event.date) >= today
            ).length;

            const completedEvents = events.filter(
                (event) => new Date(event.date) < today
            ).length;

            const revenue = bookings.reduce(
                (sum, booking) => sum + booking.totalAmount,
                0
            );

            setStats({
                totalUsers: users.length,
                totalEvents: events.length,
                upcomingEvents,
                completedEvents,
                totalBookings: bookings.length,
                revenue,
            });
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View
                style={[
                    styles.loadingContainer,
                    { backgroundColor: colors.background },
                ]}
            >
                <ActivityIndicator
                    size="large"
                    color={colors.primary}
                />
            </View>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <Text
                    style={[
                        styles.heading,
                        { color: colors.text },
                    ]}
                >
                    Admin Dashboard
                </Text>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>

                <View style={styles.grid}>
                    <DashboardCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon="people-outline"
                        color="#2563EB"
                    />

                    <DashboardCard
                        title="Total Events"
                        value={stats.totalEvents}
                        icon="calendar-outline"
                        color="#9333EA"
                    />

                    <DashboardCard
                        title="Upcoming"
                        value={stats.upcomingEvents}
                        icon="time-outline"
                        color="#16A34A"
                    />

                    <DashboardCard
                        title="Completed"
                        value={stats.completedEvents}
                        icon="checkmark-circle-outline"
                        color="#F97316"
                    />

                    <DashboardCard
                        title="Bookings"
                        value={stats.totalBookings}
                        icon="ticket-outline"
                        color="#EC4899"
                    />

                    <DashboardCard
                        title="Revenue"
                        value={`₹${stats.revenue}`}
                        icon="cash-outline"
                        color="#059669"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    content: {
        padding: 16,
        paddingBottom: 30,
    },

    heading: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 5
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
});