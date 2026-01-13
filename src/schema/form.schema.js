import * as yup from "yup";

export const FormSchema = yup.object({
  title: yup
    .string()
    .min(1, "Title can't be empty")
    .required("Title is required"),
  description: yup.string().optional(),
  fields: yup
    .array()
    .of(
      yup.object({
        type: yup.string().required(),
        name: yup
          .string()
          .required("Field Name is required")
          .min(1, "Field Name cannot be empty"),
        label: yup
          .string()
          .required("Field Label is required")
          .min(1, "Field Label cannot be empty"),
        placeholder: yup.string().optional(),
        required: yup.boolean().required(),
      })
    )
    .min(1, "At least one form field is required"),
});
