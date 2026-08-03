import ApiError
from "../utils/ApiError.js";

export const authorize =
(...roles) =>
(req, res, next) => {

  if (
    !roles.includes(
      req.userInfo.role
    )
  ) {

    return next(
      new ApiError(
        403,
        "Access denied."
      )
    );

  }

  next();

};