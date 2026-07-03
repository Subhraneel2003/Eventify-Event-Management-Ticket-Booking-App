import * as Yup from "yup";

export const eventEditValidation = Yup.object({

    title: Yup.string()
        .trim()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title cannot exceed 100 characters")
        .required("Title is required"),

    description: Yup.string()
        .trim()
        .min(20, "Description must be at least 20 characters")
        .max(1000, "Description cannot exceed 1000 characters")
        .required("Description is required"),

    category: Yup.string()
        .required("Category is required"),

    date: Yup.string()
        .required("Date is required"),

    time: Yup.string()
        .required("Time is required"),

    venueName: Yup.string()
        .trim()
        .required("Venue name is required"),

    address: Yup.string()
        .trim()
        .required("Address is required"),

    coverImage: Yup.string()
        .url("Enter a valid image URL")
        .required("Cover image is required"),

    price: Yup.number()
        .typeError("Price must be a number")
        .min(0, "Price cannot be negative")
        .required("Price is required"),

    totalSeats: Yup.number()
        .typeError("Total seats must be a number")
        .integer("Total seats must be an integer")
        .min(1, "Total seats must be at least 1")
        .required("Total seats are required"),

    availableSeats: Yup.number()
        .typeError("Available seats must be a number")
        .integer("Available seats must be an integer")
        .min(0, "Available seats cannot be negative")
        .max(
            Yup.ref("totalSeats"),
            "Available seats cannot exceed total seats"
        )
        .required("Available seats are required"),

    location: Yup.object({
        latitude: Yup.number()
            .typeError("Latitude must be a number")
            .required("Latitude is required")
            .min(-90, "Latitude must be between -90 and 90")
            .max(90, "Latitude must be between -90 and 90"),

        longitude: Yup.number()
            .typeError("Longitude must be a number")
            .required("Longitude is required")
            .min(-180, "Longitude must be between -180 and 180")
            .max(180, "Longitude must be between -180 and 180"),
    }),
});