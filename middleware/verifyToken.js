import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("Not logged in!");
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, userInfo) => {

      if (err) {
      return next(
        new ApiError(
          403,
          "Token is not valid."
        )
      );
    }
      
      // if (err) {
      //   return res.status(403).json("Token is not valid!");
      // }

      req.userInfo = userInfo;

      next();
    }
  );
};