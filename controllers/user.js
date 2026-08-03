import { db } from "../connect.js";

import {
  onlineUsers,
} from "../utils/onlineUsers.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// import redisClient
// from "../config/redis.js";

// GET USER
export const getUser = (
  req,
  res,
  next
) => {

  const userId =
    req.params.userId;

  const currentUser =
    req.userInfo.id;

  const q = `
    SELECT *

    FROM users

    WHERE id = ?

    AND NOT EXISTS (

      SELECT 1

      FROM blocked_users b

      WHERE

      (
        b.blockerId = ?
        AND b.blockedId = users.id
      )

      OR

      (
        b.blockedId = ?
        AND b.blockerId = users.id
      )

    )
  `;

  db.query(
    q,
    [
      
      userId,
      currentUser,
      currentUser,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch user ${userId}: ${err.message}`
        );

        return next(err);

      }

      if (data.length === 0) {

        logger.warn(
          `User ${userId} not found`
        );

        return next(
          new ApiError(
            404,
            "User not found."
          )
        );

      }

      const {
        password,
        ...info
      } = data[0];

      logger.info(
        `User ${userId} fetched successfully`
      );

      return res
        .status(200)
        .json(info);


//       const cacheKey =
//   `user:${userId}`;

// const cachedUser =
//   await redisClient.get(
//     cacheKey
//   );

// if (cachedUser) {

//   logger.info(
//     `User ${userId} served from cache`
//   );

//   return res
//     .status(200)
//     .json(
//       JSON.parse(
//         cachedUser
//       )
//     );

// }

    }
  );

};

// UPDATE USER
export const updateUser = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    UPDATE users

    SET
      \`name\` = ?,
      \`city\` = ?,
      \`website\` = ?,
      \`profilePic\` = ?,
      \`coverPic\` = ?

    WHERE id = ?
  `;

  db.query(
    q,
    [
      req.body.name,
      req.body.city,
      req.body.website,
      req.body.profilePic,
      req.body.coverPic,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to update user ${userInfo.id}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        logger.warn(
          `Unauthorized update attempt by user ${userInfo.id}`
        );

        return next(
          new ApiError(
            403,
            "You can update only your profile."
          )
        );

      }

      logger.info(
        `User ${userInfo.id} updated profile successfully`
      );

      logActivity(
  userInfo.id,
  "update_profile",
  userInfo.id
);

logger.info(
  `User ${userInfo.id} updated profile`
);

      return res
        .status(200)
        .json("Updated!");

    }
  );

};

// GET SUGGESTED USERS
export const getSuggestedUsers = (
  req,
  res,
  next
) => {

  const userId =
    req.params.userId;

  const currentUser =
    req.userInfo.id;

  const q = `
    SELECT DISTINCT
      u.id,
      u.name,
      u.profilePic

    FROM users u

    JOIN interests i1
    ON u.id = i1.userId

    JOIN interests i2
    ON i1.category = i2.category

    WHERE i2.userId = ?
    AND u.id != ?

    AND NOT EXISTS (

        SELECT 1

        FROM blocked_users b

        WHERE

        (
          b.blockerId = ?
          AND b.blockedId = u.id
        )

        OR

        (
          b.blockedId = ?
          AND b.blockerId = u.id
        )

      )

    LIMIT 10
  `;

  db.query(
    q,
    [
      currentUser,
      currentUser,

      currentUser,
      currentUser,

      currentUser,
      currentUser,

      // userId,
      // userId,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch suggested users for user ${userId}: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Suggested users fetched for user ${userId}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// SEARCH USERS
export const searchUsers = (
  req,
  res,
  next
) => {

  const search =
    req.query.q;

  const currentUser =
    req.userInfo.id;

  if (!search) {

    logger.warn(
      "User search attempted without query"
    );

    return next(
      new ApiError(
        400,
        "Search query is required."
      )
    );

  }

  const q = `
    SELECT
      id,
      name,
      username,
      profilePic

    FROM users u

    WHERE
    (
      username LIKE ?
      OR name LIKE ?
    )

      AND NOT EXISTS (

      SELECT 1

      FROM blocked_users b

      WHERE

      (
        b.blockerId = ?
        AND b.blockedId = u.id
      )

      OR

      (
        b.blockedId = ?
        AND b.blockerId = u.id
      )

    )

    LIMIT 20
  `;

  const values = [

    `%${search}%`,
    `%${search}%`,

    currentUser,
    currentUser,
  ];

  db.query(
    q,
    values,

    (err, data) => {

      if (err) {

        logger.error(
          `User search failed for query "${search}": ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `User search completed for query "${search}"`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// GET USER STATUS
export const getUserStatus = (
  req,
  res,
  next
) => {

  const userId =
    req.params.userId;

  const q = `
    SELECT
      id,
      lastSeen

    FROM users

    WHERE id = ?
  `;

  db.query(
    q,
    [userId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch status for user ${userId}: ${err.message}`
        );

        return next(err);

      }

      if (data.length === 0) {

        logger.warn(
          `Status requested for non-existing user ${userId}`
        );

        return next(
          new ApiError(
            404,
            "User not found."
          )
        );

      }

      const isOnline =
        onlineUsers.has(
          userId
        );

      // logger.info(
      //   `User status fetched for user ${userId}`
      // );

      logger.info(
  `Status requested for user ${req.params.userId}`
);

      return res
        .status(200)
        .json({
          isOnline,
          lastSeen:
            data[0].lastSeen,
        });

    }
  );

};












































// import { db } from "../connect.js";

// import {
//   onlineUsers,
// } from "../utils/onlineUsers.js";

// import logger
// from "../utils/logger.js";

// import ApiError from "../utils/ApiError.js"

// // GET USER
// export const getUser = (
//   req,
//   res,
//   next
// ) => {

//   const userId =
//     req.params.userId;

//   const q = `
//     SELECT *
//     FROM users
//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [userId],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch user ${userId}: ${err.message}`
//         );

//         return next(err);

//       }

//       if (data.length === 0) {

//         logger.warn(
//           `User ${userId} not found`
//         );

//         return next(
//           new ApiError(
//             404,
//             "User not found."
//           )

        
//         );

//       }

//       const {
//         password,
//         ...info
//       } = data[0];

//       logger.info(
//         `User ${userId} fetched successfully`
//       );

//       return res
//        .status(200)
//        .json(info);

//     }
//   );

// };

// // UPDATE USER
// export const updateUser = (
//   req,
//   res,
//   next
// ) => {

//   const userInfo =
//     req.userInfo;

//   const q = `
//     UPDATE users

//     SET
//       \`name\` = ?,
//       \`city\` = ?,
//       \`website\` = ?,
//       \`profilePic\` = ?,
//       \`coverPic\` = ?

//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [
//       req.body.name,
//       req.body.city,
//       req.body.website,
//       req.body.profilePic,
//       req.body.coverPic,
//       userInfo.id,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to update user ${userInfo.id}: ${err.message}`
//         );

//         return next(err);

//       }

//       if (
//         data.affectedRows === 0
//       ) {

//         logger.warn(
//           `Unauthorized update attempt by user ${userInfo.id}`
//         );

//         return next(
//           new ApiError(
//             403,
//             "You can update only your profile."
//           )
//         );

//       }

//       logger.info(
//         `User ${userInfo.id} updated profile successfully`
//       );

//       return res
//         .status(200)
//         .json("Updated!");

//     }
//   );

// };


// // export const updateUser = (
// //   req,
// //   res,
// //   next
// // ) => {

// //   const userInfo =
// //     req.userInfo;

// //   const q = `
// //     UPDATE users

// //     SET
// //       \`name\` = ?,
// //       \`city\` = ?,
// //       \`website\` = ?,
// //       \`profilePic\` = ?,
// //       \`coverPic\` = ?

// //     WHERE id = ?
// //   `;

// //   db.query(
// //     q,
// //     [
// //       req.body.name,
// //       req.body.city,
// //       req.body.website,
// //       req.body.profilePic,
// //       req.body.coverPic,
// //       userInfo.id,
// //     ],

// //     (err, data) => {

// //       if (err) {

// //         logger.error(
// //           `Failed to update user ${userInfo.id}: ${err.message}`
// //         );

// //         return next(err);

// //       }

// //       if (
// //         data.affectedRows === 0
// //       ) {

// //         logger.info(
// //           `User ${userInfo.id} updated profile`
// //         );

// //         return res.json(
// //           "Updated!"
// //         );

// //       }

// //       logger.warn(
// //         `Unauthorized update attempt by user ${userInfo.id}`
// //       );

// //       return res
// //         .status(403)
// //         .json(
// //           "You can update only your profile!"
// //         );

// //     }
// //   );

// // };

// // GET SUGGESTED USERS
// export const getSuggestedUsers = (
//   req,
//   res,
//   next
// ) => {

//   const userId =
//     req.params.userId;

//   const q = `
//     SELECT DISTINCT
//       u.id,
//       u.name,
//       u.profilePic

//     FROM users u

//     JOIN interests i1
//     ON u.id = i1.userId

//     JOIN interests i2
//     ON i1.category = i2.category

//     WHERE i2.userId = ?
//     AND u.id != ?

//     LIMIT 10
//   `;

//   db.query(
//     q,
//     [
//       userId,
//       userId,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch suggested users for user ${userId}: ${err.message}`
//         );

//         return next(err);

//       }

//       logger.info(
//         `Suggested users fetched for user ${userId}`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };

// // SEARCH USERS
// export const searchUsers = (
//   req,
//   res,
//   next
// ) => {

//   const search =
//     req.query.q;

//   if (!search) {

//     logger.warn(
//       "Search attempted without query"
//     );

//     return next(
//       new ApiError(
//         400,
//         "Search query is required."
//       )
//       );

//   }

//   const q = `
//     SELECT
//       id,
//       name,
//       username,
//       profilePic

//     FROM users

//     WHERE
//       username LIKE ?
//       OR name LIKE ?

//     LIMIT 20
//   `;

//   const values = [
//     `%${search}%`,
//     `%${search}%`,
//   ];

//   db.query(
//     q,
//     values,

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `User search failed for query "${search}": ${err.message}`
//         );

//         return next(err);

//       }

//       logger.info(
//         `User search completed for query "${search}"`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };

// // GET USER STATUS
// export const getUserStatus = (
//   req,
//   res,
//   next
// ) => {

//   const userId =
//     req.params.userId;

//   const q = `
//     SELECT
//       id,
//       lastSeen

//     FROM users

//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [userId],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch status for user ${userId}: ${err.message}`
//         );

//         return next(err);

//       }

//       if (
//         data.length === 0
//       ) {

//         logger.warn(
//           `Status request for non-existing user ${userId}`
//         );

//         return next(
//       new ApiError(
//         400,
//             "User not found."
//            )
//           );

//       }

//       const isOnline =
//         onlineUsers.has(
//           userId
//         );

//       logger.info(
//         `User Status fetched for user ${userId}`
//       );

//       return res
//         .status(200)
//         .json({
//           isOnline,
//           lastSeen:
//             data[0].lastSeen,
//         });

//     }
//   );

// };



























































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";
// import {
//   onlineUsers,
// } from "../utils/onlineUsers.js";




// export const getUser = (req,res)=>{
//     const userId = req.params.userId;
//     const q = "SELECT * FROM users WHERE id=?";
  
//     db.query(q, [userId], (err, data) => {
//       if (err) return res.status(500).json(err);
//       const { password, ...info } = data[0];
//       return res.json(info);
//     });
// };


// export const updateUser = (req, res) => {
//     const token = req.cookies.accessToken;
//     if (!token) return res.status(401).json("Not authenticated!");
  
//     jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//       if (err) return res.status(403).json("Token is not valid!");
  
//       const q =
//         "UPDATE users SET `name`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=? WHERE id=? ";
  
//       db.query(
//         q,
//         [
//           req.body.name,
//           req.body.city,
//           req.body.website,
//           req.body.coverPic,
//           req.body.profilePic,
//           userInfo.id,
//         ],
//         (err, data) => {
//           if (err) res.status(500).json(err);
//           if (data.affectedRows > 0) return res.json("Updated!");
//           return res.status(403).json("You can update only your post!");
//         }
//       );
//     });
//   };


//   export const getSuggestedUsers = (req, res) => {

//   const q = `
//     SELECT DISTINCT
//       u.id,
//       u.name,
//       u.profilePic
//     FROM users u
//     JOIN interests i1 ON u.id = i1.userId
//     JOIN interests i2 ON i1.category = i2.category
//     WHERE i2.userId = ?
//     AND u.id != ?
//     LIMIT 10
//   `;

//   const userId = req.params.userId;

//   db.query(q, [userId, userId], (err, data) => {
//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };

// export const searchUsers = (req, res) => {

//   const search = req.query.q;

//   if (!search) {
//     return res.status(400).json("Search query is required");
//   }

//   const q = `
//     SELECT id, name, username, profilePic
//     FROM users
//     WHERE username LIKE ?
//        OR name LIKE ?
//     LIMIT 20
//   `;

//   const values = [`%${search}%`, `%${search}%`];

//   db.query(q, values, (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };

// export const getUserStatus = (
//   req,
//   res
// ) => {

//   const q = `
//     SELECT
//       id,
//       lastSeen
//     FROM users
//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [req.params.userId],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.length === 0) {

//         return res
//           .status(404)
//           .json("User not found.");

//       }

//       return res.status(200).json({
//         isOnline:
//           onlineUsers.has(
//             req.params.userId
//           ),

//         lastSeen:
//           data[0].lastSeen,
//       });

//     }
//   );

// };