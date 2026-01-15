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
