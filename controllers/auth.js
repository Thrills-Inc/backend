import { db } from "../connect.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import { logAudit } from "../utils/auditLogger.js";

// REGISTER
export const register = (
  req,
  res,
  next
) => {

  // CHECK IF USER EXISTS
  const q = `
    SELECT *

    FROM users

    WHERE username = ?
    OR email = ?
  `;

  db.query(
    q,
    [
      req.body.username,
      req.body.email,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Registration failed: ${err.message}`
        );

        return next(err);

      }

      if (data.length) {

        logger.warn(
          `Registration attempt with existing credentials: ${req.body.email}`
        );

        return next(
          new ApiError(
            409,
            "Username or email already exists."
          )
        );

      }

      // HASH PASSWORD
      const salt =
        bcrypt.genSaltSync(10);

      const hashedPassword =
        bcrypt.hashSync(
          req.body.password,
          salt
        );

      // CREATE USER
      const insertQuery = `
        INSERT INTO users
        (\`username\`, \`email\`, \`password\`, \`name\`)
        VALUES (?)
      `;

      const values = [
        req.body.username,
        req.body.email,
        hashedPassword,
        req.body.name,
      ];

      db.query(
        insertQuery,
        [values],

        (err, data) => {

          if (err) {

            logger.error(
              `User creation failed: ${err.message}`
            );

            return next(err);

          }

          logger.info(
            `User registered successfully: ${req.body.email}`
          );

          return res
            .status(201)
            .json(
              "User has been created."
            );

        }
      );

    }
  );

};

// LOGIN
export const login = (
  req,
  res,
  next
) => {

  // LOGIN WITH EMAIL OR USERNAME
  const q = `
    SELECT *

    FROM users

    WHERE email = ?
    OR username = ?
  `;

  db.query(
    q,
    [
      req.body.email,
      req.body.email,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Login failed: ${err.message}`
        );

        return next(err);

      }

      if (data.length === 0) {

        logger.warn(
          `Login attempt failed for ${req.body.email}`
        );

        return next(
          new ApiError(
            404,
            "User not found."
          )
        );

      }

      const user =
        data[0];

      // ACCOUNT LOCK CHECK
if (

  user.lockUntil &&

  new Date(user.lockUntil) >
  new Date()

) {

  logger.warn(
    `Locked account login attempt: ${user.id}`
  );

  return next(
    new ApiError(
      423,
      "Account temporarily locked. Try again later."
    )
  );

}

      // CHECK PASSWORD
      const checkPassword =
        bcrypt.compareSync(
          req.body.password,
          data[0].password
        );

        if (!checkPassword) {

  const attempts =
    user.failedLoginAttempts + 1;

  // LOCK ACCOUNT AFTER 5 FAILURES
  if (attempts >= 5) {

    const lockUntil =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );

    db.query(
      `
      UPDATE users

      SET

        failedLoginAttempts = ?,

        lockUntil = ?

      WHERE id = ?
      `,
      [
        attempts,
        lockUntil,
        user.id,
      ]
    );

    logger.warn(
      `Account locked: ${user.id}`
    );

    return next(
      new ApiError(
        423,
        "Account locked for 15 minutes."
      )
    );

  }

  db.query(
    `
    UPDATE users

    SET failedLoginAttempts = ?

    WHERE id = ?
    `,
    [
      attempts,
      user.id,
    ]
  );

  logger.warn(
    `Failed login attempt ${attempts} for user ${user.id}`
  );

  return next(
    new ApiError(
      400,
      "Wrong password or email."
    )
  );

}

      // if (!checkPassword) {

      //   logger.warn(
      //     `Invalid password attempt for user ${req.body.email}`
      //   );

      //   return next(
      //     new ApiError(
      //       400,
      //       "Wrong password or email."
      //     )
      //   );

      // }

      // ACCESS TOKEN
      const accessToken =
        jwt.sign(
          { id: data[0].id, 
            role: data[0].role,
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "15m",
          }
        );

      // REFRESH TOKEN
      const refreshToken =
        jwt.sign(
          { id: data[0].id },

          process.env.JWT_REFRESH_SECRET,

          {
            expiresIn: "7d",
          }
        );

        db.query(
  `
  INSERT INTO refresh_tokens
  (
    userId,
    token
  )
  VALUES (?, ?)
  `,
  [
    user.id,
    refreshToken,
  ],

  (err) => {

    if (err) {

      logger.error(
        `Failed saving refresh token: ${err.message}`
      );

      return next(err);
    }
  }
);

      const {
        password,
        ...others
      } = data[0];

      logger.info(
        `User logged in: ${data[0].email}`
      );

        logAudit(
  user.id,
  "login",
  "user",
  user.id
);

      return res

        // ACCESS TOKEN
        .cookie(
          "accessToken",
          accessToken,
          {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
          }
        )

        // REFRESH TOKEN
        .cookie(
          "refreshToken",
          refreshToken,
          {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
          }
        )

        .status(200)
        .json(others);

    }
  );

};

// REFRESH TOKEN
export const refreshToken = (
  req,
  res,
  next
) => {

  // const userInfo =
  // req.userInfo;
  const token =
    req.cookies.refreshToken;


    if (!token) {

    logger.warn(
      "Refresh token missing"
    );

    return next(
      new ApiError(
        401,
        "No refresh token."
      )
    );

  }

  db.query(
  `
  SELECT *

  FROM refresh_tokens

  WHERE token = ?
  `,
  [token],

  (err, data) => {

    if (err)
      return next(err);

    if (
      data.length === 0
    ) {

      return next(
        new ApiError(
          403,
          "Refresh token revoked."
        )
      );
    }

    // jwt.verify here

//     if (!token) {

//   logger.warn(
//     "Refresh token missing"
//   );

//   return next(
//     new ApiError(
//       401,
//       "No refresh token."
//     )
//   );

// }

// jwt.verify(
//   token,

//   process.env.JWT_REFRESH_SECRET,

//   (err, userInfo) => {

//     if (err) {

//       logger.error(
//         `Invalid refresh token: ${err.message}`
//       );

//       return next(
//         new ApiError(
//           403,
//           "Invalid refresh token."
//         )
//       );

//     }

//     const newAccessToken =
//       jwt.sign(
//         {
//           id: userInfo.id,
//         },

//         process.env.JWT_SECRET,

//         {
//           expiresIn: "15m",
//         }
//       );

//     logger.info(
//       `Access token refreshed for user ${userInfo.id}`
//     );

//     logAudit(
//       userInfo.id,
//       "token_refresh",
//       "user",
//       userInfo.id
//     );

//     return res

//       .cookie(
//         "accessToken",
//         newAccessToken,
//         {
//           httpOnly: true,
//           secure: false,
//           sameSite: "lax",
//         }
//       )

//       .status(200)

//       .json(
//         "Access token refreshed."
//       );

//   }
// );
// }

//     if (!token) {

//   logger.warn(
//     "Refresh token missing"
//   );

//   return next(
//     new ApiError(
//       401,
//       "No refresh token."
//     )
//   );

// }

// jwt.verify(
//   token,

//   process.env.JWT_REFRESH_SECRET,

//   (err, userInfo) => {

//     if (err) {

//       logger.error(
//         `Invalid refresh token: ${err.message}`
//       );

//       return next(
//         new ApiError(
//           403,
//           "Invalid refresh token."
//         )
//       );

//     }

//     jwt.verify(
//     token,

//     process.env.JWT_REFRESH_SECRET,

//     (err, userInfo) => {

//       if (err) {

//         logger.error(
//           `Invalid refresh token: ${err.message}`
//         );

//         return next(
//           new ApiError(
//             403,
//             "Invalid refresh token."
//           )
//         );

//       }

//   }
// );

  // if (!token) {

  //   logger.warn(
  //     "Refresh token missing"
  //   );

  //   return next(
  //     new ApiError(
  //       401,
  //       "No refresh token."
  //     )
  //   );

  // }

  jwt.verify(
    token,

    process.env.JWT_REFRESH_SECRET,

    (err, userInfo) => {

      if (err) {

        logger.error(
          `Invalid refresh token: ${err.message}`
        );

        return next(
          new ApiError(
            403,
            "Invalid refresh token."
          )
        );

      }

      // NEW ACCESS TOKEN
      const newAccessToken =
        jwt.sign(
          { id: userInfo.id },

          process.env.JWT_SECRET,

          {
            expiresIn: "15m",
          }
        );

      logger.info(
        `Access token refreshed for user ${userInfo.id}`
      );

      logAudit(
  userInfo.id,
  "token_refresh",
  "user",
  userInfo.id
);

//     const refreshToken =
//   req.cookies.refreshToken;

// if (refreshToken) {

//   db.query(
//     `
//     DELETE FROM refresh_tokens

//     WHERE token = ?
//     `,
//     [refreshToken]
//   );

// }

      return res

        .cookie(
          "accessToken",
          newAccessToken,
          {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
          }
        )

        .status(200)
        .json(
          "Access token refreshed."
        );
      
    }
  );
}
  );
};

// LOGOUT
export const logout = (
  req,
  res,
  next
) => {

  logger.info(
    "User logged out"
  );

  const token =
  req.cookies.accessToken;

if (token) {

  try {

    const userInfo =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    logAudit(
      userInfo.id,
      "logout",
      "user",
      userInfo.id
    );

  } catch (err) {

    logger.warn(
      "Logout audit skipped due to invalid token."
    );

  }

}

//   logAudit(
//   user.id,
//   "logout",
//   "user",
//   user.id
// );

      const refreshToken =
  req.cookies.refreshToken;

if (refreshToken) {

  db.query(
    `
    DELETE FROM refresh_tokens

    WHERE token = ?
    `,
    [refreshToken]
  );

}

  return res

    .clearCookie(
      "accessToken",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      }
    )

    .clearCookie(
      "refreshToken",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      }
    )

    .status(200)

    .json(
      "User has been logged out."
    );

};

export const revokeUserTokens =
(
  userId
) => {

  db.query(
    `
    DELETE FROM refresh_tokens

    WHERE userId = ?
    `,
    [userId]
  );

};







// const token =
//   req.cookies.refreshToken;

// if (token) {

//   db.query(
//     `
//     DELETE FROM refresh_tokens

//     WHERE token = ?
//     `,
//     [token]
//   );

// }
































// import { db } from "../connect.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// import logger
// from "../utils/logger.js";

// import ApiError from "../utils/ApiError.js"

// // REGISTER
// export const register = (
//   req,
//   res,
//   next
// ) => {

//   // CHECK IF USER EXISTS
//   const q = `
//     SELECT *
//     FROM users
//     WHERE username = ?
//     OR email = ?
//   `;

//   db.query(
//     q,
//     [
//       req.body.username,
//       req.body.email,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Register DB error: ${err.message}`
//         );

//           return next(err)
//         // return res
//         //   .status(500)
//         //   .json(err);

//       }

//       if (data.length) {

//         logger.warn(
//           `Register attempt with existing credentials: ${req.body.email}`
//         );

//         return next(
//           new ApiError(
//             409,
//             "Username or email already exists."
//           )
//           );

//       }

//       // HASH PASSWORD
//       const salt =
//         bcrypt.genSaltSync(10);

//       const hashedPassword =
//         bcrypt.hashSync(
//           req.body.password,
//           salt
//         );

//       // CREATE USER
//       const insertQuery = `
//         INSERT INTO users
//         (\`username\`, \`email\`, \`password\`, \`name\`)
//         VALUES (?)
//       `;

//       const values = [
//         req.body.username,
//         req.body.email,
//         hashedPassword,
//         req.body.name,
//       ];

//       db.query(
//         insertQuery,
//         [values],

//         (err, data) => {

//           if (err) {

//             logger.error(
//               `User creation failed: ${err.message}`
//             );

//             return next(err);

//           }

//           logger.info(
//             `New user registered: ${req.body.email}`
//           );

//           return res
//             .status(201)
//             .json(
//               "User has been created."
//             );

//         }
//       );

//     }
//   );

// };

// // LOGIN
// export const login = (
//   req,
//   res,
//   next
// ) => {

//   const q = `
//     SELECT *
//     FROM users
//     WHERE email = ?
//     OR username = ?
//   `;

//   db.query(
//     q,
//     [
//       req.body.email,
//       req.body.email,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Login failed: ${err.message}`
//         );

//         return next(err)

//       }

//       if (data.length === 0) {

//         logger.warn(
//           `Login failed - user not found: ${req.body.email}`
//         );

//         return next(
//           new ApiError(
//             404,"User not found!"
//           )

//         );

//       }

//       // CHECK PASSWORD
//       const checkPassword =
//         bcrypt.compareSync(
//           req.body.password,
//           data[0].password
//         );

//       if (!checkPassword) {

//         logger.warn(
//           `Invalid login attempt for user: ${req.body.email}`
//         );

//         return next(
//           new ApiError(
//             404,
//             "Wrong password or email!"
//           )
//           );

//       }

//       // ACCESS TOKEN
//       const accessToken =
//         jwt.sign(
//           { id: data[0].id },
//           process.env.JWT_SECRET,
//           {
//             expiresIn: "15m",
//           }
//         );

//       // REFRESH TOKEN
//       const refreshToken =
//         jwt.sign(
//           { id: data[0].id },
//           process.env.JWT_REFRESH_SECRET,
//           {
//             expiresIn: "7d",
//           }
//         );

//       const {
//         password,
//         ...others
//       } = data[0];

//       logger.info(
//         `User logged in: ${data[0].email}`
//       );

//       return res

//         // ACCESS TOKEN COOKIE
//         .cookie(
//           "accessToken",
//           accessToken,
//           {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//           }
//         )

//         // REFRESH TOKEN COOKIE
//         .cookie(
//           "refreshToken",
//           refreshToken,
//           {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//           }
//         )

//         .status(200)
//         .json(others);

//     }
//   );

// };

// // REFRESH TOKEN
// export const refreshToken = (
//   req,
//   res,
//   next
// ) => {

//   const token =
//     req.cookies.refreshToken;

//   if (!token) {

//     logger.warn(
//       "Refresh token missing"
//     );

//     return next(
//       new ApiError(
//         404,"No refresh token."
//       )
//     );

//   }

//   jwt.verify(
//     token,
//     process.env.JWT_REFRESH_SECRET,

//     (err, userInfo) => {

//       if (err) {

//         logger.error(
//           `Invalid refresh token: ${err.message}`
//         );

//         return next(
//           new ApiError(
//             404,
//             "Invalid refresh token."
//           )
//           );

//       }

//       // GENERATE NEW ACCESS TOKEN
//       const newAccessToken =
//         jwt.sign(
//           { id: userInfo.id },
//           process.env.JWT_SECRET,
//           {
//             expiresIn: "15m",
//           }
//         );

//       logger.info(
//         `Access token refreshed for user ${userInfo.id}`
//       );

//       return res

//         .cookie(
//           "accessToken",
//           newAccessToken,
//           {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//           }
//         )

//         .status(200)
//         .json(
//           "Access token refreshed."
//         );

//     }
//   );

// };

// // LOGOUT
// export const logout = (
//   req,
//   res,
//   next
// ) => {

//   logger.info(
//     "User logged out"
//   );

//   return res

//     .clearCookie(
//       "accessToken",
//       {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//       }
//     )

//     .clearCookie(
//       "refreshToken",
//       {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//       }
//     )

//     .status(200)

//     .json(
//       "User has been logged out."
//     );

// };

// export const logout = (
//   req,
//   res,
//   next
// ) => {

//   logger.info(
//     "User logged out"
//   );

//   return res

//     .clearCookie(
//       "accessToken",
//       {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//       }
//     )

//     .clearCookie(
//       "refreshToken",
//       {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//       }
//     )

//     .status(200)

//     .json(
//       "User has been logged out."
//     );

// };



































// import { db } from "../connect.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // REGISTER
// export const register = (req, res) => {

//   // CHECK IF USER EXISTS
//   const q =
//     "SELECT * FROM users WHERE username = ? OR email = ?";

//   db.query(
//     q,
//     [
//       req.body.username,
//       req.body.email,
//     ],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.length) {

//         return res
//           .status(409)
//           .json(
//             "Username or email already exists."
//           );

//       }

//       // HASH PASSWORD
//       const salt =
//         bcrypt.genSaltSync(10);

//       const hashedPassword =
//         bcrypt.hashSync(
//           req.body.password,
//           salt
//         );

//       // CREATE USER
//       const insertQuery = `
//         INSERT INTO users
//         (\`username\`, \`email\`, \`password\`, \`name\`)
//         VALUES (?)
//       `;

//       const values = [
//         req.body.username,
//         req.body.email,
//         hashedPassword,
//         req.body.name,
//       ];

//       db.query(
//         insertQuery,
//         [values],
//         (err, data) => {

//           if (err)
//             return res.status(500).json(err);

//           return res
//             .status(201)
//             .json(
//               "User has been created."
//             );

//         }
//       );

//     }
//   );

// };

// // LOGIN
// export const login = (req, res) => {

//   // ALLOW LOGIN WITH EMAIL OR USERNAME
//   const q = `
//     SELECT *
//     FROM users
//     WHERE email = ?
//     OR username = ?
//   `;

//   db.query(
//     q,
//     [
//       req.body.email,
//       req.body.email,
//     ],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.length === 0) {

//         return res
//           .status(404)
//           .json("User not found!");

//       }

//       // CHECK PASSWORD
//       const checkPassword =
//         bcrypt.compareSync(
//           req.body.password,
//           data[0].password
//         );

//       if (!checkPassword) {

//         return res
//           .status(400)
//           .json(
//             "Wrong password or email!"
//           );

//       }

//       // ACCESS TOKEN
//       const accessToken =
//         jwt.sign(
//           { id: data[0].id },
//           process.env.JWT_SECRET,
//           {
//             expiresIn: "15m",
//           }
//         );

//       // REFRESH TOKEN
//       const refreshToken =
//         jwt.sign(
//           { id: data[0].id },
//           process.env.JWT_REFRESH_SECRET,
//           {
//             expiresIn: "7d",
//           }
//         );

//       const {
//         password,
//         ...others
//       } = data[0];

//       return res

//         // ACCESS TOKEN COOKIE
//         .cookie(
//           "accessToken",
//           accessToken,
//           {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//           }
//         )

//         // REFRESH TOKEN COOKIE
//         .cookie(
//           "refreshToken",
//           refreshToken,
//           {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//           }
//         )

//         .status(200)
//         .json(others);

//     }
//   );

// };

// // REFRESH TOKEN
// export const refreshToken = (
//   req,
//   res
// ) => {

//   const token =
//     req.cookies.refreshToken;

//   if (!token) {

//     return res
//       .status(401)
//       .json("No refresh token.");

//   }

//   jwt.verify(
//     token,
//     process.env.JWT_REFRESH_SECRET,

//     (err, userInfo) => {

//       if (err) {

//         return res
//           .status(403)
//           .json(
//             "Invalid refresh token."
//           );

//       }

//       // GENERATE NEW ACCESS TOKEN
//       const newAccessToken =
//         jwt.sign(
//           { id: userInfo.id },
//           process.env.JWT_SECRET,
//           {
//             expiresIn: "15m",
//           }
//         );

//       return res

//         .cookie(
//           "accessToken",
//           newAccessToken,
//           {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//           }
//         )

//         .status(200)
//         .json(
//           "Access token refreshed."
//         );

//     }
//   );

// };

// // LOGOUT
// export const logout = (req, res) => {

//   return res

//     .clearCookie(
//       "accessToken",
//       {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//       }
//     )

//     .clearCookie(
//       "refreshToken",
//       {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//       }
//     )

//     .status(200)

//     .json(
//       "User has been logged out."
//     );

// };










































// import { db } from "../connect.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const register = (req, res) => {
//   //CHECK USER IF EXISTS

//   const q = "SELECT * FROM users WHERE username = ?";

//   db.query(q, [req.body.username], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length) return res.status(409).json("User already exists!");
//     //CREATE A NEW USER
//     //Hash the password
//     const salt = bcrypt.genSaltSync(10);
//     const hashedPassword = bcrypt.hashSync(req.body.password, salt);

//     const q =
//       "INSERT INTO users (`username`,`email`,`password`,`name`) VALUE (?)";

//     const values = [
//       req.body.username,
//       req.body.email,
//       hashedPassword,
//       req.body.name,
//     ];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json("User has been created.");
//     });
//   });
// };

// export const login = (req,res)=>{

//     const q = "SELECT * FROM users WHERE email = ?";

//     db.query(q, [req.body.email], (err, data) => {
//         if (err) return res.status(500).json(err);
//         if (data.length === 0) return res.status(404).json("User not found!");

//         const checkPassword = bcrypt.compareSync(
//             req.body.password,
//             data[0].password
//         );

//         if (!checkPassword) 
//           return res.status(400).json("Wrong password or email!");

//     const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET);

//     const { password, ...others } = data[0];

//     res
//       .cookie("accessToken", token, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//       })
//       .status(200)
//       .json(others);
//     });

// };

// export const logout = (req,res)=>{
    
//   res.clearCookie("accessToken",{
//     secure:true,
//     sameSite:"none"
//   }).status(200).json("User has been logged out.")
// };






































































































// import { db } from "../connect.js"
// import bcrypt from "bcryptjs";


// export const register = (req,res)=>{

//     // CHECK USER IF EXISTS

//     const q = "SELECT * FROM users WHERE username = ?";

//     db.query(q,[req.body.username], (err,data)=>{
//         if(err) return res.status(500).json(err)
//         if(data.length) return res.status(409).json("User already exists!")
//         //CREATE A NEW USER
//           //Hash the password 
//           const salt = bcrypt.genSaltSync(10);
//           const hashedPassword = bcrypt.hashSync(req.body.password, salt)

//           const q = "INSERT INTO users(`username`,`email`,`password`,`name`) VALUE (?)"

//           const values = [req.body.username,req.body.email,hashedPassword, req.body.name]

//           db.query(q,[values], (err,data)=>{
//             if(err) return res.status(500).json(err)
//             return res.status(200).json("User has been created.");
//           });
//     });

    
// };


// export const login = (req,res)=>{
    
// }
// export const logout = (req,res)=>{
    
// }