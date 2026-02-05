import supabase from "../configs/supabase.js";

export const CreateNote = async (payload, user_id) => {
  console.log("payload", payload);
  const { data, error } = await supabase
    .from("notes")
    .insert([
      {
        pinned: false,
        ...payload,
        user_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.log("errror", error);
    throw new Error("Error creating note");
  }
  return data ?? null;
};

export const GetNotesByUserId = async (user_id,routeQuery) => {
  let query = supabase
    .from("notes")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (routeQuery?.pinned) {
    query = query.eq("pinned", true);
  }

  if (routeQuery?.search) {
    query = query.like("title", `%${routeQuery?.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Error fetching note");
  }

  return data ?? [];
};

export const FindNoteById = async (id, user_id) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
    throw new Error("Error fetching note");
  }

  return data ?? null;
};

export const FindNoteByFolderId = async (folder_id, user_id) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("folder_id", folder_id)
    .eq("user_id", user_id);

  if (error) {
    throw new Error("Error fetching notes by folder id");
  }

  return data ?? [];
};

export const UpdateNote = async (id,user_id,payload) => {
    const updateData = {};
  
  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.content !== undefined) updateData.content = payload.content;
  if (payload.pinned !== undefined) updateData.pinned = payload.pinned;
  
  updateData.updated_at = new Date().toISOString();

  // Don't fetch the updated row - just update it
  const { error } = await supabase
    .from("notes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) {
    throw new Error("Error updating note");
  }

  // Return the updated data without querying again
  return { id, user_id, ...payload, ...updateData };
};

export const DeleteNote = async (id, user_id) => {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) {
    throw new Error("Error delete Note");
  }
};
