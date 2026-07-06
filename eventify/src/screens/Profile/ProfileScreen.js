import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button';
import { ThemeContext } from '../../context/ThemeContext';
import { logout } from '../../store/slices/authSlice';
import { clearAsyncStorageData } from '../../services/storageService';
import { clearBookings } from '../../store/slices/bookingSlice';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen({ navigation }) {
    const { colors, toggleTheme, isDark } = useContext(ThemeContext);
    const { user } = useAuth();
    const dispatch = useDispatch();

    const handleLogOut = async () => {
        try {
            await clearAsyncStorageData();
            dispatch(logout());
            dispatch(clearBookings());

            if (isDark) {
                toggleTheme();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const InfoRow = ({ icon, label, value, colors }) => {
        return (
            <View style={styles.infoRow}>
                <Ionicons name={icon} size={22} color={colors.primary} />

                <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        {label}
                    </Text>

                    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
                </View>
            </View>
        );
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate('Profile Image', {
                            imageUri: user?.profileImage,
                        })
                    }
                >
                    <Image source={{ uri: user?.profileImage }} style={styles.avatar} />

                    <View
                        style={[styles.cameraIcon, { backgroundColor: colors.primary }]}
                    >
                        <Ionicons name="camera" size={18} color="#fff" />
                    </View>
                </TouchableOpacity>

                <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>

                <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>
            </View>

            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <InfoRow
                    icon="mail-outline"
                    label="Email"
                    value={user?.email}
                    colors={colors}
                />

                <InfoRow
                    icon="call-outline"
                    label="Phone"
                    value={user?.phone}
                    colors={colors}
                />

                <InfoRow
                    icon="calendar-outline"
                    label="Member Since"
                    value={new Date(user?.createdAt).toLocaleDateString()}
                    colors={colors}
                />
            </View>

            <View style={{ marginTop: 25 }}>
                <Button
                    title="Edit Profile"
                    style={styles.button}
                    onPress={() => navigation.navigate('Profile Edit')}
                />

                <Button
                    title="Change Email"
                    style={styles.button}
                    variant="outline"
                    onPress={() => navigation.navigate('Profile Edit Email')}
                />

                <Button
                    title="Change Password"
                    style={styles.button}
                    variant="outline"
                    onPress={() => navigation.navigate('Profile Edit Pass')}
                />

                <Button
                    title="Logout"
                    style={[
                        styles.button,
                        {
                            backgroundColor: colors.danger,
                        },
                    ]}
                    onPress={() => {
                        handleLogOut();
                    }}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
    },

    header: {
        alignItems: 'center',
        marginTop: 20,
    },

    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: "black",
        borderWidth: 2,
    },

    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    name: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 16,
    },

    roleBadge: {
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },

    roleText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },

    card: {
        marginTop: 28,
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },

    label: {
        fontSize: 13,
        marginBottom: 3,
    },

    value: {
        fontSize: 16,
        fontWeight: '600',
    },

    button: {
        marginBottom: 14,
    },
});
