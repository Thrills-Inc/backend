import { db } from "../connect.js";

// import { io } from "../index.js";

import {
  getIO,
} from "../sockets/socketInstance.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// GET LIKES
export const getLikes = (
  req,
  res,
  next
) => {

  const postId =
    req.query.postId;

  const q = `
    SELECT userId

    FROM likes

    WHERE postId = ?
  `;

  db.query(
    q,
    [postId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch likes for post ${postId}: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Likes fetched for post ${postId}`
      );

      return res
        .status(200)
        .json(
          data.map(
            (like) =>
              like.userId
          )
        );

    }
  );

};

// ADD LIKE
export const addLike = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const postId =
    req.body.postId;

  const receiverId =
    req.body.userId;

  // PREVENT DUPLICATE LIKES
  const checkQuery = `
    SELECT *

    FROM likes

    WHERE userId = ?
    AND postId = ?
  `;

  db.query(
    checkQuery,
    [
      userInfo.id,
      postId,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to check like: ${err.message}`
        );

        return next(err);

      }

      if (data.length > 0) {

        logger.warn(
          `User ${userInfo.id} already liked post ${postId}`
        );

        return next(
          new ApiError(
            400,
            "Post already liked."
          )
        );

      }

      const q = `
        INSERT INTO likes
        (\`userId\`, \`postId\`)
        VALUES (?)
      `;

      const values = [
        userInfo.id,
        postId,
      ];

      db.query(
        q,
        [values],

        (err, data) => {

          if (err) {

            logger.error(
              `Failed to like post ${postId}: ${err.message}`
            );

            return next(err);

          }

          // LOG ACTIVITY
          logActivity(
            userInfo.id,
            "like",
            postId
          );

          logger.info(
            `User ${userInfo.id} liked post ${postId}`
          );

          // DON'T NOTIFY SELF
          if (
            receiverId &&
            receiverId !==
              userInfo.id
          ) {

            const notificationQuery = `
              INSERT INTO notifications
              (\`senderId\`, \`receiverId\`, \`type\`, \`postId\`)
              VALUES (?)
            `;

            const notificationValues = [
              userInfo.id,
              receiverId,
              "like",
              postId,
            ];

            db.query(
              notificationQuery,
              [notificationValues],

              (err) => {

                if (err) {

                  logger.error(
                    `Failed to save like notification: ${err.message}`
                  );

                  return;

                }

                logger.info(
                  `Like notification saved for user ${receiverId}`
                );

              }
            );

            // REALTIME SOCKET
            const io = getIO();

            io.to(
              receiverId.toString()
            ).emit(
              "getNotification",
              {
                senderId:
                  userInfo.id,

                type:
                  "like",

                postId,
              }
            );

            logger.info(
              `Realtime like notification emitted to user ${receiverId}`
            );

          }

          return res
            .status(200)
            .json(
              "Post has been liked."
            );

        }
      );

    }
  );

};

// DELETE LIKE
export const deleteLike = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const postId =
    req.query.postId;

  const q = `
    DELETE FROM likes

    WHERE userId = ?
    AND postId = ?
  `;

  db.query(
    q,
    [
      userInfo.id,
      postId,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to remove like from post ${postId}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        logger.warn(
          `User ${userInfo.id} attempted to unlike a post not liked`
        );

        return next(
          new ApiError(
            404,
            "Like not found."
          )
        );

      }

      logger.info(
        `User ${userInfo.id} removed like from post ${postId}`
      );

      return res
        .status(200)
        .json(
          "Post has been disliked."
        );

    }
  );

};












































// import { db } from "../connect.js";

// import { io } from "../index.js";

// import logger
// from "../utils/logger.js";

// // GET LIKES
// export const getLikes = (
//   req,
//   res
// ) => {

//   const postId =
//     req.query.postId;

//   const q = `
//     SELECT userId
//     FROM likes
//     WHERE postId = ?
//   `;

//   db.query(
//     q,
//     [postId],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch likes for post ${postId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Likes fetched for post ${postId}`
//       );

//       return res
//         .status(200)
//         .json(
//           data.map(
//             (like) =>
//               like.userId
//           )
//         );

//     }
//   );

// };

// // ADD LIKE
// export const addLike = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const q = `
//     INSERT INTO likes
//     (\`userId\`, \`postId\`)
//     VALUES (?)
//   `;

//   const values = [
//     userInfo.id,
//     req.body.postId,
//   ];

//   db.query(
//     q,
//     [values],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to like post ${req.body.postId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `User ${userInfo.id} liked post ${req.body.postId}`
//       );

//       // AVOID SELF NOTIFICATIONS
//       if (
//         userInfo.id !==
//         req.body.userId
//       ) {

//         // SAVE NOTIFICATION
//         const notificationQuery = `
//           INSERT INTO notifications
//           (\`senderId\`, \`receiverId\`, \`type\`)
//           VALUES (?)
//         `;

//         const notificationValues = [
//           userInfo.id,
//           req.body.userId,
//           "like",
//         ];

//         db.query(
//           notificationQuery,
//           [notificationValues],

//           (err) => {

//             if (err) {

//               logger.error(
//                 `Failed to save like notification: ${err.message}`
//               );

//               return;

//             }

//             logger.info(
//               `Like notification sent to user ${req.body.userId}`
//             );

//           }
//         );

//         // REALTIME SOCKET NOTIFICATION
//         io.to(
//           req.body.userId.toString()
//         ).emit(
//           "getNotification",
//           {
//             senderId:
//               userInfo.id,

//             type:
//               "like",
//           }
//         );

//       }

//       return res
//         .status(200)
//         .json(
//           "Post has been liked."
//         );

//     }
//   );

// };

// // DELETE LIKE
// export const deleteLike = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const postId =
//     req.query.postId;

//   const q = `
//     DELETE FROM likes
//     WHERE \`userId\` = ?
//     AND \`postId\` = ?
//   `;

//   db.query(
//     q,
//     [
//       userInfo.id,
//       postId,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to remove like from post ${postId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `User ${userInfo.id} removed like from post ${postId}`
//       );

//       return res
//         .status(200)
//         .json(
//           "Post has been disliked."
//         );

//     }
//   );

// };










































// import { db } from "../connect.js";
// import { io } from "../index.js";

// export const getLikes = (req, res) => {

//   const q = "SELECT userId FROM likes WHERE postId = ?";

//   db.query(q, [req.query.postId], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res
//       .status(200)
//       .json(data.map((like) => like.userId));

//   });
// };

// export const addLike = (req, res) => {

//   const userInfo = req.userInfo;

//   const q =
//     "INSERT INTO likes (`userId`,`postId`) VALUES (?)";

//   const values = [
//     userInfo.id,
//     req.body.postId,
//   ];

//   db.query(q, [values], (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     // SAVE NOTIFICATION TO DATABASE
//     const notificationQuery =
//       "INSERT INTO notifications (`senderId`, `receiverId`, `type`) VALUES (?)";

//     const notificationValues = [
//       userInfo.id,
//       req.body.userId,
//       "like",
//     ];

//     db.query(notificationQuery, [notificationValues]);

//     // REALTIME SOCKET NOTIFICATION
//     io.to(req.body.userId.toString()).emit(
//       "getNotification",
//       {
//         senderId: userInfo.id,
//         type: "like",
//       }
//     );

//     return res
//       .status(200)
//       .json("Post has been liked.");

//   });

// };

// export const deleteLike = (req, res) => {

//   const userInfo = req.userInfo;

//   const q =
//     "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";

//   db.query(
//     q,
//     [userInfo.id, req.query.postId],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res
//         .status(200)
//         .json("Post has been disliked.");

//     }
//   );

// };









































































































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";
// import { io } from "../index.js";

// export const getLikes = (req, res) => {

//   const q = "SELECT userId FROM likes WHERE postId = ?";

//   db.query(q, [req.query.postId], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res
//       .status(200)
//       .json(data.map((like) => like.userId));

//   });
// };

// export const addLike = (req, res) => {

//   const token = req.cookies.accessToken;

//   if (!token)
//     return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {

//     if (err)
//       return res.status(403).json("Token is not valid!");

//     const q =
//       "INSERT INTO likes (`userId`,`postId`) VALUES (?)";

//     const values = [
//       userInfo.id,
//       req.body.postId,
//     ];

//     db.query(q, [values], (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       // SAVE NOTIFICATION TO DATABASE
//       const notificationQuery =
//         "INSERT INTO notifications (`senderId`, `receiverId`, `type`) VALUES (?)";

//       const notificationValues = [
//         userInfo.id,
//         req.body.userId,
//         "like",
//       ];

//       db.query(notificationQuery, [notificationValues]);

//       // REALTIME SOCKET NOTIFICATION
//       io.to(req.body.userId.toString()).emit(
//         "getNotification",
//         {
//           senderId: userInfo.id,
//           type: "like",
//         }
//       );

//       return res
//         .status(200)
//         .json("Post has been liked.");

//     });

//   });

// };

// export const deleteLike = (req, res) => {

//   const token = req.cookies.accessToken;

//   if (!token)
//     return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {

//     if (err)
//       return res.status(403).json("Token is not valid!");

//     const q =
//       "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";

//     db.query(
//       q,
//       [userInfo.id, req.query.postId],
//       (err, data) => {

//         if (err)
//           return res.status(500).json(err);

//         return res
//           .status(200)
//           .json("Post has been disliked.");

//       }
//     );

//   });

// };














































































































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";
// import { io } from "../index.js";



// export const getLikes = (req, res) => {
//     const q = "SELECT userId FROM likes WHERE postId = ?";

//     db.query(q, [req.query.postId], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json(data.map(like=>like.userId));
//     });
// };


// export const addLike = (req, res) => {
//     const token = req.cookies.accessToken;
//     if (!token) return res.status(401).json("Not logged in!");
  
//     jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//       if (err) return res.status(403).json("Token is not valid!");
  
//       const q = "INSERT INTO likes (`userId`,`postId`) VALUES (?)";
//       const values = [
//         userInfo.id,
//         req.body.postId
//       ];
  
//       db.query(q, [values], (err, data) => {
//         if (err) return res.status(500).json(err);

//         // REAL-TIME SOCKET EVENT
//       io.emit("getNotification", {
//         senderId: userInfo.id,
//         receiverId: req.body.userId,
//         type: "like",
//       });
      
//         return res.status(200).json("Post has been liked.");
//       });
//     });
//   };
  
//   export const deleteLike = (req, res) => {
  
//     const token = req.cookies.accessToken;
//     if (!token) return res.status(401).json("Not logged in!");
  
//     jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//       if (err) return res.status(403).json("Token is not valid!");
  
//       const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";
  
//       db.query(q, [userInfo.id, req.query.postId], (err, data) => {
//         if (err) return res.status(500).json(err);
//         return res.status(200).json("Post has been disliked.");
//       });
//     });
//   };