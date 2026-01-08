import * as yup from "yup";

export const ChangePasswordSchema = yup.object().shape({
  old_password: yup
    .string()
    .min(8, "Minimum password length is 8 characters")
    .max(20, "Maximum password length is 20 characters")
    .required("Old password is required"),

  new_password: yup
    .string()
    .min(8, "Minimum password length is 8 characters")
    .max(20, "Maximum password length is 20 characters")
    .required("New password is required"),

  confirm_new_password: yup
    .string()
    .oneOf(
      [yup.ref("new_password"), null],
      "New Passwords and Confirm Password must match"
    )
    .required("Please confirm your new password"),
});

export const UpdateProfileSchema = yup.object().shape({
  role_id: yup
    .number()
    .optional()
    .typeError("Role Id must be a number")
    .test("is-not-empty", "Please Select Role", function (val) {
      if (val === undefined || val === null) return true;
      return yup.number().isValidSync(val);
    }),
  username: yup
    .string()
    .optional()
    .test("is-not-empty", "Username can't be empty", function (val) {
      if (val === undefined || val === null) return true; // undefined/null is OK (optional)
      if (val === "" || val.trim() === "") return false;
      return val.trim().length > 0; // ✅ Must have content
    }),
  profile_img: yup.mixed().optional(),
  email: yup
    .string()
    .optional()
    .test("is-not-empty", "Email can't be empty", function (val) {
      if (val === undefined || val === null) return true; // undefined/null is OK (optional)
      if (val === "" || val.trim() === "") return false;
      return val.trim().length > 0; // ✅ Must have content
    })
    .test("is-email", function (val) {
      if (!val) return true;
      return yup.string().email().isValidSync(val);
    }),
});
