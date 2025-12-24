import * as yup from "yup";

export const AuthSchema = yup.object().shape({
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .min(8, "Minimum password length is 8 characters")
    .max(20, "Maximum password length is 20 characters")
    .required("Password is required"),
  username: yup.string().optional(),
  role_id: yup.number().optional(),
});

export const RefreshTokenSchema = yup.object().shape({
  refreshToken: yup.string().required("Refresh token is required"),
});

