import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

export default function EventCard({ event, onPress }) {
    const { colors } = useContext(ThemeContext)
    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress}>
            <Image
                source={{ uri: event.coverImage }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <Text style={{ color: colors.text, fontWeight: '500', fontSize: 14, marginBottom: 4 }}>
                    {event.title}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 2 }}>
                    {event.date} · {event.time}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
                    {event.address}
                </Text>
                <View style={styles.footer}>
                    <Text style={{ color: colors.primary, fontWeight: '500', fontSize: 13 }}>
                        {event.price === 0 ? 'Free' : `₹${event.price}`}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                            {event.category}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 0.5,
        marginBottom: 12,
        overflow: 'hidden',
    },
    image: {
        height: 160,
        width: '100%',
    },
    cardContent: {
        padding: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 0.5,
    },
});