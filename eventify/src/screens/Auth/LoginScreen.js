import React, { useContext } from 'react';
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
import { Formik } from 'formik';
import { loginValidationSchema } from '../../validations/loginValidation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ThemeContext } from '../../context/ThemeContext';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { generateToken } from '../../utils/tokenManager';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { height } = useWindowDimensions();

  const dispatch = useDispatch();

  const initialValues = {
    email: '',
    password: '',
  };

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users?email=${values.email}&password=${values.password}`
      );
      const user = response.data[0];

      if (!user) {
        Alert.alert('Error', 'Invalid Credentials');
        return;
      }

      const token = generateToken(user.id);
      console.log('Token', token);
      dispatch(login({ user, token }));

      // TODO: call AsyncStorage
    } catch (error) {
      Alert.alert(
        'Login Failed',
        'An error occurred during login. Please try again.'
      );
      console.log('Error during login', error);
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
        <Text style={[styles.heading, { color: colors.text }]}>Login</Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Formik
            initialValues={initialValues}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View>
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

                <Button
                  title="Login"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={styles.loginButton}
                />

                <TouchableOpacity
                  style={styles.footerRow}
                  onPress={() => navigation.navigate('Signup')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.footerText, { color: colors.textSecondary }]}
                  >
                    Don't have an account?{' '}
                  </Text>
                  <Text style={[styles.footerLink, { color: colors.primary }]}>
                    Sign Up
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
  loginButton: {
    marginTop: 8,
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

export default LoginScreen;
