import * as Yup from "yup";

export const emailEditValidationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
});