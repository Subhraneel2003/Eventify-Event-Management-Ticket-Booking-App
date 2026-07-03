export const getQRData = (bookingId, eventId, userId, qrCode) => {
  return JSON.stringify({
    bookingId,
    eventId,
    userId,
    qrCode,
  });
};
