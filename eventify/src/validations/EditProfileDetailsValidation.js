import * as Yup from "yup";

export const profileEditValidationSchema = Yup.object({
    name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Name is required"),

    phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone Number must be 10 digits")
        .required("Phone number is Required"),

    profileImage: Yup.string()
        .url("Profile Image must be a valid URL")
        .required("Profile Image is required")
})