import { KeyboardAvoidingView, ScrollView, View, Text, StyleSheet, Platform, useWindowDimensions, Alert, TouchableOpacity, Modal, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Formik } from 'formik';
import { eventEditValidation } from '../../validations/eventEditValidation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ThemeContext } from '../../context/ThemeContext';
import { addEvent, updateEventsInfo } from '../../api/eventService';
import { fetchCategories } from '../../api/categoryService';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { pickImage } from '../../services/imagePickerService'
import { useAuth } from '../../hooks/useAuth';
import { uploadImage } from '../../utils/cloudinary';

const statusItems = ["Completed", "Upcoming", "Cancelled"]
export default function EventFormScreen({ route, navigation }) {
    const { mode, eventId } = route.params;
    const { colors } = useContext(ThemeContext)
    const { height } = useWindowDimensions();
    const [categories, setCategories] = useState([]);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false)
    const event = useSelector(state => state.events.events.find(e => e.id === eventId))
    const { user } = useAuth()
    const [coverImage, setCoverImage] = useState(event?.coverImage)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [region, setRegion] = useState({
        latitude: 19.033,
        longitude: 73.0297,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (err) {
                console.error('Failed to load categories:', err.message);
            }
        };

        loadCategories();
    }, []);

    const handleUpdate = async (values) => {
        if (mode === "edit") {
            try {
                const payload = {
                    ...values,
                    price: Number(values.price),
                    totalSeats: Number(values.totalSeats),
                    availableSeats: Number(values.availableSeats),
                }
                const hasChanged =
                    payload.title !== event.title ||
                    payload.description !== event.description ||
                    payload.price !== event.price ||
                    payload.totalSeats !== event.totalSeats ||
                    payload.availableSeats !== event.availableSeats ||
                    payload.status !== event.status ||
                    payload.location.latitude !== event.location.latitude ||
                    payload.location.longitude !== event.location.longitude ||
                    payload.coverImage !== event.coverImage

                if (!hasChanged) {
                    Alert.alert("No Changes", "No changes were made.");
                    return;
                }
                await updateEventsInfo(event.id, payload)
                Alert.alert("Success", "Events Info Successfully Updated")
                navigation.goBack()
            }
            catch (err) {
                console.log(err.message)
            }
        }
        else {
            try {
                const payload = {
                    ...values,
                    organizerId: user.id,
                    price: Number(values.price),
                    totalSeats: Number(values.totalSeats),
                    availableSeats: Number(values.availableSeats),
                    createdAt: new Date().toISOString()
                }
                await addEvent(payload)
                Alert.alert("Success", "New Event Created")
                navigation.goBack()
            } catch (err) {
                console.log(err.message)
            }
        }
    }

    const handleLocate = async (address, venue, setFieldValue) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location permission is required to locate the venue.")
                return
            }
            const searchQuery = `${venue}, ${address}`
            const res = await Location.geocodeAsync(searchQuery)
            if (res.length === 0) {
                Alert.alert("Warning", "Location not Found")
                return
            }
            const { latitude, longitude } = res[0]
            setRegion({
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            })
            setFieldValue("location.latitude", latitude)
            setFieldValue("location.longitude", longitude)
        }
        catch (err) {
            Alert.alert("Unable to trace Location")
        }
    }

    const handleMarkerDrag = async (e, setFieldValue) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()

            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location permission is required to locate the venue.")
                return
            }

            setRegion({
                latitude,
                longitude,
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
            });

            setFieldValue("location.latitude", latitude);
            setFieldValue("location.longitude", longitude);

            const result = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (result.length > 0) {
                const place = result[0];

                const address = [
                    place.name,
                    place.street,
                    place.city,
                    place.region,
                    place.postalCode,
                    place.country,
                ]
                    .filter(Boolean)
                    .join(", ");

                setFieldValue("address", address);
            }
        } catch (err) {
            Alert.alert("Error", "Unable to update the address.");
        }
    }

    const showImagePickerOptions = (setFieldValue, setFieldTouched) => {
        Alert.alert(
            "Cover Image",
            "Choose Cover Image for Event",
            [
                {
                    text: "Take Photo",
                    onPress: () => handlePickImage("camera", setFieldValue, setFieldTouched),
                },
                {
                    text: "Choose From Library",
                    onPress: () => handlePickImage("gallery", setFieldValue, setFieldTouched),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
    };

    const handlePickImage = async (type, setFieldValue, setFieldTouched) => {
        const uri = await pickImage(type);

        if (!uri) return;

        const imageUri = await uploadImage(uri);

        if (imageUri) {
            setFieldValue("coverImage", imageUri);
            setFieldTouched("coverImage", true);
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
                showsVerticalScrollIndicator={true}
            >
                <Text style={[styles.heading, { color: colors.text }]}>
                    {
                        mode === "edit" ? "Edit Event Form" : "New Event Form"
                    }
                </Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>

                    <Formik
                        initialValues={mode === "edit" ? {
                            title: event.title,
                            description: event.description,
                            category: event.category,
                            date: event.date,
                            time: event.time,
                            venueName: event.venueName,
                            address: event.address,
                            coverImage: event.coverImage,
                            price: String(event.price),
                            totalSeats: String(event.totalSeats),
                            availableSeats: String(event.availableSeats),
                            status: event.status,
                            location: {
                                latitude: event.location.latitude,
                                longitude: event.location.longitude,
                            }
                        } : {
                            title: "",
                            description: "",
                            category: "",
                            status: "",
                            date: "",
                            time: "",
                            venueName: "",
                            address: "",
                            coverImage: "",
                            price: "",
                            totalSeats: "",
                            availableSeats: "",
                            location: {
                                latitude: "",
                                longitude: "",
                            }
                        }
                        }
                        validationSchema={eventEditValidation}
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
                            setFieldTouched
                        }) => (
                            <View>

                                <View style={styles.avatarContainer}>
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => showImagePickerOptions(setFieldValue, setFieldTouched)}>
                                        <Image
                                            source={{ uri: values.coverImage }}
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
                                    {touched.coverImage && errors.coverImage && (
                                        <Text style={{ color: colors.danger, textAlign: "center", marginTop: 8 }}>
                                            {errors.coverImage}
                                        </Text>
                                    )}
                                </View>

                                <Input
                                    label="Event Title"
                                    placeholder="Enter event title"
                                    value={values.title}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    error={errors.title}
                                    touched={touched.title}
                                />

                                <Input
                                    label="Description"
                                    placeholder="Enter description"
                                    value={values.description}
                                    onChangeText={handleChange('description')}
                                    onBlur={handleBlur('description')}
                                    error={errors.description}
                                    touched={touched.description}
                                    multiline
                                />

                                <View style={styles.dropdownWrapper}>
                                    <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                                    <TouchableOpacity
                                        style={[styles.dropdownButton, {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                        }]}
                                        onPress={() => setCategoryModalVisible(true)}
                                    >
                                        <Text style={[styles.dropdownButtonText, { color: colors.text }]}> {values.category || 'Select Category'}</Text>
                                        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    {touched.category && errors.category ? (
                                        <Text style={[styles.errorText, { color: colors.danger }]}>{errors.category}</Text>
                                    ) : null}
                                </View>

                                <Modal
                                    visible={categoryModalVisible}
                                    transparent
                                    animationType="slide"
                                    onRequestClose={() => setCategoryModalVisible(false)}
                                >
                                    <View style={styles.overlay}>
                                        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
                                            {categories.length > 0 ? (
                                                categories.map((item) => (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        onPress={() => {
                                                            setFieldValue('category', item.name);
                                                            setCategoryModalVisible(false);
                                                        }}
                                                        style={[
                                                            styles.dropdownItem,
                                                            { backgroundColor: colors.surface },
                                                            values.category === item.name && styles.dropdownItemActive,
                                                        ]}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text style={[styles.dropdownItemText, {
                                                            color: values.category === item.name ? '#fff' : colors.text,
                                                        }]}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading categories...</Text>
                                            )}
                                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)} activeOpacity={0.8}>
                                                <Text style={{ color: colors.primary, textAlign: 'center', marginTop: 10, fontWeight: '600' }}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>

                                <View style={styles.dropdownWrapper}>
                                    <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                                    <TouchableOpacity
                                        style={[styles.dropdownButton, {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                        }]}
                                        onPress={() => setStatusModalVisible(true)}
                                    >
                                        <Text style={[styles.dropdownButtonText, { color: colors.text }]}> {values.status || 'Select Status'}</Text>
                                        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    {touched.status && errors.status ? (
                                        <Text style={[styles.errorText, { color: colors.danger }]}>{errors.status}</Text>
                                    ) : null}
                                </View>

                                <Modal
                                    visible={statusModalVisible}
                                    transparent
                                    animationType="slide"
                                    onRequestClose={() => setStatusModalVisible(false)}
                                >
                                    <View style={styles.overlay}>
                                        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Status</Text>
                                            {
                                                statusItems.map((item) => (
                                                    <TouchableOpacity
                                                        key={item}
                                                        onPress={() => {
                                                            setFieldValue('status', item);
                                                            setStatusModalVisible(false);
                                                        }}
                                                        style={[
                                                            styles.dropdownItem,
                                                            { backgroundColor: colors.surface },
                                                            values.status === item && styles.dropdownItemActive,
                                                        ]}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text style={[styles.dropdownItemText, {
                                                            color: values.status === item ? '#fff' : colors.text,
                                                        }]}>{item}</Text>
                                                    </TouchableOpacity>
                                                ))
                                            }
                                            <TouchableOpacity onPress={() => setStatusModalVisible(false)} activeOpacity={0.8}>
                                                <Text style={{ color: colors.primary, textAlign: 'center', marginTop: 10, fontWeight: '600' }}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>

                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <Input
                                        label="Date"
                                        placeholder="Select Date"
                                        value={values.date}
                                        editable={false}
                                        pointerEvents="none"
                                        error={errors.date}
                                        touched={touched.date}
                                    />
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={values.date ? new Date(values.date) : new Date()}
                                        mode="date"
                                        display="default"
                                        minimumDate={new Date()}
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);

                                            if (selectedDate) {
                                                const formatted = selectedDate.toISOString().split("T")[0];
                                                setFieldValue("date", formatted);
                                            }
                                        }}
                                    />
                                )}

                                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                    <Input
                                        label="Time"
                                        placeholder="Select Time"
                                        value={values.time}
                                        editable={false}
                                        pointerEvents="none"
                                        error={errors.time}
                                        touched={touched.time}
                                    />
                                </TouchableOpacity>

                                {showTimePicker && (
                                    <DateTimePicker
                                        value={new Date()}
                                        mode="time"
                                        display="default"
                                        is24Hour={true}
                                        onChange={(event, selectedTime) => {
                                            setShowTimePicker(false);

                                            if (selectedTime) {
                                                const hours = String(selectedTime.getHours()).padStart(2, "0");
                                                const minutes = String(selectedTime.getMinutes()).padStart(2, "0");

                                                setFieldValue("time", `${hours}:${minutes}`);
                                            }
                                        }}
                                    />
                                )}

                                <Input
                                    label="Venue Name"
                                    placeholder="Enter venue"
                                    value={values.venueName}
                                    onChangeText={handleChange('venueName')}
                                    onBlur={handleBlur('venueName')}
                                    error={errors.venueName}
                                    touched={touched.venueName}
                                />

                                <Input
                                    label="Address"
                                    placeholder="Enter address"
                                    value={values.address}
                                    onChangeText={handleChange('address')}
                                    onBlur={handleBlur('address')}
                                    error={errors.address}
                                    touched={touched.address}
                                />

                                <Input
                                    label="Price"
                                    placeholder="Enter price"
                                    value={values.price}
                                    onChangeText={handleChange('price')}
                                    onBlur={handleBlur('price')}
                                    error={errors.price}
                                    touched={touched.price}
                                    keyboardType="numeric"
                                />

                                <Input
                                    label="Total Seats"
                                    placeholder="Enter total seats"
                                    value={values.totalSeats}
                                    onChangeText={handleChange('totalSeats')}
                                    onBlur={handleBlur('totalSeats')}
                                    error={errors.totalSeats}
                                    touched={touched.totalSeats}
                                    keyboardType="numeric"
                                />

                                <Input
                                    label="Available Seats"
                                    placeholder="Enter available seats"
                                    value={values.availableSeats}
                                    onChangeText={handleChange('availableSeats')}
                                    onBlur={handleBlur('availableSeats')}
                                    error={errors.availableSeats}
                                    touched={touched.availableSeats}
                                    keyboardType="numeric"
                                />

                                <Button title="Locate Venue" onPress={() => handleLocate(values.address, values.venueName, setFieldValue)} style={styles.mapButton} />
                                <Text style={styles.label}>Location</Text>
                                <View style={styles.mapContainer}>
                                    <MapView region={region} style={styles.map}>
                                        <Marker
                                            draggable
                                            coordinate={{
                                                latitude: region.latitude,
                                                longitude: region.longitude
                                            }}
                                            onDragEnd={(e) => handleMarkerDrag(e, setFieldValue)}
                                        />
                                    </MapView>
                                </View>
                                <Button
                                    title={mode === "edit" ? "Update Event" : "Submit New Event"}
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    style={styles.updateButton}
                                />

                            </View>
                        )}
                    </Formik>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    flex: {
        flex: 1,
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
        marginHorizontal: 4,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: "black",
        borderWidth: 2,
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
    dropdownWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    dropdownButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    dropdownItemActive: {
        backgroundColor: '#6F4BFF',
    },
    dropdownItemText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 12,
    },
    updateButton: {
        marginTop: 16,
    },
    loginButton: {
        marginTop: 8,
    },
    mapContainer: {
        height: 220,
        borderRadius: 12,
        overflow: "hidden",

        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    map: {
        flex: 1,
    },
    mapButton: {
        backgroundColor: "#067953",
        marginBottom: 15
    }
});
