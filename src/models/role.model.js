import supabase from "../configs/supabase.js";

export const getAllRoles = async () => {
  const { data, error } = await supabase.from("roles").select("*");
  if (error) {
    throw error;
  }
  return data;
};
