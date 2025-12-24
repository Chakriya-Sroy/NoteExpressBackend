import supabase from "../configs/supabase.js";

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error("Internal Server Error");
  }
  return data;
};

export const findUserPassword = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error("Internal Server Error");
  }
  return data;
};

export const updateUserPassword = async (email, newHashedPassword) => {
  const { data, error } = await supabase
    .from("users")
    .update({ password: newHashedPassword })
    .eq("email", email)
    .select()
    .single();

  if (error) {
    throw new Error("Internal Server Error");
  }
  return data;
};

export const insertUser = async (user) => {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select()
    .single();

  if (error) {
    console.log("Error creating user:", error);
    throw new Error("Internal Server Error");
  }
  return data;
};

export const deactivateUser = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .update({ status: 'inactive' })
    .eq("email", email)
    .select()
    .single();

  if (error) {
    throw new Error("Internal Server Error");
  }
  return data;
};
