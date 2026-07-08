import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ImageProfileScreen from '../../../../src/screens/Profile/ImageProfileScreen';

describe('ImageProfileScreen', () => {
    it('renders the passed image and calls goBack when the close button is pressed', () => {
        const mockGoBack = jest.fn();
        const imageUri = 'https://example.com/profile.jpg';

        const { getByTestId } = render(
            <ImageProfileScreen
                route={{ params: { imageUri } }}
                navigation={{ goBack: mockGoBack }}
            />
        );

        const image = getByTestId('profile-image');
        expect(image.props.source).toEqual({ uri: imageUri });

        const closeButton = getByTestId('close-button');
        fireEvent.press(closeButton);

        expect(mockGoBack).toHaveBeenCalled();
    });
});
