import * as ImagePicker from "expo-image-picker";

export const pickImage = async (type) => {
    try {
        let permission;

        if (type === "gallery") {
            permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        } else if (type === "camera") {
            permission = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            throw new Error("Invalid image picker type");
        }

        if (!permission.granted) {
            throw new Error("Permission denied");
        }

        let result;

        if (type === "gallery") {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
        } else {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
        }

        if (result.canceled) {
            return null;
        }

        return result.assets[0].uri;
    } catch (error) {
        console.log("Image Picker Error:", error.message);
        return null;
    }
};