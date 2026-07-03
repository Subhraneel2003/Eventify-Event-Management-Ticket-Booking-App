import React, { useContext } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { lightColors } from "../styles/colors";
import { ThemeContext } from "../context/ThemeContext";

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
  const theme = useContext(ThemeContext);
  const colors = theme?.colors || lightColors;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          rest.multiline && styles.multilineInput,
          {
            borderColor: hasError ? colors.danger : colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        {...rest}
      />
      {hasError && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
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
  input: {
    minHeight: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: lightColors.surface,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
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
