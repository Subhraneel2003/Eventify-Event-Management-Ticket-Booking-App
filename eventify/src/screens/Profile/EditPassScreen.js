import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Alert, } from 'react-native'
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../../api/userService'
import { updateUser } from '../../store/slices/authSlice'
import { Formik } from 'formik'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { ThemeContext } from '../../context/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { editPassValidationSchema } from '../../validations/editPassValidation'

export default function EditProfileScreen({ navigation }) {
    const { colors } = useContext(ThemeContext)
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleUpdate = async (values) => {
        try {
            if (values.currentPassword !== user.password) {
                Alert.alert(
                    "Incorrect Password",
                    "Current password is incorrect."
                );
                return;
            }

            if (values.currentPassword === values.newPassword) {
                Alert.alert(
                    "Invalid Password",
                    "New password must be different from the current password."
                );
                return;
            }

            const payload = {
                password: values.newPassword,
            };

            const updatedUser = await updateProfile(user.id, payload);

            dispatch(updateUser(updatedUser));

            Alert.alert(
                "Success",
                "Password updated successfully."
            );

            navigation.goBack();
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.flex, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
            <View
                style={[styles.flex, { backgroundColor: colors.background }]}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>

                <Text style={[styles.heading, { color: colors.text }]}>
                    Change Password
                </Text>

                <View style={[styles.card, { backgroundColor: colors.surface }]}>

                    <Formik initialValues={{
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    }}
                        validationSchema={editPassValidationSchema}
                        onSubmit={handleUpdate}
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
                                    label="Your Current Password"
                                    placeholder="Enter Your Current Password"
                                    value={values.currentPassword}
                                    onChangeText={handleChange('currentPassword')}
                                    onBlur={handleBlur('currentPassword')}
                                    error={errors.currentPassword}
                                    touched={touched.currentPassword}
                                    secureTextEntry={!showCurrentPassword}
                                    showPasswordToggle
                                    onToggleSecureEntry={() =>
                                        setShowCurrentPassword(prev => !prev)
                                    }
                                />

                                <Input
                                    label="Your New Password"
                                    placeholder="Enter Your New Password"
                                    value={values.newPassword}
                                    onChangeText={handleChange('newPassword')}
                                    onBlur={handleBlur('newPassword')}
                                    error={errors.newPassword}
                                    touched={touched.newPassword}
                                    secureTextEntry={!showNewPassword}
                                    showPasswordToggle
                                    onToggleSecureEntry={() =>
                                        setShowNewPassword(prev => !prev)
                                    }
                                />

                                <Input
                                    label="Confirm New Password"
                                    placeholder="Confirm Your New Password"
                                    value={values.confirmPassword}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={handleBlur('confirmPassword')}
                                    error={errors.confirmPassword}
                                    touched={touched.confirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    showPasswordToggle
                                    onToggleSecureEntry={() =>
                                        setShowConfirmPassword(prev => !prev)
                                    }
                                />

                                <Button title="Save Changes"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    style={styles.updateButton} />
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    avatarContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    },
    avatar: {

        width: 120,
        height: 120,
        borderRadius: 60,
    },
    backButton: {
        position: 'absolute',
        top: 45,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 32,
        marginTop: 60,
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
        marginHorizontal: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    updateButton: {
        marginTop: 16,
    },
})