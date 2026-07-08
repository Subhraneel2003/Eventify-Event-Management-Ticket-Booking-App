import { pickImage } from '../../../src/services/imagePickerService';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
}));

describe('imagePickerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns the selected image URI when gallery permission is granted', async () => {
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
        ImagePicker.launchImageLibraryAsync.mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://gallery-image.jpg' }],
        });

        await expect(pickImage('gallery')).resolves.toBe('file://gallery-image.jpg');
        expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
    });

    it('returns the selected image URI when camera permission is granted', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true });
        ImagePicker.launchCameraAsync.mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://camera-image.jpg' }],
        });

        await expect(pickImage('camera')).resolves.toBe('file://camera-image.jpg');
        expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
        expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
    });

    it('returns null when gallery permission is denied', async () => {
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });

        await expect(pickImage('gallery')).resolves.toBeNull();
        expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('returns null when camera permission is denied', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false });

        await expect(pickImage('camera')).resolves.toBeNull();
        expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });

    it('returns null when the gallery picker is cancelled', async () => {
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
        ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });

        await expect(pickImage('gallery')).resolves.toBeNull();
    });

    it('returns null when the camera picker is cancelled', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true });
        ImagePicker.launchCameraAsync.mockResolvedValue({ canceled: true });

        await expect(pickImage('camera')).resolves.toBeNull();
    });
});
