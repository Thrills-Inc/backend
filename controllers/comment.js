import { db } from "../connect.js";

import moment from "moment";

// import { io } from "../index.js";
import {
  getIO,
} from "../sockets/socketInstance.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

// GET COMMENTS
export const getComments = (
  req,
  res,
  next
) => {

  // PAGINATION
  const page =
    parseInt(req.query.page) || 1;

  const limit =
    parseInt(req.query.limit) || 10;

  const offset =
    (page - 1) * limit;

  const q = `
    SELECT 
      c.*, 
      u.id AS userId, 
      u.name, 
      u.username,
      u.profilePic 

    FROM comments AS c

    JOIN users AS u
    ON u.id = c.userId

    WHERE c.postId = ?

    ORDER BY c.createdAt DESC

    LIMIT ? OFFSET ?
  `;

  db.query(
    q,
    [
      req.query.postId,
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch comments: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Comments fetched for post ${req.query.postId}`
      );

      return res
        .status(200)
        .json({
          page,
          limit,
          results: data.length,
          comments: data,
        });

    }
  );

};

// ADD COMMENT
export const addComment = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  // VALIDATION
  if (
    !req.body.desc ||
    req.body.desc.trim() === ""
  ) {

    logger.warn(
      `Empty comment attempt by user ${userInfo.id}`
    );

    return next(
      new ApiError(
        400,
        "Comment cannot be empty."
      )
    );

  }

  const q = `
    INSERT INTO comments
    (\`desc\`, \`createdAt\`, \`userId\`, \`postId\`)
    VALUES (?)
  `;

  const values = [
    req.body.desc,

    moment(Date.now()).format(
      "YYYY-MM-DD HH:mm:ss"
    ),

    userInfo.id,
    req.body.postId,
  ];

  db.query(
    q,
    [values],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to create comment: ${err.message}`
        );

        return next(err);

      }

      // LOG ACTIVITY
      logActivity(
        userInfo.id,
        "comment",
        req.body.postId
      );

      logger.info(
        `Comment created by user ${userInfo.id} on post ${req.body.postId}`
      );

      // GET POST OWNER
      const postQuery = `
        SELECT userId

        FROM posts

        WHERE id = ?
      `;

      db.query(
        postQuery,
        [req.body.postId],

        (err, postData) => {

          if (err) {

            logger.error(
              `Failed to fetch post owner: ${err.message}`
            );

            return;

          }

          if (
            postData.length === 0
          ) {

            logger.warn(
              `Post ${req.body.postId} not found during comment notification`
            );

            return;

          }

          const receiverId =
            postData[0].userId;

          // AVOID SELF NOTIFICATIONS
          if (
            receiverId !==
            userInfo.id
          ) {

            // SAVE NOTIFICATION
            const notificationQuery = `
              INSERT INTO notifications
              (\`senderId\`, \`receiverId\`, \`type\`, \`postId\`)
              VALUES (?)
            `;

            const notificationValues = [
              userInfo.id,
              receiverId,
              "comment",
              req.body.postId,
            ];

            db.query(
              notificationQuery,
              [notificationValues],

              (err) => {

                if (err) {

                  logger.error(
                    `Failed to save comment notification: ${err.message}`
                  );

                  return;

                }

                logger.info(
                  `Comment notification saved for user ${receiverId}`
                );

              }
            );

            // REALTIME SOCKET NOTIFICATION
            const io = getIO();

            io.to(
              receiverId.toString()
            ).emit(
              "getNotification",
              {
                senderId:
                  userInfo.id,

                type:
                  "comment",
              }
            );

            logger.info(
              `Realtime comment notification emitted to user ${receiverId}`
            );

          }

        }
      );

      return res
        .status(200)
        .json(
          "Comment has been created."
        );

    }
  );

};

// DELETE COMMENT
export const deleteComment = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const commentId =
    req.params.id;

  const q = `
    DELETE FROM comments

    WHERE \`id\` = ?
    AND \`userId\` = ?
  `;

  db.query(
    q,
    [
      commentId,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to delete comment ${commentId}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        logger.warn(
          `Unauthorized delete attempt on comment ${commentId} by user ${userInfo.id}`
        );

        return next(
          new ApiError(
            403,
            "You can delete only your comment!"
          )
        );

      }

      logger.info(
        `Comment ${commentId} deleted by user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(
          "Comment has been deleted!"
        );

    }
  );

};

































// import { db } from "../connect.js";
// import moment from "moment";

// import { io } from "../index.js";

// import {
//   logActivity,
// } from "../utils/activityLogger.js";

// import logger
// from "../utils/logger.js";

// // GET COMMENTS
// export const getComments = (
//   req,
//   res
// ) => {

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 10;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 
//       c.*, 
//       u.id AS userId, 
//       u.name, 
//       u.username,
//       u.profilePic 

//     FROM comments AS c

//     JOIN users AS u
//     ON u.id = c.userId

//     WHERE c.postId = ?

//     ORDER BY c.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
//       req.query.postId,
//       limit,
//       offset,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch comments for post ${req.query.postId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Comments fetched for post ${req.query.postId}`
//       );

//       return res.status(200).json({
//         page,
//         limit,
//         results: data.length,
//         comments: data,
//       });

//     }
//   );

// };

// // ADD COMMENT
// export const addComment = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   // PREVENT EMPTY COMMENTS
//   if (
//     !req.body.desc ||
//     req.body.desc.trim() === ""
//   ) {

//     logger.warn(
//       `Empty comment attempt by user ${userInfo.id}`
//     );

//     return res
//       .status(400)
//       .json(
//         "Comment cannot be empty."
//       );

//   }

//   const q = `
//     INSERT INTO comments
//     (\`desc\`, \`createdAt\`, \`userId\`, \`postId\`)
//     VALUES (?)
//   `;

//   const values = [
//     req.body.desc,

//     moment(Date.now()).format(
//       "YYYY-MM-DD HH:mm:ss"
//     ),

//     userInfo.id,

//     req.body.postId,
//   ];

//   db.query(
//     q,
//     [values],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to create comment: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `User ${userInfo.id} commented on post ${req.body.postId}`
//       );

//       // LOG ACTIVITY
//       logActivity(
//         userInfo.id,
//         "comment",
//         req.body.postId
//       );

//       // GET POST OWNER
//       const postQuery = `
//         SELECT userId
//         FROM posts
//         WHERE id = ?
//       `;

//       db.query(
//         postQuery,
//         [req.body.postId],

//         (err, postData) => {

//           if (err) {

//             logger.error(
//               `Failed to fetch post owner: ${err.message}`
//             );

//             return;

//           }

//           if (
//             postData.length === 0
//           ) {

//             logger.warn(
//               `Post not found for comment notification: ${req.body.postId}`
//             );

//             return;

//           }

//           const receiverId =
//             postData[0].userId;

//           // AVOID SELF NOTIFICATIONS
//           if (
//             receiverId !==
//             userInfo.id
//           ) {

//             // SAVE NOTIFICATION
//             const notificationQuery = `
//               INSERT INTO notifications
//               (\`senderId\`, \`receiverId\`, \`type\`, \`postId\`)
//               VALUES (?)
//             `;

//             const notificationValues = [
//               userInfo.id,
//               receiverId,
//               "comment",
//               req.body.postId,
//             ];

//             db.query(
//               notificationQuery,
//               [notificationValues],

//               (err) => {

//                 if (err) {

//                   logger.error(
//                     `Failed to save comment notification: ${err.message}`
//                   );

//                   return;

//                 }

//                 logger.info(
//                   `Comment notification sent to user ${receiverId}`
//                 );

//               }
//             );

//             // REALTIME SOCKET NOTIFICATION
//             io.to(
//               receiverId.toString()
//             ).emit(
//               "getNotification",
//               {
//                 senderId:
//                   userInfo.id,

//                 type:
//                   "comment",
//               }
//             );

//           }

//         }
//       );

//       return res
//         .status(200)
//         .json(
//           "Comment has been created."
//         );

//     }
//   );

// };

// // DELETE COMMENT
// export const deleteComment = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const commentId =
//     req.params.id;

//   const q = `
//     DELETE FROM comments
//     WHERE \`id\` = ?
//     AND \`userId\` = ?
//   `;

//   db.query(
//     q,
//     [
//       commentId,
//       userInfo.id,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to delete comment ${commentId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       if (
//         data.affectedRows > 0
//       ) {

//         logger.info(
//           `Comment ${commentId} deleted by user ${userInfo.id}`
//         );

//         return res.json(
//           "Comment has been deleted!"
//         );

//       }

//       logger.warn(
//         `Unauthorized comment delete attempt by user ${userInfo.id}`
//       );

//       return res
//         .status(403)
//         .json(
//           "You can delete only your comment!"
//         );

//     }
//   );

// };








































// import { db } from "../connect.js";
// import moment from "moment";
// import { io } from "../index.js";
// import { logActivity } from "../utils/activityLogger.js";

// export const getComments = (req, res) => {

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 10;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 
//       c.*, 
//       u.id AS userId, 
//       u.name, 
//       u.username,
//       u.profilePic 

//     FROM comments AS c

//     JOIN users AS u
//     ON u.id = c.userId

//     WHERE c.postId = ?

//     ORDER BY c.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
//       req.query.postId,
//       limit,
//       offset,
//     ],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json({
//         page,
//         limit,
//         results: data.length,
//         comments: data,
//       });

//     }
//   );

// };

// export const addComment = (req, res) => {

//   const userInfo = req.userInfo;

//   // PREVENT EMPTY COMMENTS
//   if (
//     !req.body.desc ||
//     req.body.desc.trim() === ""
//   ) {

//     return res
//       .status(400)
//       .json("Comment cannot be empty.");

//   }

//   const q = `
//     INSERT INTO comments
//     (\`desc\`, \`createdAt\`, \`userId\`, \`postId\`)
//     VALUES (?)
//   `;

//   const values = [
//     req.body.desc,
//     moment(Date.now()).format(
//       "YYYY-MM-DD HH:mm:ss"
//     ),
//     userInfo.id,
//     req.body.postId,
//   ];

//   db.query(q, [values], (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     // LOG ACTIVITY
//     logActivity(
//       userInfo.id,
//       "comment",
//       req.body.postId
//     );

//     // GET POST OWNER
//     const postQuery =
//       "SELECT userId FROM posts WHERE id = ?";

//     db.query(
//       postQuery,
//       [req.body.postId],
//       (err, postData) => {

//         if (err) return;

//         if (postData.length === 0) return;

//         const receiverId =
//           postData[0].userId;

//         // AVOID SELF NOTIFICATIONS
//         if (receiverId !== userInfo.id) {

//           // SAVE NOTIFICATION
//           const notificationQuery = `
//             INSERT INTO notifications
//             (\`senderId\`, \`receiverId\`, \`type\`, \`postId\`)
//             VALUES (?)
//           `;

//           const notificationValues = [
//             userInfo.id,
//             receiverId,
//             "comment",
//             req.body.postId,
//           ];

//           db.query(
//             notificationQuery,
//             [notificationValues]
//           );

//           // REALTIME SOCKET NOTIFICATION
//           io.to(
//             receiverId.toString()
//           ).emit(
//             "getNotification",
//             {
//               senderId: userInfo.id,
//               type: "comment",
//             }
//           );

//         }

//       }
//     );

//     return res
//       .status(200)
//       .json("Comment has been created.");

//   });

// };

// export const deleteComment = (req, res) => {

//   const userInfo = req.userInfo;

//   const commentId = req.params.id;

//   const q = `
//     DELETE FROM comments
//     WHERE \`id\` = ?
//     AND \`userId\` = ?
//   `;

//   db.query(
//     q,
//     [commentId, userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.affectedRows > 0) {

//         return res.json(
//           "Comment has been deleted!"
//         );

//       }

//       return res
//         .status(403)
//         .json(
//           "You can delete only your comment!"
//         );

//     }
//   );

// };







































// import { db } from "../connect.js";
// import moment from "moment";
// import { io } from "../index.js";
// import { logActivity } from "../utils/activityLogger.js";

// export const getComments = (req, res) => {

//   const q = `
//     SELECT 
//       c.*, 
//       u.id AS userId, 
//       u.name, 
//       u.username,
//       u.profilePic 

//     FROM comments AS c

//     JOIN users AS u
//     ON u.id = c.userId

//     WHERE c.postId = ?

//     ORDER BY c.createdAt DESC
//   `;

//   db.query(q, [req.query.postId], (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };

// export const addComment = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     INSERT INTO comments
//     (\`desc\`, \`createdAt\`, \`userId\`, \`postId\`)
//     VALUES (?)
//   `;

//   const values = [
//     req.body.desc,
//     moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//     userInfo.id,
//     req.body.postId,
//   ];

//   db.query(q, [values], (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     // LOG ACTIVITY
//     logActivity(
//       userInfo.id,
//       "comment",
//       req.body.postId
//     );

//     // GET POST OWNER
//     const postQuery =
//       "SELECT userId FROM posts WHERE id = ?";

//     db.query(
//       postQuery,
//       [req.body.postId],
//       (err, postData) => {

//         if (err) return;

//         const receiverId = postData[0].userId;

//         // AVOID SELF-NOTIFICATIONS
//         if (receiverId !== userInfo.id) {

//           // SAVE NOTIFICATION
//           const notificationQuery = `
//             INSERT INTO notifications
//             (\`senderId\`, \`receiverId\`, \`type\`, \`postId\`)
//             VALUES (?)
//           `;

//           const notificationValues = [
//             userInfo.id,
//             receiverId,
//             "comment",
//             req.body.postId,
//           ];

//           db.query(
//             notificationQuery,
//             [notificationValues]
//           );

//           // REALTIME SOCKET NOTIFICATION
//           io.to(receiverId.toString()).emit(
//             "getNotification",
//             {
//               senderId: userInfo.id,
//               type: "comment",
//             }
//           );
//         }
//       }
//     );

//     return res
//       .status(200)
//       .json("Comment has been created.");

//   });

// };

// export const deleteComment = (req, res) => {

//   const userInfo = req.userInfo;

//   const commentId = req.params.id;

//   const q =
//     "DELETE FROM comments WHERE `id` = ? AND `userId` = ?";

//   db.query(
//     q,
//     [commentId, userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.affectedRows > 0) {

//         return res.json(
//           "Comment has been deleted!"
//         );
//       }

//       return res
//         .status(403)
//         .json("You can delete only your comment!");

//     }
//   );

// };



























































































































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";
// import moment from "moment";
// import { io } from "../index.js";
// import { logActivity } from "../utils/activityLogger.js";


// export const getComments = (req, res) => {
//         const q = `SELECT c.*, u.id AS userId, name, profilePic FROM comments AS c JOIN users AS u ON (u.id = c.userId)
//         WHERE c.postId = ? ORDER BY c.createdAt DESC
//         `;
    
//         db.query(q, [req.query.postId], (err,data)=>{
//             if (err) return res.status(500).json(err);
//             return res.status(200).json(data);
//           });
// };



// export const addComment = (req, res) => {
//   const token = req.cookies.accessToken;

//   if (!token) {
//     return res.status(401).json("Not logged in!");
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) {
//       return res.status(403).json("Token is not valid!");
//     }

//     const q = `
//       INSERT INTO comments(\`desc\`, \`createdAt\`, \`userId\`, \`postId\`)
//       VALUES (?)
//     `;

//     const values = [
//       req.body.desc,
//       moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//       userInfo.id,
//       req.body.postId,
//     ];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);

//       logActivity(
//         userInfo.id,
//         "comment",
//         req.body.postId
//       );

//       const postQuery = "SELECT userId FROM posts WHERE id = ?";

// db.query(postQuery, [req.body.postId], (err, postData) => {

//   if (err) return;

//   const receiverId = postData[0].userId;

//   if (receiverId !== userInfo.id) {

//     const notificationQuery = `
//       INSERT INTO notifications
//       (senderId, receiverId, type, postId)
//       VALUES (?)
//     `;

//     const notificationValues = [
//       userInfo.id,
//       receiverId,
//       "comment",
//       req.body.postId
//     ];

//     db.query(notificationQuery, [notificationValues]);

//     // REAL-TIME SOCKET EVENT
//   io.emit("getNotification", {
//     senderId: userInfo.id,
//     receiverId,
//     type: "comment",
//   });

//   }
// });

//       return res.status(200).json("Comment has been created.");
//     });
//   });
// };

// export const addComment = (req, res) => {

//   const q = `
//     INSERT INTO comments(\`desc\`, \`createdAt\`, \`userId\`, \`postId\`)
//     VALUES (?)
//   `;

//   const values = [
//     req.body.desc,
//     moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//     req.body.userId,
//     req.body.postId
//   ];

//   db.query(q, [values], (err, data) => {
//     if (err) return res.status(500).json(err);
//     logActivity(
//   userInfo.id,
//   "comment",
//   req.body.postId
// );

//     return res.status(200).json("Comment has been created.");
//   });
// };

// export const addComment = (req, res) => {
//     const token = req.cookies.accessToken;
//     if (!token) return res.status(401).json("Not logged in!");
  
//     jwt.verify(token, "secretkey", (err, userInfo) => {
//       if (err) return res.status(403).json("Token is not valid!");
  
//       console.log(userId);
//     const q = "INSERT INTO comments(`desc`, `createdAt`, `userId`, `postId`) VALUES (?)";

//     const values = [
//         req.body.desc,
//         moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//         userInfo.id,
//         req.body.postId
//       ];

//     db.query(q, [values], (err,data)=>{
//         if (err) return res.status(500).json(err);
// logActivity(
//   userInfo.id,
//   "comment",
//   req.body.postId
// );
//         return res.status(200).json("Comment has been created.");
//       });
//     });
// };

// export const deleteComment = (req, res) => {
//     const token = req.cookies.accessToken;
//     if (!token) return res.status(401).json("Not authenticated!");
  
//     jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//       // jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {})
//       if (err) return res.status(403).json("Token is not valid!");
  
//       const commentId = req.params.id;
//       const q = "DELETE FROM comments WHERE `id` = ? AND `userId` = ?";
  
//       db.query(q, [commentId, userInfo.id], (err, data) => {
//         if (err) return res.status(500).json(err);
//         if (data.affectedRows > 0) return res.json("Comment has been deleted!");
//         return res.status(403).json("You can delete only your comment!");
//       });
//     });
//   };


  // jwt.verify(token, "jwtkey", (err, userInfo)