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

// GET RELATIONSHIPS
export const getRelationships = (
  req,
  res,
  next
) => {

  const followedUserId =
    req.query.followedUserId;

  const q = `
    SELECT followerUserId

    FROM relationships

    WHERE followedUserId = ?
  `;

  db.query(
    q,
    [followedUserId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch relationships: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Relationships fetched for user ${followedUserId}`
      );

      return res
        .status(200)
        .json(
          data.map(
            (relationship) =>
              relationship.followerUserId
          )
        );

    }
  );

};

// FOLLOW USER
export const addRelationship = (
req,
res,
next
) => {

const userInfo =
req.userInfo;

const targetUserId =
req.body.userId;

// PREVENT SELF FOLLOW
if (
userInfo.id === targetUserId
) {

logger.warn(
  `User ${userInfo.id} attempted to follow themselves`
);

return next(
  new ApiError(
    400,
    "You cannot follow yourself."
  )
);

}

// CHECK BLOCK STATUS
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
targetUserId,

  targetUserId,
  userInfo.id,
],

(err, blockData) => {

  if (err)
    return next(err);

  if (
    blockData.length > 0
  ) {

    return next(
      new ApiError(
        403,
        "Cannot follow this user."
      )
    );

  }

  // CHECK IF ALREADY FOLLOWING
  const checkQuery = `
    SELECT *

    FROM relationships

    WHERE

      followerUserId = ?

      AND

      followedUserId = ?
  `;

  db.query(
    checkQuery,
    [
      userInfo.id,
      targetUserId,
    ],

    (err, data) => {

      if (err)
        return next(err);

      if (
        data.length > 0
      ) {

        return next(
          new ApiError(
            400,
            "Already following this user."
          )
        );

      }

      const insertQuery = `
        INSERT INTO relationships
        (
          followerUserId,
          followedUserId
        )
        VALUES (?, ?)
      `;

      db.query(
        insertQuery,
        [
          userInfo.id,
          targetUserId,
        ],

        (err) => {

          if (err)
            return next(err);

          // ACTIVITY LOG
          logActivity(
            userInfo.id,
            "follow",
            targetUserId
          );

          // SAVE NOTIFICATION
          const notificationQuery = `
            INSERT INTO notifications
            (
              senderId,
              receiverId,
              type
            )
            VALUES (?, ?, ?)
          `;

          db.query(
            notificationQuery,
            [
              userInfo.id,
              targetUserId,
              "follow",
            ]
          );

          // REALTIME NOTIFICATION
          const io = getIO();
          io.to(
            targetUserId.toString()
          ).emit(
            "getNotification",
            {
              senderId:
                userInfo.id,

              type:
                "follow",
            }
          );

          logger.info(
            `User ${userInfo.id} followed user ${targetUserId}`
          );

          return res
            .status(200)
            .json(
              "Following"
            );

        }
      );

    }
  );

}

);

};
















// export const addRelationship = (
//   req,
//   res,
//   next
// ) => {

//   const userInfo =
//     req.userInfo;

//   const targetUserId =
//     req.body.userId;

//   // PREVENT SELF FOLLOW
//   if (
//     userInfo.id ===
//     targetUserId
//   ) {

//     logger.warn(
//       `User ${userInfo.id} attempted to follow themselves`
//     );

//     return next(
//       new ApiError(
//         400,
//         "You cannot follow yourself."
//       )
//     );

//   }

//   // BLOCK CHECK
// const blockQuery = `
// SELECT *

// FROM blocked_users

// WHERE

// (
//   blockerId = ?
//   AND blockedId = ?
// )

// OR

// (
//   blockerId = ?
//   AND blockedId = ?
// )

// `;

// db.query(
// blockQuery,

// [
//   userInfo.id,
//   req.body.userId,

//   req.body.userId,
//   userInfo.id,
// ],

// (err, blockData) => {

//   if (err)
//     return next(err);

//   if (
//     blockData.length > 0
//   ) {

//     return next(
//       new ApiError(
//         403,
//         "Cannot follow this user."
//       )
//     );
  
//   }

//   // CHECK EXISTING FOLLOW
//   const checkQuery = `
//     SELECT *

//     FROM relationships

//     WHERE followerUserId = ?
//     AND followedUserId = ?
//   `;

//   db.query(
//     checkQuery,
//     [
//       userInfo.id,
//       targetUserId,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed checking relationship: ${err.message}`
//         );

//         return next(err);

//       }

//       if (
//         data.length > 0
//       ) {

//         logger.warn(
//           `User ${userInfo.id} already follows user ${targetUserId}`
//         );

//         return next(
//           new ApiError(
//             400,
//             "Already following this user."
//           )
//         );

//       }

//       const q = `
//         INSERT INTO relationships
//         (
//           \`followerUserId\`,
//           \`followedUserId\`
//         )
//         VALUES (?)
//       `;

//       const values = [
//         userInfo.id,
//         targetUserId,
//       ];

//       db.query(
//         q,
//         [values],

//         (err, result) => {

//           if (err) {

//             logger.error(
//               `Failed to create relationship: ${err.message}`
//             );

//             return next(err);

//           }

//           // ACTIVITY LOG
//           logActivity(
//             userInfo.id,
//             "follow",
//             targetUserId
//           );

//           logger.info(
//             `User ${userInfo.id} followed user ${targetUserId}`
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
//             targetUserId,
//             "follow",
//           ];

//           db.query(
//             notificationQuery,
//             [notificationValues],

//             (err) => {

//               if (err) {

//                 logger.error(
//                   `Failed saving follow notification: ${err.message}`
//                 );

//                 return;

//               }

//               logger.info(
//                 `Follow notification saved for user ${targetUserId}`
//               );

//             }
//           );

//           // REALTIME NOTIFICATION
//           io.to(
//             targetUserId.toString()
//           ).emit(
//             "getNotification",
//             {
//               senderId:
//                 userInfo.id,

//               type:
//                 "follow",
//             }
//           );

//           logger.info(
//             `Realtime follow notification emitted to user ${targetUserId}`
//           );

//           return res
//             .status(200)
//             .json(
//               "Following"
//             );
          
//         }
//       );
    
//     }
//   );

// }
// );
// }

// UNFOLLOW USER
export const deleteRelationship = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const targetUserId =
    req.query.userId;

  const q = `
    DELETE FROM relationships

    WHERE
      followerUserId = ?
      AND followedUserId = ?
  `;

  db.query(
    q,
    [
      userInfo.id,
      targetUserId,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to unfollow user ${targetUserId}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        logger.warn(
          `Relationship not found between ${userInfo.id} and ${targetUserId}`
        );

        return next(
          new ApiError(
            404,
            "Relationship not found."
          )
        );

      }

      logger.info(
        `User ${userInfo.id} unfollowed user ${targetUserId}`
      );

      return res
        .status(200)
        .json(
          "Unfollow"
        );

    }
  );

};

// FOLLOWER/FOLLOWING COUNTS
export const getRelationshipCounts = (
  req,
  res,
  next
) => {

  const userId =
    req.query.userId;

  const followersQuery = `
    SELECT COUNT(*) AS followersCount

    FROM relationships

    WHERE followedUserId = ?
  `;

  const followingQuery = `
    SELECT COUNT(*) AS followingCount

    FROM relationships

    WHERE followerUserId = ?
  `;

  db.query(
    followersQuery,
    [userId],

    (err, followersData) => {

      if (err) {

        logger.error(
          `Failed fetching followers count: ${err.message}`
        );

        return next(err);

      }

      db.query(
        followingQuery,
        [userId],

        (err, followingData) => {

          if (err) {

            logger.error(
              `Failed fetching following count: ${err.message}`
            );

            return next(err);

          }

          logger.info(
            `Relationship counts fetched for user ${userId}`
          );

          return res
            .status(200)
            .json({

              followersCount:
                followersData[0]
                  .followersCount,

              followingCount:
                followingData[0]
                  .followingCount,

            });

        }
      );

    }
  );

};





































// import { db } from "../connect.js";

// import { io } from "../index.js";

// import logger
// from "../utils/logger.js";

// // GET RELATIONSHIPS
// export const getRelationships = (
//   req,
//   res
// ) => {

//   const followedUserId =
//     req.query.followedUserId;

//   const q = `
//     SELECT followerUserId

//     FROM relationships

//     WHERE followedUserId = ?
//   `;

//   db.query(
//     q,
//     [followedUserId],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch relationships for user ${followedUserId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Relationships fetched for user ${followedUserId}`
//       );

//       return res
//         .status(200)
//         .json(
//           data.map(
//             (relationship) =>
//               relationship.followerUserId
//           )
//         );

//     }
//   );

// };

// // ADD RELATIONSHIP
// export const addRelationship = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   // PREVENT SELF FOLLOW
//   if (
//     userInfo.id ===
//     req.body.userId
//   ) {

//     logger.warn(
//       `User ${userInfo.id} attempted to follow self`
//     );

//     return res
//       .status(400)
//       .json(
//         "You cannot follow yourself."
//       );

//   }

//   // CHECK IF ALREADY FOLLOWING
//   const checkQuery = `
//     SELECT *

//     FROM relationships

//     WHERE followerUserId = ?
//     AND followedUserId = ?
//   `;

//   db.query(
//     checkQuery,
//     [
//       userInfo.id,
//       req.body.userId,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to check relationship: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       if (data.length > 0) {

//         logger.warn(
//           `User ${userInfo.id} already follows user ${req.body.userId}`
//         );

//         return res
//           .status(400)
//           .json(
//             "Already following this user."
//           );

//       }

//       // FOLLOW USER
//       const q = `
//         INSERT INTO relationships
//         (\`followerUserId\`, \`followedUserId\`)
//         VALUES (?)
//       `;

//       const values = [
//         userInfo.id,
//         req.body.userId,
//       ];

//       db.query(
//         q,
//         [values],

//         (err, data) => {

//           if (err) {

//             logger.error(
//               `Failed to follow user ${req.body.userId}: ${err.message}`
//             );

//             return res
//               .status(500)
//               .json(err);

//           }

//           logger.info(
//             `User ${userInfo.id} followed user ${req.body.userId}`
//           );

//           // SAVE NOTIFICATION
//           const notificationQuery = `
//             INSERT INTO notifications
//             (\`senderId\`, \`receiverId\`, \`type\`)
//             VALUES (?)
//           `;

//           const notificationValues = [
//             userInfo.id,
//             req.body.userId,
//             "follow",
//           ];

//           db.query(
//             notificationQuery,
//             [notificationValues],

//             (err) => {

//               if (err) {

//                 logger.error(
//                   `Failed to save follow notification: ${err.message}`
//                 );

//                 return;

//               }

//               logger.info(
//                 `Follow notification sent to user ${req.body.userId}`
//               );

//             }
//           );

//           // REALTIME SOCKET NOTIFICATION
//           io.to(
//             req.body.userId.toString()
//           ).emit(
//             "getNotification",
//             {
//               senderId:
//                 userInfo.id,

//               type:
//                 "follow",
//             }
//           );

//           return res
//             .status(200)
//             .json("Following");

//         }
//       );

//     }
//   );

// };

// // DELETE RELATIONSHIP
// export const deleteRelationship = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const followedUserId =
//     req.query.userId;

//   const q = `
//     DELETE FROM relationships

//     WHERE \`followerUserId\` = ?
//     AND \`followedUserId\` = ?
//   `;

//   db.query(
//     q,
//     [
//       userInfo.id,
//       followedUserId,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to unfollow user ${followedUserId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `User ${userInfo.id} unfollowed user ${followedUserId}`
//       );

//       return res
//         .status(200)
//         .json("Unfollow");

//     }
//   );

// };

// // GET RELATIONSHIP COUNTS
// export const getRelationshipCounts = (
//   req,
//   res
// ) => {

//   const targetUserId =
//     req.query.userId;

//   const followersQuery = `
//     SELECT COUNT(*) AS followersCount

//     FROM relationships

//     WHERE followedUserId = ?
//   `;

//   const followingQuery = `
//     SELECT COUNT(*) AS followingCount

//     FROM relationships

//     WHERE followerUserId = ?
//   `;

//   db.query(
//     followersQuery,
//     [targetUserId],

//     (err, followersData) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch followers count for user ${targetUserId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       db.query(
//         followingQuery,
//         [targetUserId],

//         (err, followingData) => {

//           if (err) {

//             logger.error(
//               `Failed to fetch following count for user ${targetUserId}: ${err.message}`
//             );

//             return res
//               .status(500)
//               .json(err);

//           }

//           logger.info(
//             `Relationship counts fetched for user ${targetUserId}`
//           );

//           return res
//             .status(200)
//             .json({

//               followersCount:
//                 followersData[0]
//                   .followersCount,

//               followingCount:
//                 followingData[0]
//                   .followingCount,

//             });

//         }
//       );

//     }
//   );

// };
































































// import { db } from "../connect.js";
// import { io } from "../index.js";

// export const getRelationships = (req, res) => {

//   const q =
//     "SELECT followerUserId FROM relationships WHERE followedUserId = ?";

//   db.query(
//     q,
//     [req.query.followedUserId],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res
//         .status(200)
//         .json(
//           data.map(
//             (relationship) =>
//               relationship.followerUserId
//           )
//         );

//     }
//   );

// };

// export const addRelationship = (req, res) => {

//   const userInfo = req.userInfo;

//   // PREVENT SELF FOLLOW
//   if (userInfo.id === req.body.userId) {

//     return res
//       .status(400)
//       .json("You cannot follow yourself.");
//   }

//   // CHECK IF ALREADY FOLLOWING
//   const checkQuery = `
//     SELECT *
//     FROM relationships
//     WHERE followerUserId = ?
//     AND followedUserId = ?
//   `;

//   db.query(
//     checkQuery,
//     [userInfo.id, req.body.userId],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.length > 0) {

//         return res
//           .status(400)
//           .json("Already following this user.");
//       }

//       // FOLLOW USER
//       const q = `
//         INSERT INTO relationships
//         (\`followerUserId\`, \`followedUserId\`)
//         VALUES (?)
//       `;

//       const values = [
//         userInfo.id,
//         req.body.userId,
//       ];

//       db.query(q, [values], (err, data) => {

//         if (err)
//           return res.status(500).json(err);

//         // SAVE NOTIFICATION
//         const notificationQuery = `
//           INSERT INTO notifications
//           (\`senderId\`, \`receiverId\`, \`type\`)
//           VALUES (?)
//         `;

//         const notificationValues = [
//           userInfo.id,
//           req.body.userId,
//           "follow",
//         ];

//         db.query(
//           notificationQuery,
//           [notificationValues]
//         );

//         // REALTIME SOCKET NOTIFICATION
//         io.to(req.body.userId.toString()).emit(
//           "getNotification",
//           {
//             senderId: userInfo.id,
//             type: "follow",
//           }
//         );

//         return res
//           .status(200)
//           .json("Following");

//       });

//     }
//   );

// };

// export const deleteRelationship = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     DELETE FROM relationships
//     WHERE \`followerUserId\` = ?
//     AND \`followedUserId\` = ?
//   `;

//   db.query(
//     q,
//     [userInfo.id, req.query.userId],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res
//         .status(200)
//         .json("Unfollow");

//     }
//   );

// };

// export const getRelationshipCounts = (req, res) => {

//   const followersQuery = `
//     SELECT COUNT(*) AS followersCount
//     FROM relationships
//     WHERE followedUserId = ?
//   `;

//   const followingQuery = `
//     SELECT COUNT(*) AS followingCount
//     FROM relationships
//     WHERE followerUserId = ?
//   `;

//   db.query(
//     followersQuery,
//     [req.query.userId],
//     (err, followersData) => {

//       if (err)
//         return res.status(500).json(err);

//       db.query(
//         followingQuery,
//         [req.query.userId],
//         (err, followingData) => {

//           if (err)
//             return res.status(500).json(err);

//           return res.status(200).json({

//             followersCount:
//               followersData[0]
//                 .followersCount,

//             followingCount:
//               followingData[0]
//                 .followingCount,

//           });

//         }
//       );

//     }
//   );

// };












































































































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";

// export const getRelationships = (req,res)=>{
//     const q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";

//     db.query(q, [req.query.followedUserId], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json(data.map(relationship=>relationship.followerUserId));
//     });
// }

// export const addRelationship = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q = "INSERT INTO relationships (`followerUserId`,`followedUserId`) VALUES (?)";
//     const values = [
//       userInfo.id,
//       req.body.userId
//     ];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json("Following");
//     });
//   });
// };

// export const deleteRelationship = (req, res) => {

//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q = "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";

//     db.query(q, [userInfo.id, req.query.userId], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json("Unfollow");
//     });
//   });
// };


// export const getRelationshipCounts = (req, res) => {

//   const followersQuery = `
//     SELECT COUNT(*) AS followersCount
//     FROM relationships
//     WHERE followedUserId = ?
//   `;

//   const followingQuery = `
//     SELECT COUNT(*) AS followingCount
//     FROM relationships
//     WHERE followerUserId = ?
//   `;

//   db.query(
//     followersQuery,
//     [req.query.userId],
//     (err, followersData) => {

//       if (err) return res.status(500).json(err);

//       db.query(
//         followingQuery,
//         [req.query.userId],
//         (err, followingData) => {

//           if (err) return res.status(500).json(err);

//           return res.status(200).json({
//             followersCount:
//               followersData[0].followersCount,

//             followingCount:
//               followingData[0].followingCount,
//           });
//         }
//       );
//     }
//   );
// };