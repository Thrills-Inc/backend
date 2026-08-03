import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// CREATE CONVERSATION
export const createConversation = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const receiverId =
    req.body.receiverId;

  // PREVENT SELF CHAT
  if (
    userInfo.id ===
    receiverId
  ) {

    logger.warn(
      `User ${userInfo.id} attempted to message themselves`
    );

    return next(
      new ApiError(
        400,
        "You cannot message yourself."
      )
    );

  }

  // CHECK IF CONVERSATION EXISTS
  const checkQuery = `
    SELECT *

    FROM conversations

    WHERE

      (
        user1Id = ?
        AND
        user2Id = ?
      )

      OR

      (
        user1Id = ?
        AND
        user2Id = ?
      )
  `;

  db.query(
    checkQuery,
    [
      userInfo.id,
      receiverId,

      receiverId,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Conversation lookup failed: ${err.message}`
        );

        return next(err);

      }

      // RETURN EXISTING CONVERSATION
      if (
        data.length > 0
      ) {

        logger.info(
          `Existing conversation returned between ${userInfo.id} and ${receiverId}`
        );

        return res
          .status(200)
          .json({

            conversationId:
              data[0].id,

            alreadyExists:
              true,

          });

      }

      // CREATE NEW CONVERSATION
      const q = `
        INSERT INTO conversations
        (
          \`user1Id\`,
          \`user2Id\`
        )
        VALUES (?)
      `;

      const values = [
        userInfo.id,
        receiverId,
      ];

      db.query(
        q,
        [values],

        (err, result) => {

          if (err) {

            logger.error(
              `Conversation creation failed: ${err.message}`
            );

            return next(err);

          }

          logActivity(
            userInfo.id,
            "conversation",
            receiverId
          );

          logger.info(
            `Conversation created between ${userInfo.id} and ${receiverId}`
          );

          return res
            .status(201)
            .json({

              conversationId:
                result.insertId,

              alreadyExists:
                false,

            });

        }
      );

    }
  );

};

// GET CONVERSATIONS
export const getConversations = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const page =
    parseInt(
      req.query.page
    ) || 1;

  const limit =
    parseInt(
      req.query.limit
    ) || 20;

  const offset =
    (page - 1) * limit;

  const q = `
    SELECT

      c.*,

      u.id AS otherUserId,

      u.name,

      u.username,

      u.profilePic,

      (
        SELECT text

        FROM messages

        WHERE
          conversationId = c.id

        ORDER BY createdAt DESC

        LIMIT 1
      ) AS lastMessage,

      (
        SELECT createdAt

        FROM messages

        WHERE
          conversationId = c.id

        ORDER BY createdAt DESC

        LIMIT 1
      ) AS lastMessageAt

    FROM conversations c

    JOIN users u

    ON (

      (
        u.id = c.user1Id

        AND

        c.user2Id = ?
      )

      OR

      (
        u.id = c.user2Id

        AND

        c.user1Id = ?
      )

    )

    ORDER BY
      COALESCE(
        lastMessageAt,
        c.createdAt
      ) DESC

    LIMIT ?
    OFFSET ?
  `;

  db.query(
    q,
    [
      userInfo.id,
      userInfo.id,
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch conversations: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Conversations fetched for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          page,

          limit,

          results:
            data.length,

          conversations:
            data,

        });

    }
  );

};

// GET SINGLE CONVERSATION
export const getConversation = (
  req,
  res,
  next
) => {

  const conversationId =
    req.params.id;

  const q = `
    SELECT *

    FROM conversations

    WHERE id = ?
  `;

  db.query(
    q,
    [conversationId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch conversation ${conversationId}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.length === 0
      ) {

        return next(
          new ApiError(
            404,
            "Conversation not found."
          )
        );

      }

      logger.info(
        `Conversation ${conversationId} fetched`
      );

      return res
        .status(200)
        .json(
          data[0]
        );

    }
  );

};

// DELETE CONVERSATION
export const deleteConversation = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const conversationId =
    req.params.id;

  const checkQuery = `
    SELECT *

    FROM conversations

    WHERE
      id = ?

      AND

      (
        user1Id = ?
        OR
        user2Id = ?
      )
  `;

  db.query(
    checkQuery,
    [
      conversationId,
      userInfo.id,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Conversation authorization failed: ${err.message}`
        );

        return next(err);

      }

      if (
        data.length === 0
      ) {

        return next(
          new ApiError(
            403,
            "Unauthorized action."
          )
        );

      }

      const q = `
        DELETE FROM conversations

        WHERE id = ?
      `;

      db.query(
        q,
        [conversationId],

        (err, result) => {

          if (err) {

            logger.error(
              `Failed to delete conversation ${conversationId}: ${err.message}`
            );

            return next(err);

          }

          logger.info(
            `Conversation ${conversationId} deleted by user ${userInfo.id}`
          );

          return res
            .status(200)
            .json(
              "Conversation deleted."
            );

        }
      );

    }
  );

};

// GET UNREAD CONVERSATION COUNT
export const getUnreadConversationsCount = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    SELECT
      COUNT(DISTINCT conversationId)
      AS unreadConversations

    FROM messages

    WHERE

      senderId != ?

      AND

      isSeen = 0
  `;

  db.query(
    q,
    [userInfo.id],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch unread conversation count: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Unread conversation count fetched for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          unreadConversations:
            data[0]
              .unreadConversations,

        });

    }
  );

};




































// import { db } from "../connect.js";

// import logger
// from "../utils/logger.js";

// // CREATE CONVERSATION
// export const createConversation = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   // PREVENT SELF CHAT
//   if (
//     userInfo.id ===
//     req.body.receiverId
//   ) {

//     logger.warn(
//       `User ${userInfo.id} attempted to create conversation with self`
//     );

//     return res
//       .status(400)
//       .json(
//         "You cannot message yourself."
//       );

//   }

//   // CHECK IF CONVERSATION EXISTS
//   const checkQuery = `
//     SELECT *
//     FROM conversations

//     WHERE
//       (user1Id = ? AND user2Id = ?)

//       OR

//       (user1Id = ? AND user2Id = ?)
//   `;

//   db.query(
//     checkQuery,
//     [
//       userInfo.id,
//       req.body.receiverId,

//       req.body.receiverId,
//       userInfo.id,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to check conversation existence: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       // RETURN EXISTING CONVERSATION
//       if (data.length > 0) {

//         logger.info(
//           `Existing conversation returned for users ${userInfo.id} and ${req.body.receiverId}`
//         );

//         return res
//           .status(200)
//           .json({
//             conversationId:
//               data[0].id,

//             alreadyExists:
//               true,
//           });

//       }

//       // CREATE CONVERSATION
//       const q = `
//         INSERT INTO conversations
//         (\`user1Id\`, \`user2Id\`)
//         VALUES (?)
//       `;

//       const values = [
//         userInfo.id,
//         req.body.receiverId,
//       ];

//       db.query(
//         q,
//         [values],

//         (err, data) => {

//           if (err) {

//             logger.error(
//               `Failed to create conversation: ${err.message}`
//             );

//             return res
//               .status(500)
//               .json(err);

//           }

//           logger.info(
//             `Conversation created between users ${userInfo.id} and ${req.body.receiverId}`
//           );

//           return res
//             .status(200)
//             .json({
//               conversationId:
//                 data.insertId,

//               alreadyExists:
//                 false,
//             });

//         }
//       );

//     }
//   );

// };

// // GET CONVERSATIONS
// export const getConversations = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 20;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 

//       c.*,

//       u.id AS otherUserId,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM conversations c

//     JOIN users u

//     ON (
//       (u.id = c.user1Id AND c.user2Id = ?)

//       OR

//       (u.id = c.user2Id AND c.user1Id = ?)
//     )

//     ORDER BY c.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
//       userInfo.id,
//       userInfo.id,
//       limit,
//       offset,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch conversations for user ${userInfo.id}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Conversations fetched for user ${userInfo.id}`
//       );

//       return res
//         .status(200)
//         .json({
//           page,
//           limit,
//           results:
//             data.length,

//           conversations:
//             data,
//         });

//     }
//   );

// };



































// import { db } from "../connect.js";

// export const createConversation = (req, res) => {

//   const userInfo = req.userInfo;

//   // PREVENT SELF CHAT
//   if (userInfo.id === req.body.receiverId) {

//     return res
//       .status(400)
//       .json("You cannot message yourself.");

//   }

//   // CHECK IF CONVERSATION EXISTS
//   const checkQuery = `
//     SELECT *
//     FROM conversations

//     WHERE
//       (user1Id = ? AND user2Id = ?)

//       OR

//       (user1Id = ? AND user2Id = ?)
//   `;

//   db.query(
//     checkQuery,
//     [
//       userInfo.id,
//       req.body.receiverId,

//       req.body.receiverId,
//       userInfo.id,
//     ],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       // RETURN EXISTING CONVERSATION
//       if (data.length > 0) {

//         return res.status(200).json({
//           conversationId:
//             data[0].id,

//           alreadyExists: true,
//         });

//       }

//       // CREATE CONVERSATION
//       const q = `
//         INSERT INTO conversations
//         (\`user1Id\`, \`user2Id\`)
//         VALUES (?)
//       `;

//       const values = [
//         userInfo.id,
//         req.body.receiverId,
//       ];

//       db.query(q, [values], (err, data) => {

//         if (err)
//           return res.status(500).json(err);

//         return res.status(200).json({
//           conversationId:
//             data.insertId,

//           alreadyExists: false,
//         });

//       });

//     }
//   );

// };

// export const getConversations = (req, res) => {

//   const userInfo = req.userInfo;

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 20;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 

//       c.*,

//       u.id AS otherUserId,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM conversations c

//     JOIN users u

//     ON (
//       (u.id = c.user1Id AND c.user2Id = ?)

//       OR

//       (u.id = c.user2Id AND c.user1Id = ?)
//     )

//     ORDER BY c.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
//       userInfo.id,
//       userInfo.id,
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
//         conversations: data,
//       });

//     }
//   );

// };











































// import { db } from "../connect.js";

// export const createConversation = (req, res) => {

//   const userInfo = req.userInfo;

//   // PREVENT SELF CHAT
//   if (userInfo.id === req.body.receiverId) {

//     return res
//       .status(400)
//       .json("You cannot message yourself.");
//   }

//   // CHECK IF CONVERSATION ALREADY EXISTS
//   const checkQuery = `
//     SELECT *
//     FROM conversations

//     WHERE
//       (user1Id = ? AND user2Id = ?)

//       OR

//       (user1Id = ? AND user2Id = ?)
//   `;

//   db.query(
//     checkQuery,
//     [
//       userInfo.id,
//       req.body.receiverId,

//       req.body.receiverId,
//       userInfo.id,
//     ],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       // RETURN EXISTING CONVERSATION
//       if (data.length > 0) {

//         return res.status(200).json({
//           conversationId: data[0].id,
//           alreadyExists: true,
//         });
//       }

//       // CREATE NEW CONVERSATION
//       const q = `
//         INSERT INTO conversations
//         (\`user1Id\`, \`user2Id\`)
//         VALUES (?)
//       `;

//       const values = [
//         userInfo.id,
//         req.body.receiverId,
//       ];

//       db.query(q, [values], (err, data) => {

//         if (err)
//           return res.status(500).json(err);

//         return res.status(200).json({
//           conversationId: data.insertId,
//           alreadyExists: false,
//         });

//       });

//     }
//   );

// };

// export const getConversations = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     SELECT 

//       c.*,

//       u.id AS otherUserId,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM conversations c

//     JOIN users u

//     ON (
//       (u.id = c.user1Id AND c.user2Id = ?)

//       OR

//       (u.id = c.user2Id AND c.user1Id = ?)
//     )

//     ORDER BY c.createdAt DESC
//   `;

//   db.query(
//     q,
//     [userInfo.id, userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json(data);

//     }
//   );

// };








































































































// import { db } from "../connect.js";

// export const createConversation = (req, res) => {

//   const q = `
//     INSERT INTO conversations
//     (user1Id, user2Id)
//     VALUES (?)
//   `;

//   const values = [
//     req.body.user1Id,
//     req.body.user2Id
//   ];

//   db.query(q, [values], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json({
//       conversationId: data.insertId
//     });
//   });
// };

// export const getConversations = (req, res) => {

//   const q = `
//     SELECT * FROM conversations
//     WHERE user1Id = ?
//     OR user2Id = ?
//     ORDER BY createdAt DESC
//   `;

//   db.query(
//     q,
//     [req.params.userId, req.params.userId],
//     (err, data) => {

//       if (err) return res.status(500).json(err);

//       return res.status(200).json(data);
//     }
//   );
// };