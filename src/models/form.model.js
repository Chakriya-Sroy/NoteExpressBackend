import supabase from "../configs/supabase.js";

export const InsertToForm = async (payload) => {
  const { data, error } = await supabase
    .from("forms")
    .insert({...payload, updated_at: new Date().toISOString()})
    .select("*")
    .single();

  if (error) {
    console.log("err", error);
    throw error;
  }

  return data ?? null;
};

export const updateForm = async (id, payload) => {
  const { data, error } = await supabase
    .from("forms")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

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
  const { data, error } = await supabase.from("forms").select("*").order("updated_at", { ascending: false });

  if (error) {
    console.log("error", error);
    throw error;
  }

  return data ?? [];
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
