import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logAudit,
} from "../utils/auditLogger.js";

// BAN USER
export const banUser = (
  req,
  res,
  next
) => {

  const q = `
    UPDATE users
    SET isBanned = 1
    WHERE id = ?
  `;

  db.query(
    q,
    [req.params.id],

    (err, data) => {

      if (err)
        return next(err);

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "User not found."
          )
        );

      }

      logAudit(
        req.userInfo.id,
        "BAN_USER",
        "user",
        req.params.id,
        "User account banned"
      );

      logger.info(
        `Admin ${req.userInfo.id} banned user ${req.params.id}`
      );

      return res
        .status(200)
        .json("User banned.");

    }
  );

};

// UNBAN USER
export const unbanUser = (
  req,
  res,
  next
) => {

  const q = `
    UPDATE users
    SET isBanned = 0
    WHERE id = ?
  `;

  db.query(
    q,
    [req.params.id],

    (err, data) => {

      if (err)
        return next(err);

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "User not found."
          )
        );

      }

      logAudit(
        req.userInfo.id,
        "UNBAN_USER",
        "user",
        req.params.id,
        "User account restored"
      );

      logger.info(
        `Admin ${req.userInfo.id} unbanned user ${req.params.id}`
      );

      return res
        .status(200)
        .json("User unbanned.");

    }
  );

};

// DASHBOARD STATS
export const getDashboardStats = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      (SELECT COUNT(*) FROM users)
      AS totalUsers,

      (SELECT COUNT(*) FROM posts)
      AS totalPosts,

      (SELECT COUNT(*) FROM comments)
      AS totalComments,

      (SELECT COUNT(*) FROM likes)
      AS totalLikes,

      (SELECT COUNT(*) FROM messages)
      AS totalMessages,

      (SELECT COUNT(*) FROM conversations)
      AS totalConversations,

      (SELECT COUNT(*) FROM reports)
      AS totalReports
  `;

  db.query(
    q,

    (err, data) => {

      if (err)
        return next(err);

      logger.info(
        `Admin ${req.userInfo.id} viewed dashboard`
      );

      return res
        .status(200)
        .json(data[0]);

    }
  );

};

// GET ALL USERS
export const getAllUsers = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      id,
      name,
      username,
      email,
      role,
      isBanned,
      createdAt

    FROM users

    ORDER BY id DESC
  `;

  db.query(
    q,

    (err, data) => {

      if (err)
        return next(err);

      return res
        .status(200)
        .json(data);

    }
  );

};

// DELETE ANY POST
export const deleteAnyPost = (
  req,
  res,
  next
) => {

  const q =
    "DELETE FROM posts WHERE id = ?";

  db.query(
    q,
    [req.params.id],

    (err, data) => {

      if (err)
        return next(err);

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Post not found."
          )
        );

      }

      logAudit(
        req.userInfo.id,
        "DELETE_POST",
        "post",
        req.params.id,
        "Post removed by moderator/admin"
      );

      logger.info(
        `Post ${req.params.id} deleted by admin ${req.userInfo.id}`
      );

      return res
        .status(200)
        .json("Post deleted.");

    }
  );

};

// DELETE ANY COMMENT
export const deleteAnyComment = (
  req,
  res,
  next
) => {

  const q =
    "DELETE FROM comments WHERE id = ?";

  db.query(
    q,
    [req.params.id],

    (err, data) => {

      if (err)
        return next(err);

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Comment not found."
          )
        );

      }

      logAudit(
        req.userInfo.id,
        "DELETE_COMMENT",
        "comment",
        req.params.id,
        "Comment removed by moderator/admin"
      );

      logger.info(
        `Comment ${req.params.id} deleted by admin ${req.userInfo.id}`
      );

      return res
        .status(200)
        .json("Comment deleted.");

    }
  );

};





















































// import { db }
// from "../connect.js";

// import logger
// from "../utils/logger.js";

// import ApiError
// from "../utils/ApiError.js";

// // BAN USER



// export const banUser = (
//   req,
//   res,
//   next
// ) => {

//   const q = `
//     UPDATE users
//     SET isBanned = 1
//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [req.params.id],

//     (err, data) => {

//       if (err)
//         return next(err);

//       if (
//         data.affectedRows === 0
//       ) {

//         return next(
//           new ApiError(
//             404,
//             "User not found."
//           )
//         );

//       }

//       logger.info(
//         `User ${req.params.id} banned`
//       );

//       return res
//         .status(200)
//         .json(
//           "User banned."
//         );

//     }
//   );

// };

// export const unbanUser = (
//   req,
//   res,
//   next
// ) => {

//   const q = `
//     UPDATE users
//     SET isBanned = 0
//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [req.params.id],

//     (err, data) => {

//       if (err)
//         return next(err);

//       if (
//         data.affectedRows === 0
//       ) {

//         return next(
//           new ApiError(
//             404,
//             "User not found."
//           )
//         );

//       }

//       logger.info(
//         `User ${req.params.id} unbanned`
//       );

//       return res
//         .status(200)
//         .json(
//           "User unbanned."
//         );

//     }
//   );

// };

// export const getDashboardStats = (
//   req,
//   res,
//   next
// ) => {

//   const q = `
//     SELECT

//       (SELECT COUNT(*)
//        FROM users)
//        AS totalUsers,

//       (SELECT COUNT(*)
//        FROM posts)
//        AS totalPosts,

//       (SELECT COUNT(*)
//        FROM comments)
//        AS totalComments,

//       (SELECT COUNT(*)
//        FROM likes)
//        AS totalLikes,

//       (SELECT COUNT(*)
//        FROM messages)
//        AS totalMessages,

//       (SELECT COUNT(*)
//        FROM conversations)
//        AS totalConversations
//   `;

//   db.query(
//     q,

//     (err, data) => {

//       if (err)
//         return next(err);

//       logger.info(
//         "Admin dashboard viewed"
//       );

//       return res
//         .status(200)
//         .json(data[0]);

//     }
//   );

// };


// export const getAllUsers = (
//   req,
//   res,
//   next
// ) => {

//   const q = `
//     SELECT

//       id,
//       name,
//       username,
//       email,
//       role,
//       isBanned,
//       createdAt

//     FROM users

//     ORDER BY id DESC
//   `;

//   db.query(
//     q,

//     (err, data) => {

//       if (err)
//         return next(err);

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };


// export const deleteAnyPost = (
//   req,
//   res,
//   next
// ) => {

//   const q =
//     "DELETE FROM posts WHERE id=?";

//   db.query(
//     q,
//     [req.params.id],

//     (err,data) => {

//       if(err)
//         return next(err);

//       logger.info(
//         `Admin deleted post ${req.params.id}`
//       );

//       res
//         .status(200)
//         .json(
//           "Post deleted."
//         );

//     }
//   );

// };


// export const deleteAnyComment = (
//   req,
//   res,
//   next
// ) => {

//   const q =
//     "DELETE FROM comments WHERE id=?";

//   db.query(
//     q,
//     [req.params.id],

//     (err,data) => {

//       if(err)
//         return next(err);

//       logger.info(
//         `Admin deleted comment ${req.params.id}`
//       );

//       res
//         .status(200)
//         .json(
//           "Comment deleted."
//         );

//     }
//   );

// };

// export const banUser =
// (req,res,next) => {

//   const q = `
//     UPDATE users
//     SET isBanned = 1
//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [req.params.id],

//     (err,data) => {

//       if(err)
//         return next(err);

//       logger.info(
//         `User ${req.params.id} banned`
//       );

//       res.status(200)
//       .json(
//         "User banned."
//       );

//     }
//   );

// };