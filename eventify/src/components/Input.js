import React, { useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { lightColors } from "../styles/colors";

const Input = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  showPasswordToggle = false,
  onToggleSecureEntry,
  error,
  touched,
  ...rest
}) => {
  const { colors } = useContext(ThemeContext) || {
    colors: lightColors,
  };

  const hasError = touched && error;
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.danger : colors.border,
          },
          rest.multiline && styles.multilineContainer,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
            rest.multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          {...rest}
        />

        {showPasswordToggle && (
          <TouchableOpacity onPress={onToggleSecureEntry}>
            <Ionicons
              name={
                secureTextEntry
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {hasError && (
        <Text
          style={[
            styles.errorText,
            { color: colors.danger },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 50,
  },

  multilineContainer: {
    alignItems: "flex-start",
  },

  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },

  multilineInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },

  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;