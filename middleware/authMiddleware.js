import jwt from "jsonwebtoken";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

export const verifyToken = (
  req,
  res,
  next
) => {

  const token =
  req.cookies?.accessToken ||
  req.headers?.authorization?.replace("Bearer ", "");
  // const token =
  //   req.cookies.accessToken ||
  //   req.headers.authorization?.split(" ")[1];

  if (!token) {

    logger.warn(
      "Unauthorized access attempt"
    );

    return next(
      new ApiError(
        401,
        "Not authenticated."
      )
    );

  }

  jwt.verify(
    token,
    process.env.JWT_SECRET ||
    "testsecret",

    (err, userInfo) => {

      if (err) {

        logger.warn(
          "Invalid token used"
        );

        return next(
          new ApiError(
            403,
            "Token is not valid."
          )
        );

      }

      req.userInfo =
        userInfo;

      next();

    }
  );

};

































// import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {

//   const token = req.cookies.accessToken;

//   if (!token)
//     return res.status(401).json("Not logged in!");

//   jwt.verify(token, "secretkey", (err, userInfo) => {

//     if (err)
//       return res.status(403).json("Token is not valid!");

//     req.user = userInfo;

//     next();

//   });

// };




































// import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {
//   const token = req.cookies.accessToken;

//   if (!token) {
//     return res.status(401).json("Not logged in!");
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) {
//       return res.status(403).json("Token is not valid!");
//     }

//     req.user = userInfo;

//     next();
//   });
// };