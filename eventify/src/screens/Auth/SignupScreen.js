import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Formik } from 'formik';
import { signupValidationSchema } from '../../validations/signupValidation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ThemeContext } from '../../context/ThemeContext';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const SignupScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { height } = useWindowDimensions();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    isOrganizer: false,
  };

  const handleSignup = async (values, { setSubmitting }) => {
    try {
      const email = values.email.trim().toLowerCase();
      const existingUser = await axios.get(`${API_BASE_URL}/users`, {
        params: { email },
      });

      if (existingUser.data.length > 0) {
        Alert.alert('Error', 'User already exists');
        return;
      }

      const { isOrganizer, phoneNumber, ...userDetails } = values;

      const user = {
        ...userDetails,
        email,
        role: !isOrganizer ? 'user' : 'organizer',
        phone: phoneNumber,
        profileImage: '',
        createdAt: new Date().toISOString(),
      };

      await axios.post(`${API_BASE_URL}/users`, user);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        'An error occurred during signup. Please try again.'
      );
      console.log('Error during signup', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        style={[styles.flex, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Sign Up</Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                  secureTextEntry={!showPassword}
                  showPasswordToggle
                  onToggleSecureEntry={() => setShowPassword((prev) => !prev)}
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
                  onPress={() =>
                    setFieldValue('isOrganizer', !values.isOrganizer)
                  }
                >
                  <Checkbox
                    value={values.isOrganizer}
                    onValueChange={(val) => setFieldValue('isOrganizer', val)}
                    color={values.isOrganizer ? colors.primary : undefined}
                  />
                  <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                    Be an Organizer
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign Up"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={styles.signupButton}
                />

                <TouchableOpacity
                  style={styles.footerRow}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.footerText, { color: colors.textSecondary }]}
                  >
                    Already have an account?{' '}
                  </Text>
                  <Text style={[styles.footerLink, { color: colors.primary }]}>
                    Login
                  </Text>
                </TouchableOpacity>
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
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  card: {
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
    marginLeft: 10,
  },
  signupButton: {
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignupScreen;
