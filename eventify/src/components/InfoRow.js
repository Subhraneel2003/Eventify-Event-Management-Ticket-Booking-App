import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export const InfoRow = ({ icon, label, value }) => {
    const { colors } = useContext(ThemeContext)
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

const styles = StyleSheet.create({
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
})