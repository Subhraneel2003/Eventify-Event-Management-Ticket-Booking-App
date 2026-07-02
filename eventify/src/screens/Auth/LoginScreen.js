import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import { loginValidationSchema } from '../../validations/loginValidation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { lightColors } from '../../styles/colors';

const LoginScreen = ({ navigation }) => {
  const initialValues = {
    email: '',
    password: '',
  };

  const handleLogin = (values) => {
    // TODO: connect to auth
    console.log('Login values:', values);
    Alert.alert('Success', 'Logged in successfully!');
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
        <Text style={styles.heading}>Login</Text>

        <View style={styles.card}>
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
  loginButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
