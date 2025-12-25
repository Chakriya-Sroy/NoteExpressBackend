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
