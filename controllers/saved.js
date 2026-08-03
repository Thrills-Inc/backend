import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// SAVE POST
export const savePost = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const postId =
    req.body.postId;

  if (!postId) {

    return next(
      new ApiError(
        400,
        "Post ID is required."
      )
    );

  }

  // CHECK IF ALREADY SAVED
  const checkQuery = `
    SELECT *

    FROM saved_posts

    WHERE
      userId = ?
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
          `Save post check failed: ${err.message}`
        );

        return next(err);

      }

      if (data.length > 0) {

        logger.warn(
          `User ${userInfo.id} attempted to save post ${postId} twice`
        );

        return next(
          new ApiError(
            400,
            "Post already saved."
          )
        );

      }

      const q = `
        INSERT INTO saved_posts
        (
          userId,
          postId
        )
        VALUES (?, ?)
      `;

      db.query(
        q,
        [
          userInfo.id,
          postId,
        ],

        (err, result) => {

          if (err) {

            logger.error(
              `Failed to save post: ${err.message}`
            );

            return next(err);

          }

          // ACTIVITY LOG
          logActivity(
            userInfo.id,
            "save_post",
            postId
          );

          logger.info(
            `User ${userInfo.id} saved post ${postId}`
          );

          return res
            .status(201)
            .json({

              message:
                "Post saved.",

              saveId:
                result.insertId,

            });

        }
      );

    }
  );

};

// GET SAVED POSTS
export const getSavedPosts = (
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

      p.*,

      u.id AS userId,

      u.name,

      u.username,

      u.profilePic,

      s.createdAt
      AS savedAt

    FROM saved_posts s

    JOIN posts p
    ON p.id = s.postId

    JOIN users u
    ON u.id = p.userId

    WHERE
      s.userId = ?

    ORDER BY
      s.createdAt DESC

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
          `Failed to fetch saved posts: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Saved posts fetched for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          page,

          limit,

          results:
            data.length,

          savedPosts:
            data,

        });

    }
  );

};

// REMOVE SAVED POST
export const removeSavedPost = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const postId =
    req.params.postId;

  const q = `
    DELETE FROM saved_posts

    WHERE
      userId = ?
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
          `Failed to remove saved post: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Saved post not found."
          )
        );

      }

      logger.info(
        `User ${userInfo.id} removed saved post ${postId}`
      );

      return res
        .status(200)
        .json(
          "Saved post removed."
        );

    }
  );

};

// CHECK IF POST IS SAVED
export const isPostSaved = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const postId =
    req.params.postId;

  const q = `
    SELECT id

    FROM saved_posts

    WHERE
      userId = ?
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
          `Failed to check saved post: ${err.message}`
        );

        return next(err);

      }

      return res
        .status(200)
        .json({

          saved:
            data.length > 0,

        });

    }
  );

};

// GET SAVED POSTS COUNT
export const getSavedPostsCount = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    SELECT
      COUNT(*) AS total

    FROM saved_posts

    WHERE userId = ?
  `;

  db.query(
    q,
    [userInfo.id],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch saved posts count: ${err.message}`
        );

        return next(err);

      }

      return res
        .status(200)
        .json({

          total:
            data[0].total,

        });

    }
  );

};






























// import { db } from "../connect.js";

// import logger
// from "../utils/logger.js";

// // SAVE POST
// export const savePost = (
//   req,
//   res
// ) => {

//   const q = `
//     INSERT INTO saved_posts
//     (\`userId\`, \`postId\`)
//     VALUES (?, ?)
//   `;

//   db.query(
//     q,
//     [
//       req.body.userId,
//       req.body.postId,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to save post ${req.body.postId} for user ${req.body.userId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `User ${req.body.userId} saved post ${req.body.postId}`
//       );

//       return res
//         .status(200)
//         .json("Post saved.");

//     }
//   );

// };

// // GET SAVED POSTS
// export const getSavedPosts = (
//   req,
//   res
// ) => {

//   const userId =
//     req.params.userId;

//   const q = `
//     SELECT p.*

//     FROM saved_posts s

//     JOIN posts p
//     ON p.id = s.postId

//     WHERE s.userId = ?

//     ORDER BY s.createdAt DESC
//   `;

//   db.query(
//     q,
//     [userId],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch saved posts for user ${userId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Saved posts fetched for user ${userId}`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };

// // REMOVE SAVED POST
// export const removeSavedPost = (
//   req,
//   res
// ) => {

//   const postId =
//     req.params.postId;

//   const userId =
//     req.params.userId;

//   const q = `
//     DELETE FROM saved_posts

//     WHERE postId = ?
//     AND userId = ?
//   `;

//   db.query(
//     q,
//     [
//       postId,
//       userId,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to remove saved post ${postId} for user ${userId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `User ${userId} removed saved post ${postId}`
//       );

//       return res
//         .status(200)
//         .json(
//           "Saved post removed."
//         );

//     }
//   );

// };















































// import { db } from "../connect.js";

// export const savePost = (req, res) => {

//   const q =
//     "INSERT INTO saved_posts(`userId`, `postId`) VALUES (?, ?)";

//   db.query(
//     q,
//     [req.body.userId, req.body.postId],
//     (err, data) => {

//       if (err) return res.status(500).json(err);

//       return res.status(200).json("Post saved.");
//     }
//   );
// };

// export const getSavedPosts = (req, res) => {

//   const q = `
//     SELECT p.*
//     FROM saved_posts s
//     JOIN posts p
//     ON p.id = s.postId
//     WHERE s.userId = ?
//     ORDER BY s.createdAt DESC
//   `;

//   db.query(q, [req.params.userId], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };

// export const removeSavedPost = (req, res) => {

//   const q =
//     "DELETE FROM saved_posts WHERE postId = ? AND userId = ?";

//   db.query(
//     q,
//     [req.params.postId, req.params.userId],
//     (err, data) => {

//       if (err) return res.status(500).json(err);

//       return res.status(200).json("Saved post removed.");
//     }
//   );
// };