import ApiError
from "../utils/ApiError.js";

export const verifyAdmin = (
  req,
  res,
  next
) => {

  if (!req.userInfo?.isAdmin) {

    return next(
      new ApiError(
        403,
        "Admin access required."
      )
    );

  }

  next();

};