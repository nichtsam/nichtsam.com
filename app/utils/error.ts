const ERROR_FALL_BACK_MESSAGE = "Unknown Error";
const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  console.error("Unable to get error message for error", error);
  return ERROR_FALL_BACK_MESSAGE;
};

export { ERROR_FALL_BACK_MESSAGE, getErrorMessage };
