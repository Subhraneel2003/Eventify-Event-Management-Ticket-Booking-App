import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import AdminDashboardScreen from '../../../../src/screens/Admin/AdminDashboardScreen';
import { useSelector } from 'react-redux';
import { getAllUsers } from '../../../../src/api/userService';
import { getAllBookings } from '../../../../src/api/bookingService';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('../../../../src/api/userService', () => ({
  getAllUsers: jest.fn(),
}));

jest.mock('../../../../src/api/bookingService', () => ({
  getAllBookings: jest.fn(),
}));

describe('AdminDashboardScreen', () => {
  beforeEach(() => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 1);
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 1);

    useSelector.mockImplementation((selector) =>
      selector({
        events: {
          events: [
            { id: '1', date: futureDate.toISOString() },
            { id: '2', date: pastDate.toISOString() },
          ],
        },
      })
    );

    getAllUsers.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
    getAllBookings.mockResolvedValue([
      { id: 'b1', totalAmount: 120 },
      { id: 'b2', totalAmount: 80 },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders admin dashboard statistics', async () => {
    const { findByText, findAllByText } = render(
      <ThemeContext.Provider value={{ colors: lightColors }}>
        <AdminDashboardScreen navigation={{ goBack: jest.fn() }} />
      </ThemeContext.Provider>
    );

    expect(await findByText('Admin Dashboard')).toBeTruthy();
    expect(await findByText('Total Users')).toBeTruthy();
    expect(await findByText('Total Events')).toBeTruthy();
    expect(await findByText('Upcoming')).toBeTruthy();
    expect(await findByText('Completed')).toBeTruthy();
    expect(await findByText('Bookings')).toBeTruthy();
    expect(await findByText('Revenue')).toBeTruthy();
    expect(await findByText(/₹200/)).toBeTruthy();

    expect((await findAllByText('2')).length).toBeGreaterThanOrEqual(2);
    expect((await findAllByText('1')).length).toBeGreaterThanOrEqual(2);

    await waitFor(() => {
      expect(getAllUsers).toHaveBeenCalled();
      expect(getAllBookings).toHaveBeenCalled();
    });
  });
});
