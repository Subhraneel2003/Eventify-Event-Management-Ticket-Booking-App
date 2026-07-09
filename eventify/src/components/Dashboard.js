import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"
import { StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const DashboardCard = ({ title, value, icon, color }) => {
    const { colors } = useContext(ThemeContext)
    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}
        >
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: color + "20" },
                ]}
            >
                <Ionicons name={icon} size={26} color={color} />
            </View>

            <Text style={[styles.value, { color: colors.text }]}>
                {value}
            </Text>

            <Text
                style={[
                    styles.title,
                    { color: colors.textSecondary },
                ]}
            >
                {title}
            </Text>
        </View>
    )
}
const styles = StyleSheet.create({
    card: {
        width: "48%",
        borderRadius: 18,
        paddingVertical: 22,
        paddingHorizontal: 16,
        marginBottom: 16,
        alignItems: "center",
        borderWidth: 1,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },

    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },

    value: {
        fontSize: 24,
        fontWeight: "700",
    },

    title: {
        marginTop: 6,
        fontSize: 14,
        textAlign: "center",
    },
})