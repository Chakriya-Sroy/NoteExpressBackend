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

// //  if (searchTerm !== "") {
//     query = query.or(
//       `email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
//     );
//   }
export const getAllFormRespones = async (form_id) => {

  const query = supabase.from("form_responses").select("*", { count: "exact" });

  if (form_id) {
    query = query.eq("form_id", form_id);
  }

  const { data, count, error } = await query;

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
