import * as yup from "yup";

export const ChangePasswordSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .min(8, "Minimum password length is 8 characters")
    .max(20, "Maximum password length is 20 characters")
    .required("Old password is required"),

  newPassword: yup
    .string()
    .min(8, "Minimum password length is 8 characters")
    .max(20, "Maximum password length is 20 characters")
    .required("New password is required"),

  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "New Passwords and Confirm Password must match")
    .required("Please confirm your new password"),
});

export const UpdateProfileSchema = yup.object().shape({
  role_id: yup.number().optional(),
  username: yup.string().optional(),
  profile_img: yup.mixed().optional(),
});
