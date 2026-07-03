import { KeyboardAvoidingView, ScrollView, View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import React, { useContext } from 'react';
import { Formik } from 'formik';
import { eventEditValidation } from '../../validations/eventEditValidation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ThemeContext } from '../../context/ThemeContext';

export default function EventEditScreen({ route }) {
    const { event } = route.params;
    const {colors}=useContext(ThemeContext)
    const { height } = useWindowDimensions();

    const handleUpdate = async (values) => {
        
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
                <View style={{ flex: 1, padding: 16 }}>
                    <Formik
                        initialValues={{
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
                            location: {
                                latitude: event.location.latitude,
                                longitude: event.location.longitude,
                            },
                        }}
                        validationSchema={eventEditValidation}
                        onSubmit={handleUpdate}
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

                                <Input
                                    label="Category"
                                    placeholder="Enter category"
                                    value={values.category}
                                    onChangeText={handleChange('category')}
                                    onBlur={handleBlur('category')}
                                    error={errors.category}
                                    touched={touched.category}
                                />

                                <Input
                                    label="Date"
                                    placeholder="YYYY-MM-DD"
                                    value={values.date}
                                    onChangeText={handleChange('date')}
                                    onBlur={handleBlur('date')}
                                    error={errors.date}
                                    touched={touched.date}
                                />

                                <Input
                                    label="Time"
                                    placeholder="HH:MM"
                                    value={values.time}
                                    onChangeText={handleChange('time')}
                                    onBlur={handleBlur('time')}
                                    error={errors.time}
                                    touched={touched.time}
                                />

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
                                    label="Cover Image URL"
                                    placeholder="Enter image URL"
                                    value={values.coverImage}
                                    onChangeText={handleChange('coverImage')}
                                    onBlur={handleBlur('coverImage')}
                                    error={errors.coverImage}
                                    touched={touched.coverImage}
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

                                <Button
                                    title="Update Event"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                />

                            </View>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


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
