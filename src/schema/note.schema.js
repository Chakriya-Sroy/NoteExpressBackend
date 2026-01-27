import * as yup from "yup";

export const NoteSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  content:yup.string().optional(),
  pinned:yup.boolean().optional(),
  folder_id:yup.string().optional(),
});

