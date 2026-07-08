import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import {
  getThemePreference,
  setThemePreference,
} from '../../services/storageService';

export default function SettingsScreen({ navigation }) {
  const { colors, toggleTheme } = useContext(ThemeContext);
  const [isEnabled, setIsEnabled] = React.useState(false);

  useEffect(() => {
    async function fetchThemePreference() {
      const theme = await getThemePreference();
      setIsEnabled(theme === 'dark');
    }

    fetchThemePreference();
  }, []);

  const handleToggleSwitch = async () => {
    await setThemePreference(isEnabled ? 'light' : 'dark');
    setIsEnabled((previousState) => !previousState);
    toggleTheme();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Appearance
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.leftRow}>
            <Ionicons name="moon-outline" size={22} color={colors.primary} />
            <Text style={[styles.rowText, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>

          <Switch testID="theme-switch" value={isEnabled} onValueChange={handleToggleSwitch} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        About
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.leftRow}>
            <Ionicons
              name="phone-portrait-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.rowText, { color: colors.text }]}>
              App Version
            </Text>
          </View>

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            1.0.0
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Support
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('About')}
        >
          <View style={styles.leftRow}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.rowText, { color: colors.text }]}>
              About Eventify
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Help')}
        >
          <View style={styles.leftRow}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.rowText, { color: colors.text }]}>
              Help & Support
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },

  heading: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 18,
    letterSpacing: 0.8,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '500',
  },

  versionText: {
    fontSize: 15,
  },

  divider: {
    height: 1,
    marginLeft: 54,
  },
});
