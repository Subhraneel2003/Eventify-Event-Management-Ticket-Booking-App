import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

export default function AboutScreen() {
  const { colors } = useContext(ThemeContext);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        About Eventify
      </Text>

      <Text style={[styles.appName, { color: colors.primary }]}>
        Eventify v1.0.0
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Eventify is a modern event management and ticket booking application
        built to help users discover exciting events, book tickets securely,
        and manage their bookings with ease.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Key Features
        </Text>

        <Text style={[styles.item, { color: colors.textSecondary }]}>
          • Browse events by category
        </Text>

        <Text style={[styles.item, { color: colors.textSecondary }]}>
          • Book tickets instantly
        </Text>

        <Text style={[styles.item, { color: colors.textSecondary }]}>
          • QR Code ticket validation
        </Text>

        <Text style={[styles.item, { color: colors.textSecondary }]}>
          • Interactive event location maps
        </Text>

        <Text style={[styles.item, { color: colors.textSecondary }]}>
          • Dark & Light Theme
        </Text>

        <Text style={[styles.item, { color: colors.textSecondary }]}>
          • Offline ticket storage
        </Text>

        <Text style={[styles.item, { color: colors.textSecondary }]}>
          • Profile management
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Developed For
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Eventify was developed as a React Native project demonstrating
          authentication, navigation, Redux state management, device
          integration, offline storage, and modern mobile UI design.
        </Text>
      </View>

      <Text style={[styles.footer, { color: colors.textSecondary }]}>
        © 2026 Eventify. All Rights Reserved.
      </Text>
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
    marginBottom: 10,
  },

  appName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
  },

  card: {
    marginTop: 20,
    borderRadius: 16,
    padding: 18,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  item: {
    fontSize: 15,
    marginBottom: 10,
  },

  footer: {
    textAlign: "center",
    marginVertical: 30,
    fontSize: 13,
  },
});