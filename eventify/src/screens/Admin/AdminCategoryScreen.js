import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import Button from '../../components/Button';
import {
    fetchCategories,
    createCategory,
} from '../../api/categoryService';

export default function AdminCategoryScreen({ navigation }) {
    const { colors } = useContext(ThemeContext);

    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert("Error", "Please enter a category");
            return;
        }

        try {
            const newCategory = await createCategory({
                name: categoryName,
            });

            setCategories(prev => [...prev, newCategory]);
            setCategoryName("");

            Alert.alert("Success", "Category added successfully");
        } catch (err) {
            Alert.alert("Error", err.message);
        }
    };

    const renderItem = ({ item }) => (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}
        >
            <Ionicons
                name="pricetag-outline"
                size={22}
                color={colors.primary}
            />

            <Text
                style={[
                    styles.categoryName,
                    { color: colors.text },
                ]}
            >
                {item.name}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View
                style={[
                    styles.center,
                    { backgroundColor: colors.background },
                ]}
            >
                <ActivityIndicator
                    size="large"
                    color={colors.primary}
                />
            </View>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text
                style={[
                    styles.heading,
                    { color: colors.text },
                ]}
            >
                Manage Categories
            </Text>

            <TextInput
                placeholder="Enter category name"
                placeholderTextColor={colors.textSecondary}
                value={categoryName}
                onChangeText={setCategoryName}
                style={[
                    styles.input,
                    {
                        color: colors.text,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            />

            <Button
                title="Add Category"
                onPress={handleAddCategory}
                style={{ marginBottom: 20 }}
            />

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text
                        style={{
                            textAlign: "center",
                            color: colors.textSecondary,
                            marginTop: 40,
                        }}
                    >
                        No Categories Found
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    heading: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: 'center'
    },

    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        fontSize: 16,
    },
    backButton: {
        position: 'absolute',
        top: 45,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
    },

    categoryName: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },
});