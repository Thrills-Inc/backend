import { db } from "../connect.js";

import logger
from "../utils/logger.js";

// import ApiError
// from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// DISCOVER POSTS
// DISCOVER POSTS
export const getDiscoverPosts = (
  req,
  res,
  next
) => {

  const page =
    parseInt(req.query.page) || 1;

  const limit =
    parseInt(req.query.limit) || 20;

  const offset =
    (page - 1) * limit;

  const q = `
    SELECT

      p.*,

      u.id AS userId,

      u.name,

      u.username,

      u.profilePic,

      COUNT(
        DISTINCT l.id
      ) AS likesCount,

      COUNT(
        DISTINCT c.id
      ) AS commentsCount,

      (
        COUNT(
          DISTINCT l.id
        ) +
        COUNT(
          DISTINCT c.id
        )
      ) AS engagementScore

    FROM posts p

    JOIN users u
    ON u.id = p.userId

    LEFT JOIN likes l
    ON l.postId = p.id

    LEFT JOIN comments c
    ON c.postId = p.id

    GROUP BY p.id

    ORDER BY
      engagementScore DESC,
      p.createdAt DESC

    LIMIT ?
    OFFSET ?
  `;

  db.query(
    q,
    [
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Discover feed failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        "Discover feed loaded"
      );

      return res
        .status(200)
        .json({

          page,

          limit,

          results:
            data.length,

          posts:
            data,

        });

    }
  );

};


// PERSONALIZED FEED
export const getPersonalizedFeed = (
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

      DISTINCT p.*,

      u.id AS userId,

      u.name,

      u.username,

      u.profilePic

    FROM posts p

    JOIN users u
    ON u.id = p.userId

    JOIN interests i
    ON i.category = p.category

    WHERE
      i.userId = ?

      AND NOT EXISTS (

      SELECT 1

      FROM blocked_users b

      WHERE

      (
        b.blockerId = ?
        AND b.blockedId = p.userId
      )

      OR

      (
        b.blockedId = ?
        AND b.blockerId = p.userId
      )

    )

    ORDER BY
      p.createdAt DESC

    LIMIT ?
    OFFSET ?
  `;

  db.query(
    q,
    [
      // userId,
      // userId,
      // userId,
      userInfo.id,
      userInfo.id,
      userInfo.id,
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Personalized feed failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Personalized feed loaded for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json({

          page,

          limit,

          results:
            data.length,

          posts:
            data,

        });

    }
  );

};

// TRENDING CREATORS
export const getTrendingCreators = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      u.id,

      u.name,

      u.username,

      u.profilePic,

      COUNT(
        DISTINCT p.id
      ) AS postsCount,

      COUNT(
        DISTINCT r.followerUserId
      ) AS followersCount

    FROM users u

    LEFT JOIN posts p
    ON p.userId = u.id

    LEFT JOIN relationships r
    ON r.followedUserId = u.id

    GROUP BY u.id

    ORDER BY
      followersCount DESC,
      postsCount DESC

    LIMIT 10
  `;

  db.query(
    q,

    (err, data) => {

      if (err) {

        logger.error(
          `Trending creators failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        "Trending creators loaded"
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// EXPLORE HASHTAGS
export const getExploreHashtags = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      h.tag,

      COUNT(
        ph.hashtagId
      ) AS totalPosts

    FROM hashtags h

    JOIN post_hashtags ph
    ON ph.hashtagId = h.id

    GROUP BY h.id

    ORDER BY
      totalPosts DESC

    LIMIT 20
  `;

  db.query(
    q,

    (err, data) => {

      if (err) {

        logger.error(
          `Explore hashtags failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        "Trending hashtags loaded"
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// LOG DISCOVER VISIT
export const trackDiscoverVisit = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  try {

    logActivity(
      userInfo.id,
      "discover_visit",
      null
    );

    logger.info(
      `Discover visited by user ${userInfo.id}`
    );

    return res
      .status(200)
      .json(
        "Visit tracked."
      );

  } catch (err) {

    return next(err);

  }

};
































// import { db } from "../connect.js";

// import logger
// from "../utils/logger.js";

// // GET DISCOVER POSTS
// export const getDiscoverPosts = (
//   req,
//   res
// ) => {

//   const q = `
//     SELECT 
//       posts.*, 
//       users.name, 
//       users.profilePic

//     FROM posts

//     JOIN users
//     ON users.id = posts.userId

//     ORDER BY posts.createdAt DESC

//     LIMIT 20
//   `;

//   db.query(
//     q,

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch discover posts: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Discover posts fetched successfully`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };

// // GET PERSONALIZED FEED
// export const getPersonalizedFeed = (
//   req,
//   res
// ) => {

//   const userId =
//     req.user.id;

//   const q = `
//     SELECT 
//       posts.*, 
//       users.name, 
//       users.profilePic

//     FROM posts

//     JOIN interests
//       ON posts.category = interests.category

//     JOIN users
//       ON users.id = posts.userId

//     WHERE interests.userId = ?

//     ORDER BY posts.createdAt DESC
//   `;

//   db.query(
//     q,
//     [userId],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch personalized feed for user ${userId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Personalized feed fetched for user ${userId}`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };







































// import { db } from "../connect.js";

// export const getDiscoverPosts = (req, res) => {

//   const q = `
//     SELECT posts.*, users.name, users.profilePic
//     FROM posts
//     JOIN users ON users.id = posts.userId
//     ORDER BY posts.createdAt DESC
//     LIMIT 20
//   `;

//   db.query(q, (err, data) => {
//     if(err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });

// };

// export const getPersonalizedFeed = (req, res) => {

//   const userId = req.user.id;

//   const q = `
//     SELECT posts.*, users.name, users.profilePic
//     FROM posts
//     JOIN interests
//       ON posts.category = interests.category
//     JOIN users
//       ON users.id = posts.userId
//     WHERE interests.userId = ?
//     ORDER BY posts.createdAt DESC
//   `;

//   db.query(q, [userId], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };
















































































// import { db } from "../connect.js";
// import { verifyToken } from "../middleware/auth.js";

// export const getDiscoverPosts = (req, res) => {

//   const q = `
//     SELECT posts.*, users.name, users.profilePic
//     FROM posts
//     JOIN users ON users.id = posts.userId
//     ORDER BY posts.createdAt DESC
//     LIMIT 20
//   `;

//   db.query(q, (err, data) => {
//     if(err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });

// };

// export const getPersonalizedFeed = (req, res) => {
//   const userId = req.params.userId;

//   const q = `
//     SELECT posts.*
//     FROM posts
//     JOIN interests
//     ON posts.category = interests.category
//     WHERE interests.userId = ?
//     ORDER BY posts.createdAt DESC
//   `;

//   db.query(q, [userId], (err, data) => {
//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };











