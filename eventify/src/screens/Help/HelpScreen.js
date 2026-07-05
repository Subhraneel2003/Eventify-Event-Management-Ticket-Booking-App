import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

export default function HelpSupportScreen() {
  const { colors } = useContext(ThemeContext);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Help & Support
      </Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Need assistance? Here are some frequently asked questions.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.question, { color: colors.text }]}>
          How do I book an event?
        </Text>

        <Text style={[styles.answer, { color: colors.textSecondary }]}>
          Open an event, tap Book Now, choose the number of tickets, and
          confirm your booking.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.question, { color: colors.text }]}>
          Where can I view my booked tickets?
        </Text>

        <Text style={[styles.answer, { color: colors.textSecondary }]}>
          Navigate to the Bookings tab to view all your current and previous
          bookings.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.question, { color: colors.text }]}>
          How do I scan my ticket?
        </Text>

        <Text style={[styles.answer, { color: colors.textSecondary }]}>
          Your QR code is generated after booking. Event organizers can scan
          the QR code for ticket verification.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.question, { color: colors.text }]}>
          Contact Support
        </Text>

        <Text style={[styles.answer, { color: colors.textSecondary }]}>
          📧 support@eventify.com
        </Text>

        <Text style={[styles.answer, { color: colors.textSecondary }]}>
          📞 +91 98765 43210
        </Text>

        <Text style={[styles.answer, { color: colors.textSecondary }]}>
          🕘 Monday – Friday (9:00 AM – 6:00 PM)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    marginBottom: 20,
  },

  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  question: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },

  answer: {
    fontSize: 15,
    lineHeight: 24,
  },
});