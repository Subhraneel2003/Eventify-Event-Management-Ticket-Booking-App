import { parseQRdata, validateBookingQR, markBookingAsUsed } from '../../../src/services/qrScannerService';
import { updateBookingStatus } from '../../../src/api/bookingService';

jest.mock('../../../src/api/bookingService', () => ({
  updateBookingStatus: jest.fn(),
}));

describe('qrScannerService', () => {
  const bookings = [
    {
      id: 'b1',
      qrCode: 'code-1',
      eventId: 'e1',
      status: 'confirmed',
    },
  ];

  const events = [
    {
      id: 'e1',
      organizerId: 'organizer-id',
      date: '2026-07-08',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-08T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('parses valid QR code JSON', () => {
    expect(parseQRdata('{"bookingId":"b1","qrCode":"code-1"}')).toEqual({
      bookingId: 'b1',
      qrCode: 'code-1',
    });
  });

  it('throws an error for invalid QR code JSON', () => {
    expect(() => parseQRdata('not-json')).toThrow('Invalid QR Code');
  });

  it('validates a booking QR for the organizer on the event date', () => {
    const result = validateBookingQR(
      { bookingId: 'b1', qrCode: 'code-1' },
      bookings,
      'organizer-id',
      events
    );

    expect(result).toEqual(bookings[0]);
  });

  it('throws when the booking does not exist', () => {
    expect(() =>
      validateBookingQR(
        { bookingId: 'missing', qrCode: 'code-1' },
        bookings,
        'organizer-id',
        events
      )
    ).toThrow("Booking Doesn't exist");
  });

  it('marks a booking as used by calling updateBookingStatus', async () => {
    updateBookingStatus.mockResolvedValue({ id: 'b1', status: 'used' });

    await expect(markBookingAsUsed('b1')).resolves.toEqual({ id: 'b1', status: 'used' });
    expect(updateBookingStatus).toHaveBeenCalledWith('b1', 'used');
  });
});
