import * as Yup from "yup";

export const editPassValidationSchema = Yup.object({

    currentPassword: Yup.string()
    .required("Password cannot be empty"),

    newPassword : Yup.string()
    .min(8, "Password must be of 8 characters")
    .matches(/[A-Z]/, "Must contain one Uppercase letter")
    .matches(/[a-z]/, "Must contain one lowercase letter")
    .matches(/[0-9]/, "Must contain one number")
    .matches(/[@$!%*?&#]/, "Must contain one special character")
    .required("Password is required"),

    confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords should match")
    .required("Password field cannot be empty")
})