export const useResponse = (res,{ code, message, data, meta }) => {
  const response = {
    status: {
      code: code ? code : 200,
      message: message ? message : "success",
      success: determineStatusCode(code),
    },
    meta: meta,
    data: data,
  };

  if (!data) {
    delete res.data;
  }

  if (!meta) {
    delete res.meta;
  }

  const responseStatusCode=code ? code:200;
  return res.status(responseStatusCode).json(response);
};

const determineStatusCode = (code) => {
  if (code) {
    return code == 200 ? true : false;
  }
  return true;
};
