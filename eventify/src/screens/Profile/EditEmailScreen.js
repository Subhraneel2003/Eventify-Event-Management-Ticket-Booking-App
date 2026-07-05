import React, { useContext } from "react";
import {View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert,} from "react-native";
import { Formik } from "formik";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import Input from "../../components/Input";
import Button from "../../components/Button";
import { ThemeContext } from "../../context/ThemeContext";
import { updateProfile } from "../../api/userService";
import { updateUser } from "../../store/slices/authSlice";
import { emailEditValidationSchema } from "../../validations/editEmailValidation";

export default function EditEmailScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleUpdateEmail = async (values) => {
    try {
      if (values.email === user.email) {
        Alert.alert("No Changes", "No changes were made.");
        return;
      }

      const updatedUser = await updateProfile(user.id, {
        email: values.email,
      });

      dispatch(updateUser(updatedUser));

      Alert.alert("Success", "Email updated successfully.");

      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.flex}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.heading, { color: colors.text }]}>
          Change Email
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Formik
            initialValues={{
              email: user.email,
            }}
            validationSchema={emailEditValidationSchema}
            onSubmit={handleUpdateEmail}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <>
                <Input
                  label="New Email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  error={errors.email}
                  touched={touched.email}
                  keyboardType="email-address"
                />

                <Button
                  title="Save Changes"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={styles.button}
                />
              </>
            )}
          </Formik>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  backButton: {
    position: "absolute",
    top: 45,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 32,
    marginTop: 60,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 24,
  },

  card: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 20,
    elevation: 4,
  },

  button: {
    marginTop: 18,
  },
});