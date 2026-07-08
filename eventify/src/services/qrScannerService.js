import { updateBookingStatus } from "../api/bookingService"

export const parseQRdata = (qrData) => {
    try {
        return JSON.parse(qrData)
    } catch (error) {
        throw new Error("Invalid QR Code")
    }
}

export const validateBookingQR = (qrData, bookings, currentUserId, events) => {
    const booking = bookings.find((b) =>
        b.id === qrData.bookingId && b.qrCode === qrData.qrCode)

    if (!booking) {
        throw new Error("Booking Doesn't exist")
    }

    const event = events.find((e) => e.id === booking.eventId);

    if (!event) {
        throw new Error("Event not found")
    }

    const today = new Date().toISOString().split("T")[0];
    const eventDate = event.date

    if (event.organizerId !== currentUserId) {
        throw new Error("Only the event organizer can scan this ticket. You are not authorized to validate this ticket.");
    }

    if (today !== eventDate) {
        throw new Error("This ticket is not valid today.");
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