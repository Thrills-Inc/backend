import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// GET POSTS BY HASHTAG
export const getPostsByHashtag = (
  req,
  res,
  next
) => {

  const tag =
    req.params.tag;

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

      u.profilePic

    FROM posts p

    JOIN users u
    ON u.id = p.userId

    JOIN post_hashtags ph
    ON p.id = ph.postId

    JOIN hashtags h
    ON h.id = ph.hashtagId

    WHERE
      LOWER(h.tag) = LOWER(?)

    ORDER BY
      p.createdAt DESC

    LIMIT ?
    OFFSET ?
  `;

  db.query(
    q,
    [
      tag,
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch hashtag posts: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Posts fetched for hashtag #${tag}`
      );

      return res
        .status(200)
        .json({

          hashtag:
            tag,

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

// TRENDING HASHTAGS
export const getTrendingHashtags = (
  req,
  res,
  next
) => {

  const limit =
    parseInt(
      req.query.limit
    ) || 20;

  const q = `
    SELECT

      h.id,

      h.tag,

      COUNT(
        ph.postId
      ) AS totalPosts

    FROM hashtags h

    JOIN post_hashtags ph
    ON ph.hashtagId = h.id

    GROUP BY h.id

    ORDER BY
      totalPosts DESC

    LIMIT ?
  `;

  db.query(
    q,
    [limit],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch trending hashtags: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        "Trending hashtags fetched"
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// SEARCH HASHTAGS
export const searchHashtags = (
  req,
  res,
  next
) => {

  const search =
    req.query.q;

  if (!search) {

    return next(
      new ApiError(
        400,
        "Search query is required."
      )
    );

  }

  const q = `
    SELECT

      h.id,

      h.tag,

      COUNT(
        ph.postId
      ) AS totalPosts

    FROM hashtags h

    LEFT JOIN post_hashtags ph
    ON ph.hashtagId = h.id

    WHERE
      h.tag LIKE ?

    GROUP BY h.id

    ORDER BY
      totalPosts DESC

    LIMIT 20
  `;

  db.query(
    q,
    [`%${search}%`],

    (err, data) => {

      if (err) {

        logger.error(
          `Hashtag search failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Hashtag search performed: ${search}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// TRACK HASHTAG VISIT
export const trackHashtagVisit = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const tag =
    req.params.tag;

  try {

    logActivity(
      userInfo.id,
      "hashtag_visit",
      tag
    );

    logger.info(
      `User ${userInfo.id} visited hashtag #${tag}`
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

// // GET POSTS BY HASHTAG
// export const getPostsByHashtag = (
//   req,
//   res
// ) => {

//   const hashtag =
//     req.params.tag;

//   const q = `
//     SELECT p.*

//     FROM posts p

//     JOIN post_hashtags ph
//     ON p.id = ph.postId

//     JOIN hashtags h
//     ON h.id = ph.hashtagId

//     WHERE h.tag = ?
//   `;

//   db.query(
//     q,
//     [hashtag],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch posts for hashtag #${hashtag}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Posts fetched for hashtag #${hashtag}`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };































// import { db } from "../connect.js";

// export const getPostsByHashtag = (req, res) => {

//   const q = `
//     SELECT p.*
//     FROM posts p
//     JOIN post_hashtags ph ON p.id = ph.postId
//     JOIN hashtags h ON h.id = ph.hashtagId
//     WHERE h.tag = ?
//   `;

//   db.query(q, [req.params.tag], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };