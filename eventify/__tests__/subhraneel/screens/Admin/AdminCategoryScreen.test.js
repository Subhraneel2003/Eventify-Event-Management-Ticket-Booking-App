import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AdminCategoryScreen from '../../../../src/screens/Admin/AdminCategoryScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import { fetchCategories, createCategory } from '../../../../src/api/categoryService';

jest.mock('../../../../src/api/categoryService', () => ({
  fetchCategories: jest.fn(),
  createCategory: jest.fn(),
}));

jest.mock('../../../../src/components/Button', () => ({ title, onPress }) => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));

describe('AdminCategoryScreen', () => {
  beforeEach(() => {
    fetchCategories.mockResolvedValue([
      { id: '1', name: 'Music' },
      { id: '2', name: 'Sports' },
    ]);
    jest.spyOn(Alert, 'alert').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders category list after loading', async () => {
    const { findByText } = render(
      <ThemeContext.Provider value={{ colors: lightColors }}>
        <AdminCategoryScreen />
      </ThemeContext.Provider>
    );

    expect(await findByText('Manage Categories')).toBeTruthy();
    expect(await findByText('Music')).toBeTruthy();
    expect(await findByText('Sports')).toBeTruthy();
  });

  it('adds a new category when the form is submitted', async () => {
    createCategory.mockResolvedValue({ id: '3', name: 'Technology' });
    const { findByPlaceholderText, getByText, findByText } = render(
      <ThemeContext.Provider value={{ colors: lightColors }}>
        <AdminCategoryScreen />
      </ThemeContext.Provider>
    );

    const input = await findByPlaceholderText('Enter category name');
    fireEvent.changeText(input, 'Technology');
    fireEvent.press(getByText('Add Category'));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({ name: 'Technology' });
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Category added successfully');
    });
    expect(await findByText('Technology')).toBeTruthy();
  });
});
