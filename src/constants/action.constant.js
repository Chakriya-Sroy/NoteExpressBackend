export const ActivityLogAction = {
  AUTH_LOGIN: "auth.login",
  AUTH_SIGNUP: "auth.signup",
  PROFILE_RESET_PASSWORD: "profile.change-password",
  USER_ACTIVATED: "user.activated",
  USER_DEACTIVATED: "user.deactivated",
  USER_RESET_PASSWORD:"user.reset-password",
  USER_CREATE:"user.create",
  USER_UPDATE:"user.update"
};


export const ActivityLogModule={
    AUTH:'AUTHENTICATION',
    USER:'USER_MANAGEMENT',
    PROFILE:'PROFILE_MANAGEMENT'
}