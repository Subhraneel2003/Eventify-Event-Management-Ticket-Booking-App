import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../../api/userService'
import { updateUser } from '../../store/slices/authSlice'
import { Formik } from 'formik'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { profileEditValidationSchema } from '../../validations/editProfileDetailsValidation'
import { ThemeContext } from '../../context/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { pickImage } from '../../services/imagePickerService'
import { useAuth } from '../../hooks/useAuth'

export default function EditProfileScreen({ navigation }) {
    const { colors } = useContext(ThemeContext)
    const { user } = useAuth()
    const dispatch = useDispatch()
    const [profileImage, setProfileImage] = useState(user?.profileImage)

    const handleUpdate = async (values) => {
        const hasChanged =
            values.name !== user?.name ||
            values.phone !== user?.phone ||
            profileImage !== user?.profileImage;

        try {
            if (!hasChanged) {
                Alert.alert("No Changes", "No changed were made")
                return
            }
            const payload = {
                ...values,
                profileImage
            }
            const updatedValue = await updateProfile(user?.id, payload)
            dispatch(updateUser(updatedValue))
            Alert.alert("Success", "Your Info Successfully Updated")
            navigation.goBack()
        }
        catch (err) {
            console.log(err.message)
        }
    }

    const showImagePickerOptions = () => {
        Alert.alert(
            "Profile Image",
            "Choose Profile Image",
            [
                {
                    text: "Take Photo",
                    onPress: () => handlePickImage("camera"),
                },
                {
                    text: "Choose From Library",
                    onPress: () => handlePickImage("gallery"),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
    };

    const handlePickImage = async (type) => {
        const imageUri = await pickImage(type)
        if (imageUri) {
            setProfileImage(imageUri)
        }
    }

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
                    Edit Profile
                </Text>

                <View style={[styles.card, { backgroundColor: colors.surface }]}>

                    <View style={styles.avatarContainer}>
                        <TouchableOpacity activeOpacity={0.8} onPress={showImagePickerOptions}>
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.avatar}
                            />

                            <View
                                style={[
                                    styles.cameraIcon,
                                    { backgroundColor: colors.primary },
                                ]}
                            >
                                <Ionicons
                                    name="pencil-outline"
                                    size={18}
                                    color="#fff"
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Formik initialValues={{
                        name: user.name,
                        phone: user.phone
                    }}
                        validationSchema={profileEditValidationSchema}
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
                                    label="Your Name"
                                    placeholder="Enter Your Name"
                                    value={values.name}
                                    onChangeText={handleChange('name')}
                                    onBlur={handleBlur('name')}
                                    error={errors.name}
                                    touched={touched.name}
                                />

                                <Input
                                    label="Your Phone Number"
                                    placeholder="Enter Your Phone Number"
                                    value={values.phone}
                                    onChangeText={handleChange('phone')}
                                    onBlur={handleBlur('phone')}
                                    error={errors.phone}
                                    touched={touched.phone}
                                    keyboardType="numeric"
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
        alignItems: "center",
        marginBottom: 20
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    cameraIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
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