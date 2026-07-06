const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImage = async (imageUri) => {
    const data = new FormData();

    data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
    });

    data.append(
        "upload_preset",
        UPLOAD_PRESET
    );

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );
        const result = await response.json();
        return result.secure_url;

    } catch (error) {
        return null;
    }
};