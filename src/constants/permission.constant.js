

export const USER = {
  VIEW: "user:view",
  CREATE: "user:create",
  UPDATE: "user:update",
  DELETE: "user:delete",
  ACTIVATE: "user:activate",
  DEACTIVATE: "user:deactivate",
  PASSWORD: "user:reset_password",
};

export const ACTIVITYLOG={
    VIEW:"activity_log:view"
}

export const PERMISSIONS = [
  ...Object.values(USER),
  ...Object.values(ACTIVITYLOG)
]