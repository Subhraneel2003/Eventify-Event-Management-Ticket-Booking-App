import { View, Text, Alert, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '../../components/Button';
import { markBookingAsUsed, parseQRdata, validateBookingQR } from '../../services/qrScannerService';
import { useDispatch, useSelector } from 'react-redux';
import { validateBooking } from '../../store/slices/bookingSlice';
import { getAllBookings } from '../../api/bookingService';

export default function QrCodeScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const dispatch = useDispatch()
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        const data = await getAllBookings();
        setBookings(data);
    };

    if (!permission) {
        return <Text>Loading...</Text>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text>
                    Camera permission required
                </Text>

                <Button title="Grant Permission" onPress={requestPermission} />
            </View>
        )
    }

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) {
            return
        }
        setScanned(true)
        try {
            const parsedData = parseQRdata(data)
            const booking = validateBookingQR(parsedData, bookings)
            const updatedBooking = await markBookingAsUsed(booking.id)
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === updatedBooking.id ? updatedBooking : b
                )
            );
            dispatch(validateBooking(booking.id))
            Alert.alert("Success", "Booking Verified",
                [{
                    text: "OK",
                    onPress: () => {
                        setScanned(false)
                        navigation.goBack()
                    }
                }]
            )
        }
        catch (err) {
            Alert.alert(
                "Validation Failed",
                err.message,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setScanned(false);
                            navigation.goBack()
                        }
                    }
                ]
            );
        }
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"]
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <View style={styles.overlay}>
                <View style={styles.scanBox} />

                <Text style={styles.scanText}>
                    Scan Event Ticket
                </Text>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    scanBox: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: "#00FF66",
        borderRadius: 20,
    },

    scanText: {
        marginTop: 20,
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
});