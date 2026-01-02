import supabase from "../configs/supabase.js";

export const RecordActivityLog = async ({
  module,
  action,
  userId,
  metadata,
}) => {
  const data = {
    user_id: userId,
    action: action,
    module: module,
  };

  if (metadata) {
    data.metadata = metadata;
  }

  const { error } = await supabase.from("activity_logs").insert(data);

  if (error) {
    throw new Error("Fail Insert Activity Log Data");
  }
  return true;
};

export const getActivityLog = async (routeQuery) => {
  const pageNumber = Number(routeQuery?.page) || 1;
  const pageSize = Number(routeQuery?.limit) || 10;
  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase.from("activity_logs").select("*", { count: "exact" });

  query = query.range(start, end);

  const { data, count,error } = await query;

  const meta = {
    currentPage: pageNumber,
    perPage: pageSize,
    total: count || 0,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
  if (error) {
    console.log("error");
    throw error;
  }
  console.log("data", {});
  return {data,meta};
};
