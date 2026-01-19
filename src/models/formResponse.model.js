import supabase from "../configs/supabase.js";

export const insertFormResponse = async (payload) => {
  const { data, error } = await supabase
    .from("form_responses")
    .insert(payload)
    .select("*")
    .maybeSingle();
  if (error) {
    console.log("error", error);
    throw error;
  }
  return data ?? null;
};

export const getAllFormRespones = async () => {
  const { data, count, error } = await supabase
    .from("form_responses")
    .select("*", { count: "exact" });
  if (error) {
    console.log("this is error", error);
    throw error;
  }
  return data ?? [];
};

export const getFormResponseById = async (id) => {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.log("this is error", error);
    throw error;
  }
  return data ?? null;
};
