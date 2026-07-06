import { updateBookingStatus } from "../api/bookingService"

export const parseQRdata = (qrData) => {
    try {
        return JSON.parse(qrData)
    } catch (error) {
        throw new Error("Invalid QR Code")
    }
}

export const validateBookingQR = (qrData, bookings) => {
    const booking = bookings.find((b) =>
        b.id === qrData.bookingId && b.qrCode === qrData.qrCode)

    if (!booking) {
        throw new Error("Booking Doesn't exist")
    }

    if (booking.status === "used") {
        throw new Error("QR already used")
    }

    if (booking.status === "cancelled") {
        throw new Error("Ticket has been cancelled.");
    }
    return booking
}

export const markBookingAsUsed = async (bookingId) => {
    return await updateBookingStatus(bookingId, "used")
}