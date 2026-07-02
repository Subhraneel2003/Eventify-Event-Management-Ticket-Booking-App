import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { lightColors } from "../styles/colors";

const Input = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  touched,
  ...rest
}) => {
  const hasError = touched && error;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={lightColors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        {...rest}
      />
      {hasError && <Text style={styles.errorText}>{error}</Text>}
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
    color: lightColors.text,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: lightColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: lightColors.text,
    backgroundColor: lightColors.surface,
  },
  inputError: {
    borderColor: lightColors.danger,
  },
  errorText: {
    fontSize: 12,
    color: lightColors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
