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

// SEND MESSAGE

export const sendMessage = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  // VALIDATION
  if (
    !req.body.text ||
    req.body.text.trim() === ""
  ) {

    logger.warn(
      `Empty message attempt by user ${userInfo.id}`
    );

    return next(
      new ApiError(
        400,
        "Message cannot be empty."
      )
    );

  }

  // VERIFY CONVERSATION EXISTS
  const conversationQuery = `
    SELECT *

    FROM conversations

    WHERE id = ?
  `;

  db.query(
    conversationQuery,
    [req.body.conversationId],

    (err, conversationData) => {

      if (err) {

        logger.error(
          `Conversation lookup failed: ${err.message}`
        );

        return next(err);

      }

      if (
        conversationData.length === 0
      ) {

        logger.warn(
          `Conversation ${req.body.conversationId} not found`
        );

        return next(
          new ApiError(
            404,
            "Conversation not found."
          )
        );

      }

      const conversation =
        conversationData[0];

      // DETERMINE RECEIVER
      const receiverId =
        conversation.user1Id ===
        userInfo.id

          ? conversation.user2Id

          : conversation.user1Id;

          // CHECK IF EITHER USER HAS BLOCKED THE OTHER
const blockQuery = `
  SELECT *
  FROM blocked_users

  WHERE

  (
    blockerId = ?
    AND blockedId = ?
  )

  OR

  (
    blockerId = ?
    AND blockedId = ?
  )
`;

db.query(
  blockQuery,
  [
    userInfo.id,
    receiverId,

    receiverId,
    userInfo.id,
  ],

  (err, blockData) => {

    if (err)
      return next(err);

    if (blockData.length > 0) {

      return next(
        new ApiError(
          403,
          "Messaging unavailable."
        )
      );

    }

    // INSERT MESSAGE HERE

    const q = `
        INSERT INTO messages
        (
          \`conversationId\`,
          \`senderId\`,
          \`text\`
        )
        VALUES (?)
      `;

      const values = [
        req.body.conversationId,
        userInfo.id,
        req.body.text,
      ];

      db.query(
        q,
        [values],

        (err, data) => {

          if (err) {

            logger.error(
              `Failed to send message: ${err.message}`
            );

            return next(err);

          }

          const messageId =
            data.insertId;

          // ACTIVITY LOG
          logActivity(
            userInfo.id,
            "message",
            receiverId
          );

          logger.info(
            `User ${userInfo.id} sent message to ${receiverId}`
          );

          // REALTIME MESSAGE
          const io = getIO();
          io.to(
            receiverId.toString()
          ).emit(
            "getMessage",
            {
              id: messageId,

              senderId:
                userInfo.id,

              receiverId,

              text:
                req.body.text,

              conversationId:
                req.body.conversationId,

              delivered: true,

              createdAt:
                new Date(),
            }
          );

          logger.info(
            `Realtime message emitted to ${receiverId}`
          );

          // SAVE NOTIFICATION
          const notificationQuery = `
            INSERT INTO notifications
            (
              \`senderId\`,
              \`receiverId\`,
              \`type\`
            )
            VALUES (?)
          `;

          const notificationValues = [
            userInfo.id,
            receiverId,
            "message",
          ];

          db.query(
            notificationQuery,
            [notificationValues],

            (err) => {

              if (err) {

                logger.error(
                  `Failed to save message notification: ${err.message}`
                );

                return;

              }

              logger.info(
                `Message notification saved for user ${receiverId}`
              );

            }
          );

          // REALTIME NOTIFICATION
          io.to(
            receiverId.toString()
          ).emit(
            "getNotification",
            {
              senderId:
                userInfo.id,

              type:
                "message",
            }
          );

          return res
            .status(200)
            .json({

              message:
                "Message sent.",

              messageId,

            });

        }
      );

    }
  );

}

)};

      // INSERT MESSAGE
//       const q = `
//         INSERT INTO messages
//         (
//           \`conversationId\`,
//           \`senderId\`,
//           \`text\`
//         )
//         VALUES (?)
//       `;

//       const values = [
//         req.body.conversationId,
//         userInfo.id,
//         req.body.text,
//       ];

//       db.query(
//         q,
//         [values],

//         (err, data) => {

//           if (err) {

//             logger.error(
//               `Failed to send message: ${err.message}`
//             );

//             return next(err);

//           }

//           const messageId =
//             data.insertId;

//           // ACTIVITY LOG
//           logActivity(
//             userInfo.id,
//             "message",
//             receiverId
//           );

//           logger.info(
//             `User ${userInfo.id} sent message to ${receiverId}`
//           );

//           // REALTIME MESSAGE
//           io.to(
//             receiverId.toString()
//           ).emit(
//             "getMessage",
//             {
//               id: messageId,

//               senderId:
//                 userInfo.id,

//               receiverId,

//               text:
//                 req.body.text,

//               conversationId:
//                 req.body.conversationId,

//               delivered: true,

//               createdAt:
//                 new Date(),
//             }
//           );

//           logger.info(
//             `Realtime message emitted to ${receiverId}`
//           );

//           // SAVE NOTIFICATION
//           const notificationQuery = `
//             INSERT INTO notifications
//             (
//               \`senderId\`,
//               \`receiverId\`,
//               \`type\`
//             )
//             VALUES (?)
//           `;

//           const notificationValues = [
//             userInfo.id,
//             receiverId,
//             "message",
//           ];

//           db.query(
//             notificationQuery,
//             [notificationValues],

//             (err) => {

//               if (err) {

//                 logger.error(
//                   `Failed to save message notification: ${err.message}`
//                 );

//                 return;

//               }

//               logger.info(
//                 `Message notification saved for user ${receiverId}`
//               );

//             }
//           );

//           // REALTIME NOTIFICATION
//           io.to(
//             receiverId.toString()
//           ).emit(
//             "getNotification",
//             {
//               senderId:
//                 userInfo.id,

//               type:
//                 "message",
//             }
//           );

//           return res
//             .status(200)
//             .json({

//               message:
//                 "Message sent.",

//               messageId,

//             });

//         }
//       );

//     }
//   );

// };

// GET MESSAGES
export const getMessages = (
  req,
  res,
  next
) => {

  const page =
    parseInt(
      req.query.page
    ) || 1;

  const limit =
    parseInt(
      req.query.limit
    ) || 30;

  const offset =
    (page - 1) * limit;

  const q = `
    SELECT

      m.*,

      u.name,

      u.username,

      u.profilePic

    FROM messages m

    JOIN users u
    ON u.id = m.senderId

    WHERE
      m.conversationId = ?

    ORDER BY
      m.createdAt DESC

    LIMIT ?
    OFFSET ?
  `;

  db.query(
    q,
    [
      req.params.conversationId,
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch messages: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Messages fetched for conversation ${req.params.conversationId}`
      );

      return res
        .status(200)
        .json({

          page,

          limit,

          results:
            data.length,

          messages:
            data.reverse(),

        });

    }
  );

};

// MARK MESSAGE AS SEEN
export const markMessageAsSeen = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    UPDATE messages

    SET isSeen = 1

    WHERE
      id = ?
  `;

  db.query(
    q,
    [req.params.messageId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to mark message as seen: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Message not found."
          )
        );

      }

      logger.info(
        `Message ${req.params.messageId} marked as seen by user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(
          "Message marked as seen."
        );

    }
  );

};

// MARK CONVERSATION AS SEEN
export const markConversationAsSeen = (
  req,
  res,
  next
) => {

  const q = `
    UPDATE messages

    SET isSeen = 1

    WHERE
      conversationId = ?
      AND isSeen = 0
  `;

  db.query(
    q,
    [req.params.conversationId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to mark conversation as seen: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `${data.affectedRows} messages marked as seen in conversation ${req.params.conversationId}`
      );

      return res
        .status(200)
        .json({

          message:
            "Conversation marked as seen.",

          updated:
            data.affectedRows,

        });

    }
  );

};














































// import { db } from "../connect.js";

// import { io } from "../index.js";

// import logger
// from "../utils/logger.js";

// // SEND MESSAGE
// export const sendMessage = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   // PREVENT EMPTY MESSAGES
//   if (
//     !req.body.text ||
//     req.body.text.trim() === ""
//   ) {

//     logger.warn(
//       `Empty message attempt by user ${userInfo.id}`
//     );

//     return res
//       .status(400)
//       .json(
//         "Message cannot be empty."
//       );

//   }

//   // VERIFY CONVERSATION EXISTS
//   const conversationQuery = `
//     SELECT *
//     FROM conversations
//     WHERE id = ?
//   `;

//   db.query(
//     conversationQuery,
//     [req.body.conversationId],

//     (err, conversationData) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch conversation ${req.body.conversationId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       if (
//         conversationData.length === 0
//       ) {

//         logger.warn(
//           `Conversation not found: ${req.body.conversationId}`
//         );

//         return res
//           .status(404)
//           .json(
//             "Conversation not found."
//           );

//       }

//       const conversation =
//         conversationData[0];

//       // DETERMINE RECEIVER
//       const receiverId =
//         conversation.user1Id ===
//         userInfo.id

//           ? conversation.user2Id

//           : conversation.user1Id;

//       // INSERT MESSAGE
//       const q = `
//         INSERT INTO messages
//         (\`conversationId\`, \`senderId\`, \`text\`)
//         VALUES (?)
//       `;

//       const values = [
//         req.body.conversationId,
//         userInfo.id,
//         req.body.text,
//       ];

//       db.query(
//         q,
//         [values],

//         (err, data) => {

//           if (err) {

//             logger.error(
//               `Failed to send message in conversation ${req.body.conversationId}: ${err.message}`
//             );

//             return res
//               .status(500)
//               .json(err);

//           }

//           logger.info(
//             `User ${userInfo.id} sent message in conversation ${req.body.conversationId}`
//           );

//           // REALTIME SOCKET MESSAGE
//           io.to(
//             receiverId.toString()
//           ).emit(
//             "getMessage",
//             {
//               senderId:
//                 userInfo.id,

//               text:
//                 req.body.text,

//               conversationId:
//                 req.body.conversationId,
//             }
//           );

//           logger.info(
//             `Realtime message emitted to user ${receiverId}`
//           );

//           // SAVE MESSAGE NOTIFICATION
//           const notificationQuery = `
//             INSERT INTO notifications
//             (\`senderId\`, \`receiverId\`, \`type\`)
//             VALUES (?)
//           `;

//           const notificationValues = [
//             userInfo.id,
//             receiverId,
//             "message",
//           ];

//           db.query(
//             notificationQuery,
//             [notificationValues],

//             (err) => {

//               if (err) {

//                 logger.error(
//                   `Failed to save message notification: ${err.message}`
//                 );

//                 return;

//               }

//               logger.info(
//                 `Message notification saved for user ${receiverId}`
//               );

//             }
//           );

//           return res
//             .status(200)
//             .json({
//               message:
//                 "Message sent.",

//               messageId:
//                 data.insertId,
//             });

//         }
//       );

//     }
//   );

// };

// // GET MESSAGES
// export const getMessages = (
//   req,
//   res
// ) => {

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 30;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 
//       m.*,

//       u.name,
//       u.username,
//       u.profilePic

//     FROM messages m

//     JOIN users u
//     ON u.id = m.senderId

//     WHERE m.conversationId = ?

//     ORDER BY m.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
//       req.params.conversationId,
//       limit,
//       offset,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch messages for conversation ${req.params.conversationId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Messages fetched for conversation ${req.params.conversationId}`
//       );

//       return res
//         .status(200)
//         .json({
//           page,
//           limit,
//           results:
//             data.length,

//           messages:
//             data.reverse(),
//         });

//     }
//   );

// };






















































// import { db } from "../connect.js";
// import { io } from "../index.js";

// export const sendMessage = (req, res) => {

//   const userInfo = req.userInfo;

//   // PREVENT EMPTY MESSAGES
//   if (
//     !req.body.text ||
//     req.body.text.trim() === ""
//   ) {

//     return res
//       .status(400)
//       .json("Message cannot be empty.");

//   }

//   // VERIFY CONVERSATION EXISTS
//   const conversationQuery = `
//     SELECT *
//     FROM conversations
//     WHERE id = ?
//   `;

//   db.query(
//     conversationQuery,
//     [req.body.conversationId],
//     (err, conversationData) => {

//       if (err)
//         return res.status(500).json(err);

//       if (conversationData.length === 0) {

//         return res
//           .status(404)
//           .json("Conversation not found.");

//       }

//       const conversation =
//         conversationData[0];

//       // DETERMINE RECEIVER
//       const receiverId =
//         conversation.user1Id === userInfo.id
//           ? conversation.user2Id
//           : conversation.user1Id;

//       // INSERT MESSAGE
//       const q = `
//         INSERT INTO messages
//         (\`conversationId\`, \`senderId\`, \`text\`)
//         VALUES (?)
//       `;

//       const values = [
//         req.body.conversationId,
//         userInfo.id,
//         req.body.text,
//       ];

//       db.query(q, [values], (err, data) => {

//         if (err)
//           return res.status(500).json(err);

//         // REALTIME SOCKET MESSAGE
//         io.to(
//           receiverId.toString()
//         ).emit(
//           "getMessage",
//           {
//             senderId: userInfo.id,
//             text: req.body.text,
//             conversationId:
//               req.body.conversationId,
//           }
//         );

//         // SAVE MESSAGE NOTIFICATION
//         const notificationQuery = `
//           INSERT INTO notifications
//           (\`senderId\`, \`receiverId\`, \`type\`)
//           VALUES (?)
//         `;

//         const notificationValues = [
//           userInfo.id,
//           receiverId,
//           "message",
//         ];

//         db.query(
//           notificationQuery,
//           [notificationValues]
//         );

//         return res.status(200).json({
//           message: "Message sent.",
//           messageId: data.insertId,
//         });

//       });

//     }
//   );

// };

// export const getMessages = (req, res) => {

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 30;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 
//       m.*,

//       u.name,
//       u.username,
//       u.profilePic

//     FROM messages m

//     JOIN users u
//     ON u.id = m.senderId

//     WHERE m.conversationId = ?

//     ORDER BY m.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
//       req.params.conversationId,
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
//         messages: data.reverse(),
//       });

//     }
//   );

// };








































// import { db } from "../connect.js";
// import { io } from "../index.js";

// export const sendMessage = (req, res) => {

//   const userInfo = req.userInfo;

//   // PREVENT EMPTY MESSAGES
//   if (!req.body.text || req.body.text.trim() === "") {

//     return res
//       .status(400)
//       .json("Message cannot be empty.");
//   }

//   // VERIFY CONVERSATION EXISTS
//   const conversationQuery = `
//     SELECT *
//     FROM conversations
//     WHERE id = ?
//   `;

//   db.query(
//     conversationQuery,
//     [req.body.conversationId],
//     (err, conversationData) => {

//       if (err)
//         return res.status(500).json(err);

//       if (conversationData.length === 0) {

//         return res
//           .status(404)
//           .json("Conversation not found.");
//       }

//       // INSERT MESSAGE
//       const q = `
//         INSERT INTO messages
//         (\`conversationId\`, \`senderId\`, \`text\`)
//         VALUES (?)
//       `;

//       const values = [
//         req.body.conversationId,
//         userInfo.id,
//         req.body.text,
//       ];

//       db.query(q, [values], (err, data) => {

//         if (err)
//           return res.status(500).json(err);

//         // GET RECEIVER ID
//         const members =
//           conversationData[0].members;

//         const parsedMembers =
//           JSON.parse(members);

//         const receiverId =
//           parsedMembers.find(
//             (id) => id !== userInfo.id
//           );

//         // REALTIME SOCKET MESSAGE
//         io.to(receiverId.toString()).emit(
//           "getMessage",
//           {
//             senderId: userInfo.id,
//             text: req.body.text,
//             conversationId:
//               req.body.conversationId,
//           }
//         );

//         // SAVE MESSAGE NOTIFICATION
//         const notificationQuery = `
//           INSERT INTO notifications
//           (\`senderId\`, \`receiverId\`, \`type\`)
//           VALUES (?)
//         `;

//         const notificationValues = [
//           userInfo.id,
//           receiverId,
//           "message",
//         ];

//         db.query(
//           notificationQuery,
//           [notificationValues]
//         );

//         return res.status(200).json({
//           message: "Message sent.",
//           messageId: data.insertId,
//         });

//       });

//     }
//   );

// };

// export const getMessages = (req, res) => {

//   const q = `
//     SELECT 
//       m.*,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM messages m

//     JOIN users u
//     ON u.id = m.senderId

//     WHERE m.conversationId = ?

//     ORDER BY m.createdAt ASC
//   `;

//   db.query(
//     q,
//     [req.params.conversationId],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json(data);

//     }
//   );

// };


































































































// import { db } from "../connect.js";

// export const sendMessage = (req, res) => {

//   const q = `
//     INSERT INTO messages
//     (conversationId, senderId, text)
//     VALUES (?)
//   `;

//   const values = [
//     req.body.conversationId,
//     req.body.senderId,
//     req.body.text
//   ];

//   db.query(q, [values], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json("Message sent.");
//   });
// };

// export const getMessages = (req, res) => {

//   const q = `
//     SELECT * FROM messages
//     WHERE conversationId = ?
//     ORDER BY createdAt ASC
//   `;

//   db.query(q, [req.params.conversationId], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };