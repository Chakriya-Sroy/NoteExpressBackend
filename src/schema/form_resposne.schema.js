import * as yup from 'yup';

export const FormResponseSchema=yup.object({
    form_id:yup.string().required("Form id is required"),
    answers:yup.mixed().required('Answer is required')
})