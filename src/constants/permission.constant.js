

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

export const FORM={
  VIEW:"form:view",
  CREATE:"form:create",
  UPDATE:"form:update",
  DELETE:"form:delete",
}

export const PERMISSIONS = [
  ...Object.values(USER),
  ...Object.values(ACTIVITYLOG),
  ...Object.values(FORM)
]