import * as yup from "yup";

const baseSchema = {
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .min(8, "Minimum password length is 8 characters")
    .max(20, "Maximum password length is 20 characters")
    .required("Password is required"),
};

export const AuthSchema = yup.object().shape({
  ...baseSchema,
  username: yup.string().optional(),
  role_id: yup.number().optional(),
});

export const SignupSchema = yup.object().shape({
  ...baseSchema,
  username: yup.string().required("Username is required").min(1),
  confirm_password: yup
    .string()
    .required("Confirm Password is required")
    .min(8, "Minimum password length is 8 characters")
    .max(20, "Maximum password length is 20 characters")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export const RefreshTokenSchema = yup.object().shape({
  refreshToken: yup.string().required("Refresh token is required"),
});
