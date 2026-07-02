import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Formik } from 'formik';
import { signupValidationSchema } from '../../validations/signupValidation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { lightColors } from '../../styles/colors';

const SignupScreen = ({ navigation }) => {
  const initialValues = {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    isOrganizer: false,
  };

  const handleSignup = (values) => {
    // TODO: connect to auth
    console.log('Signup values:', values);
    Alert.alert('Success', 'Account created successfully!');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Sign Up</Text>

        <View style={styles.card}>
          <Formik
            initialValues={initialValues}
            validationSchema={signupValidationSchema}
            onSubmit={handleSignup}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View>
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={errors.name}
                  touched={touched.name}
                  autoCapitalize="words"
                />

                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={errors.email}
                  touched={touched.email}
                  keyboardType="email-address"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                  secureTextEntry
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setFieldValue('isOrganizer', !values.isOrganizer)}
                >
                  <Checkbox
                    value={values.isOrganizer}
                    onValueChange={(val) => setFieldValue('isOrganizer', val)}
                    color={values.isOrganizer ? lightColors.primary : undefined}
                  />
                  <Text style={styles.checkboxLabel}>Be an Organizer</Text>
                </TouchableOpacity>

                <Button
                  title="Sign Up"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={styles.signupButton}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.text,
    marginLeft: 10,
  },
  signupButton: {
    marginTop: 4,
  },
});

export default SignupScreen;
