import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileImageScreen({ route, navigation }) {
    const { imageUri } = route.params;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                testID="close-button"
                style={styles.close}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>

            <Image
                testID="profile-image"
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: "80%",
    },
    close: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    },
});