import { clearCache } from "../configs/radis.js";
import supabase from "../configs/supabase.js";

export const InsertToForm = async (payload) => {
  const { data, error } = await supabase
    .from("forms")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    console.log("err", error);
    throw error;
  }

  return data ?? null;
};

export const updateForm = async (id, payload) => {
  const { data, error } = await supabase
    .from("forms")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.log("err", error);
    throw error;
  }

  return data ?? null;
};

export const deleteForm = async (id) => {
  const { error } = await supabase.from("forms").delete().eq("id", id);

  if (error) {
    console.log("error", error);
    throw error;
  }
};

export const getAllForms = async () => {
  const { data, error } = await supabase
    .from("forms")
    .select(
      `
    *,
    responses:form_responses(count)
  `
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.log("error", error);
    throw error;
  }
  const formsWithCount = data.map((form) => ({
    ...form,
    responses: form.responses?.[0]?.count || 0,
  }));
  return formsWithCount ?? [];
};

export const getFormById = async (id) => {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.log("error", error);
    throw error;
  }

  return data ?? null;
};

export const isValidFormId = async (id) => {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.log("error", error);
    throw error;
  }

  if (!data) throw new Error("Form not found");

  return data;
};
