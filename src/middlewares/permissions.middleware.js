import { useResponse } from "../utils/response.js";

export const AdminPermissionsMiddleware = (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role_id === 1) {
      return next();
    } else {
      console.log(user);
      return useResponse(res, { code: 403, message: "Forbidden" });
    }
  } catch (err) {
    console.error("Permissions check failed:", err);
    return useResponse(res, { code: 403, message: "Forbidden" });
  }
};

export const AdminAndEditorPermissionsMiddleware = (req, res, next) => {
  try {
    const user = req.user;
    if (user && (user.role_id === 1 || user.role_id === 2)) {
      return next();
    } else {
      return useResponse(res, { code: 403, message: "Forbidden" });
    }
  } catch (err) {
    console.error("Permissions check failed:", err);
    return useResponse(res, { code: 403, message: "Forbidden" });
  }
};
