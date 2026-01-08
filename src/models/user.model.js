import supabase from "../configs/supabase.js";

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data;
};

export const findUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data;
};

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
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
    return null;
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
    console.log("Error creating user:", error);
    throw new Error("Internal Server Error");
  }
  return data;
};

export const insertUser = async (user) => {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select("id,username,email,role_id,status,created_at,updated_at")
    .single();

  if (error) {
    console.log("Error creating user:", error);
    throw new Error("Internal Server Error");
  }
  return data;
};

export const updateUser = async (user) => {
  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("id", user?.id)
    .select("id,username,email,role_id,status,created_at,updated_at")
    .single();

  if (error) {
    console.log("Error creating user:", error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
  return data;
};

export const deactivateUser = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .update({ status: "inactive" })
    .eq("email", email)
    .select()
    .single();

  if (error) {
    throw new Error("Internal Server Error");
  }
  return data;
};

export const activateUser = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .update({ status: "active" })
    .eq("email", email)
    .select()
    .single();

  if (error) {
    throw new Error("Internal Server Error");
  }
  return data;
};

export const resetUserPassword = async (id, newHashedPassword) => {
  const { data, error } = await supabase
    .from("users")
    .update({ password: newHashedPassword })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Internal Server Error");
  }
  return data;
};

export const getAllUsers = async (routeQuery) => {
  const pageNumber = Number(routeQuery?.page) || 1;
  const pageSize = Number(routeQuery?.limit) || 10;
  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize - 1;

  const allStatus = ["active", "inactive"];

  const searchTerm =
    routeQuery?.search && String(routeQuery.search).trim() !== ""
      ? String(routeQuery.search).trim()
      : "";
  const status = routeQuery?.status && String(routeQuery.status).trim() !== "";

  let query = supabase
    .from("users")
    .select("id, username, email, role_id,roles(role_name), status", {
      count: "exact",
    })
    .order("updated_at", { ascending: false });

  if (searchTerm !== "") {
    query = query.or(
      `email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
    );
  }

  if (status && allStatus.includes(routeQuery?.status)) {
    query = query.eq("status", routeQuery?.status);
  }

  query = query.range(start, end);

  const { data, count, error } = await query;

  const meta = {
    currentPage: pageNumber,
    perPage: pageSize,
    total: count || 0,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };

  if (error) {
    console.log("error", error);
    return { data: [], meta };
  }

  return { data: data || [], meta };
};

export const getUserStatusById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data;
};

export const checkDuplicateEmail = async ({ user_id, email }) => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("email", email)
    .neq("id", user_id)
    .maybeSingle();

  if (error) {
    console.error("Error checking email:", error);
    throw error;
  }
  return data;
};

export const checkDuplicateUsername = async ({ user_id, username }) => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("username", username)
    .neq("id", user_id)
    .maybeSingle();

  if (error) {
    console.error("Error checking username:", error);
    throw error;
  }
  return data;
};
