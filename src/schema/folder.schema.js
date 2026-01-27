import * as yup from "yup";

export const FolderSchema = yup.object().shape({
  name: yup.string().required("Folder name is required")
});

