import supabase from "../configs/supabase.js";

export const CreateFolder = async (name, user_id) => {
  const { data, error } = await supabase
    .from("folders")
    .insert([{ name, user_id, created_at: new Date(), updated_at: new Date() }])
    .select()
    .single();

  if (error) {
    throw new Error("Error creating folder");
  }
  return data ?? null;
};

export const GetFoldersByUserId = async (user_id) => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error fetching folders");
  }

  return data ?? [];
};

export const FindFolderById = async (id, user_id) => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
    throw new Error("Error fetching folder");
  }
  console.log("data", data);

  return data ?? null;
};

export const UpdateFolder = async (id, name) => {
  const { data, error } = await supabase
    .from("folders")
    .update({ updated_at: new Date(), name: name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Error updatefolder");
  }

  return data ?? null;
};

export const DeleteFolder = async (id, user_id) => {
  const { error } = await supabase.from("folders").delete().eq("id", id).eq("user_id", user_id);

  if (error) {
    throw new Error("Error deletefolder");
  }
};
