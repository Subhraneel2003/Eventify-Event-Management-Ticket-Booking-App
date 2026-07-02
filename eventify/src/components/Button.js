import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { lightColors } from "../styles/colors";

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "filled", // 'filled' | 'outline'
  style,
  textStyle,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "outline" && styles.outlineButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? lightColors.primary : "#FFFFFF"}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "outline" && styles.outlineButtonText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: lightColors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: lightColors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  outlineButtonText: {
    color: lightColors.primary,
  },
});

export default Button;
