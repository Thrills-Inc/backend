import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

// GET NOTIFICATIONS
export const getNotifications = (
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
    ) || 15;

  const offset =
    (page - 1) * limit;

  const q = `
    SELECT

      n.id,

      n.type,

      n.postId,

      n.createdAt,

      n.isRead,

      u.id AS senderId,

      u.name,

      u.username,

      u.profilePic

    FROM notifications n

    JOIN users u
    ON u.id = n.senderId

    WHERE
      n.receiverId = ?

    ORDER BY
      n.createdAt DESC

    LIMIT ?
    OFFSET ?
  `;

  db.query(
    q,
    [
      userInfo.id,
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch notifications for user ${userInfo.id}: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Notifications fetched for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          page,

          limit,

          results:
            data.length,

          notifications:
            data,

        });

    }
  );

};

// MARK SINGLE NOTIFICATION AS READ
export const markNotificationAsRead = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const notificationId =
    req.params.id;

  const q = `
    UPDATE notifications

    SET isRead = 1

    WHERE
      id = ?
      AND receiverId = ?
  `;

  db.query(
    q,
    [
      notificationId,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to mark notification ${notificationId} as read: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        logger.warn(
          `Notification ${notificationId} not found for user ${userInfo.id}`
        );

        return next(
          new ApiError(
            404,
            "Notification not found."
          )
        );

      }

      logger.info(
        `Notification ${notificationId} marked as read by user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(
          "Notification marked as read."
        );

    }
  );

};

// MARK ALL NOTIFICATIONS AS READ
export const markAllNotificationsAsRead = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    UPDATE notifications

    SET isRead = 1

    WHERE receiverId = ?
  `;

  db.query(
    q,
    [userInfo.id],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to mark all notifications as read for user ${userInfo.id}: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `${data.affectedRows} notifications marked as read for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          message:
            "All notifications marked as read.",

          updatedNotifications:
            data.affectedRows,

        });

    }
  );

};

// GET UNREAD NOTIFICATION COUNT
export const getUnreadNotificationsCount = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    SELECT

      COUNT(*) AS unreadCount

    FROM notifications

    WHERE
      receiverId = ?
      AND isRead = 0
  `;

  db.query(
    q,
    [userInfo.id],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch unread notification count for user ${userInfo.id}: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Unread notification count fetched for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          unreadCount:
            data[0].unreadCount,

        });

    }
  );

};

// DELETE NOTIFICATION
export const deleteNotification = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const notificationId =
    req.params.id;

  const q = `
    DELETE FROM notifications

    WHERE
      id = ?
      AND receiverId = ?
  `;

  db.query(
    q,
    [
      notificationId,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to delete notification ${notificationId}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Notification not found."
          )
        );

      }

      logger.info(
        `Notification ${notificationId} deleted by user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(
          "Notification deleted."
        );

    }
  );

};

// DELETE ALL NOTIFICATIONS
export const deleteAllNotifications = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    DELETE FROM notifications

    WHERE receiverId = ?
  `;

  db.query(
    q,
    [userInfo.id],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to delete notifications for user ${userInfo.id}: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `${data.affectedRows} notifications deleted for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          message:
            "All notifications deleted.",

          deleted:
            data.affectedRows,

        });

    }
  );

};

// GET RECENT NOTIFICATIONS
export const getRecentNotifications = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    SELECT

      n.id,

      n.type,

      n.postId,

      n.createdAt,

      n.isRead,

      u.id AS senderId,

      u.name,

      u.username,

      u.profilePic

    FROM notifications n

    JOIN users u
    ON u.id = n.senderId

    WHERE
      n.receiverId = ?

    ORDER BY
      n.createdAt DESC

    LIMIT 5
  `;

  db.query(
    q,
    [userInfo.id],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch recent notifications: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Recent notifications fetched for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};
























// import { db } from "../connect.js";

// import logger
// from "../utils/logger.js";

// // GET NOTIFICATIONS
// export const getNotifications = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 15;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 
//       n.id,
//       n.type,
//       n.postId,
//       n.createdAt,
//       n.isRead,

//       u.id AS senderId,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM notifications n

//     JOIN users u
//     ON u.id = n.senderId

//     WHERE n.receiverId = ?

//     ORDER BY n.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
//       userInfo.id,
//       limit,
//       offset,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch notifications for user ${userInfo.id}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Notifications fetched for user ${userInfo.id}`
//       );

//       return res
//         .status(200)
//         .json({
//           page,
//           limit,
//           results:
//             data.length,

//           notifications:
//             data,
//         });

//     }
//   );

// };

// // MARK SINGLE NOTIFICATION AS READ
// export const markNotificationAsRead = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const notificationId =
//     req.params.id;

//   const q = `
//     UPDATE notifications

//     SET isRead = 1

//     WHERE id = ?
//     AND receiverId = ?
//   `;

//   db.query(
//     q,
//     [
//       notificationId,
//       userInfo.id,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to mark notification ${notificationId} as read: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       if (
//         data.affectedRows === 0
//       ) {

//         logger.warn(
//           `Notification ${notificationId} not found for user ${userInfo.id}`
//         );

//         return res
//           .status(404)
//           .json(
//             "Notification not found."
//           );

//       }

//       logger.info(
//         `Notification ${notificationId} marked as read by user ${userInfo.id}`
//       );

//       return res
//         .status(200)
//         .json(
//           "Notification marked as read."
//         );

//     }
//   );

// };

// // MARK ALL NOTIFICATIONS AS READ
// export const markAllNotificationsAsRead = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const q = `
//     UPDATE notifications

//     SET isRead = 1

//     WHERE receiverId = ?
//   `;

//   db.query(
//     q,
//     [userInfo.id],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to mark all notifications as read for user ${userInfo.id}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `${data.affectedRows} notifications marked as read for user ${userInfo.id}`
//       );

//       return res
//         .status(200)
//         .json({
//           message:
//             "All notifications marked as read.",

//           updatedNotifications:
//             data.affectedRows,
//         });

//     }
//   );

// };

// // GET UNREAD NOTIFICATION COUNT
// export const getUnreadNotificationsCount = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const q = `
//     SELECT COUNT(*) AS unreadCount

//     FROM notifications

//     WHERE receiverId = ?
//     AND isRead = 0
//   `;

//   db.query(
//     q,
//     [userInfo.id],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch unread notification count for user ${userInfo.id}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Unread notification count fetched for user ${userInfo.id}`
//       );

//       return res
//         .status(200)
//         .json({
//           unreadCount:
//             data[0].unreadCount,
//         });

//     }
//   );

// };


































// import { db } from "../connect.js";

// export const getNotifications = (req, res) => {

//   const userInfo = req.userInfo;

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 15;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 
//       n.id,
//       n.type,
//       n.postId,
//       n.createdAt,
//       n.isRead,

//       u.id AS senderId,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM notifications n

//     JOIN users u
//     ON u.id = n.senderId

//     WHERE n.receiverId = ?

//     ORDER BY n.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [
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
//         notifications: data,
//       });

//     }
//   );

// };

// export const markNotificationAsRead = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     UPDATE notifications
//     SET isRead = 1
//     WHERE id = ?
//     AND receiverId = ?
//   `;

//   db.query(
//     q,
//     [req.params.id, userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.affectedRows === 0) {

//         return res
//           .status(404)
//           .json("Notification not found.");

//       }

//       return res
//         .status(200)
//         .json("Notification marked as read.");

//     }
//   );

// };

// export const markAllNotificationsAsRead = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     UPDATE notifications
//     SET isRead = 1
//     WHERE receiverId = ?
//   `;

//   db.query(
//     q,
//     [userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json({
//         message:
//           "All notifications marked as read.",
//         updatedNotifications:
//           data.affectedRows,
//       });

//     }
//   );

// };

// export const getUnreadNotificationsCount = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     SELECT COUNT(*) AS unreadCount
//     FROM notifications
//     WHERE receiverId = ?
//     AND isRead = 0
//   `;

//   db.query(
//     q,
//     [userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json({
//         unreadCount:
//           data[0].unreadCount,
//       });

//     }
//   );

// };








































// import { db } from "../connect.js";

// export const getNotifications = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     SELECT 
//       n.id,
//       n.type,
//       n.postId,
//       n.createdAt,
//       n.isRead,

//       u.id AS senderId,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM notifications n

//     JOIN users u
//     ON u.id = n.senderId

//     WHERE n.receiverId = ?

//     ORDER BY n.createdAt DESC
//   `;

//   db.query(q, [userInfo.id], (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };

// export const markNotificationAsRead = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     UPDATE notifications
//     SET isRead = 1
//     WHERE id = ?
//     AND receiverId = ?
//   `;

//   db.query(
//     q,
//     [req.params.id, userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res
//         .status(200)
//         .json("Notification marked as read.");

//     }
//   );

// };

// export const markAllNotificationsAsRead = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     UPDATE notifications
//     SET isRead = 1
//     WHERE receiverId = ?
//   `;

//   db.query(
//     q,
//     [userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res
//         .status(200)
//         .json("All notifications marked as read.");

//     }
//   );

// };

// export const getUnreadNotificationsCount = (req, res) => {

//   const userInfo = req.userInfo;

//   const q = `
//     SELECT COUNT(*) AS unreadCount
//     FROM notifications
//     WHERE receiverId = ?
//     AND isRead = 0
//   `;

//   db.query(
//     q,
//     [userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json({
//         unreadCount:
//           data[0].unreadCount,
//       });

//     }
//   );

// };









































































































































































































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";

// export const getNotifications = (req, res) => {

//   const token = req.cookies.accessToken;

//   if (!token) {
//     return res.status(401).json("Not logged in!");
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {

//     if (err) {
//       return res.status(403).json("Token is not valid!");
//     }

//     const q = `
//       SELECT 
//         n.id,
//         n.type,
//         n.postId,
//         n.createdAt,
//         n.isRead,

//         u.id AS senderId,
//         u.name,
//         u.username,
//         u.profilePic

//       FROM notifications n

//       JOIN users u
//       ON u.id = n.senderId

//       WHERE n.receiverId = ?

//       ORDER BY n.createdAt DESC
//     `;

//     db.query(q, [userInfo.id], (err, data) => {

//       if (err) {
//         return res.status(500).json(err);
//       }

//       return res.status(200).json(data);
//     });
//   });
// };
























































// import { db } from "../connect.js";

// export const getNotifications = (req, res) => {

//   const q = `
//     SELECT n.*, u.name
//     FROM notifications n
//     JOIN users u ON u.id = n.senderId
//     WHERE n.receiverId = ?
//     ORDER BY n.createdAt DESC
//   `;

//   db.query(q, [req.params.userId], (err, data) => {
//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };