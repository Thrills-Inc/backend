import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// GLOBAL SEARCH
export const searchAll = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const search =
    req.query.q?.trim();

  if (!search) {

    return next(
      new ApiError(
        400,
        "Search query is required."
      )
    );

  }

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

  const value =
    `%${search}%`;

  const q = `
    (
      SELECT

        'user' AS type,

        u.id,

        u.username
        AS title,

        u.name
        AS subtitle,

        u.profilePic
        AS image

      FROM users u

      WHERE

        u.username LIKE ?

        OR

        u.name LIKE ?
    )

    UNION ALL

    (
      SELECT

        'post' AS type,

        p.id,

        p.desc
        AS title,

        NULL
        AS subtitle,

        p.img
        AS image

      FROM posts p

      WHERE
        p.desc LIKE ?
    )

    UNION ALL

    (
      SELECT

        'hashtag' AS type,

        h.id,

        h.tag
        AS title,

        NULL
        AS subtitle,

        NULL
        AS image

      FROM hashtags h

      WHERE
        h.tag LIKE ?
    )

    LIMIT ?
    OFFSET ?
  `;

  db.query(
    q,
    [
      value,
      value,
      value,
      value,
      limit,
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Global search failed: ${err.message}`
        );

        return next(err);

      }

      try {

        if (userInfo) {

          logActivity(
            userInfo.id,
            "search",
            search
          );

        }

      } catch (error) {

        logger.warn(
          `Search activity log failed: ${error.message}`
        );

      }

      logger.info(
        `Search performed: "${search}"`
      );

      return res
        .status(200)
        .json({

          query:
            search,

          page,

          limit,

          results:
            data.length,

          data,

        });

    }
  );

};

// SEARCH USERS
export const searchUsers = (
  req,
  res,
  next
) => {

  const search =
    req.query.q?.trim();

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

      id,

      name,

      username,

      profilePic

    FROM users

    WHERE

      username LIKE ?

      OR

      name LIKE ?

    LIMIT 20
  `;

  const value =
    `%${search}%`;

  db.query(
    q,
    [
      value,
      value,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `User search failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `User search: ${search}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// SEARCH POSTS
export const searchPosts = (
  req,
  res,
  next
) => {

  const search =
    req.query.q?.trim();

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

      p.*,

      u.name,

      u.username,

      u.profilePic

    FROM posts p

    JOIN users u
    ON u.id = p.userId

    WHERE
      p.desc LIKE ?

    ORDER BY
      p.createdAt DESC

    LIMIT 20
  `;

  db.query(
    q,
    [`%${search}%`],

    (err, data) => {

      if (err) {

        logger.error(
          `Post search failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Post search: ${search}`
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
    req.query.q?.trim();

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
        `Hashtag search: ${search}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// TRENDING SEARCHES
export const getTrendingSearches = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      targetId
      AS keyword,

      COUNT(*)
      AS searches

    FROM activities

    WHERE action = 'search'

    GROUP BY targetId

    ORDER BY searches DESC

    LIMIT 10
  `;

  db.query(
    q,

    (err, data) => {

      if (err) {

        logger.error(
          `Trending searches failed: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        "Trending searches loaded"
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

// // GLOBAL SEARCH
// export const searchAll = (
//   req,
//   res
// ) => {

//   const q =
//     req.query.q;

//   // VALIDATION
//   if (
//     !q ||
//     q.trim() === ""
//   ) {

//     logger.warn(
//       "Empty search query attempted"
//     );

//     return res
//       .status(400)
//       .json(
//         "Search query is required."
//       );

//   }

//   const searchQuery = `
//     SELECT 
//       'user' AS type,
//       id,
//       username AS title

//     FROM users

//     WHERE username LIKE ?

//     UNION

//     SELECT 
//       'post' AS type,
//       id,
//       \`desc\` AS title

//     FROM posts

//     WHERE \`desc\` LIKE ?

//     UNION

//     SELECT 
//       'hashtag' AS type,
//       id,
//       tag AS title

//     FROM hashtags

//     WHERE tag LIKE ?
//   `;

//   const value =
//     `%${q}%`;

//   db.query(
//     searchQuery,
//     [
//       value,
//       value,
//       value,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Search failed for query "${q}": ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Search performed for query "${q}"`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };








































// import { db } from "../connect.js";

// export const searchAll = (req, res) => {

//   const q = req.query.q;

//   const searchQuery = `
//     SELECT 'user' AS type, id, username AS title
//     FROM users
//     WHERE username LIKE ?

//     UNION

//     SELECT 'post' AS type, id, \`desc\` AS title
//     FROM posts
//     WHERE \`desc\` LIKE ?

//     UNION

//     SELECT 'hashtag' AS type, id, tag AS title
//     FROM hashtags
//     WHERE tag LIKE ?
//   `;

//   const value = `%${q}%`;

//   db.query(
//     searchQuery,
//     [value, value, value],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json(data);
//     }
//   );
// };




// A better search.js

// import { db } from "../connect.js";

// import logger
// from "../utils/logger.js";

// import ApiError
// from "../utils/ApiError.js";

// export const searchAll = (
// req,
// res,
// next
// ) => {

// const userInfo =
// req.userInfo;

// const search =
// req.query.q;

// if (
// !search ||
// search.trim() === ""
// ) {

// return next(
//   new ApiError(
//     400,
//     "Search query is required."
//   )
// );

// }

// const value =
// %${search}%;

// const searchQuery = `

// SELECT

//   'user' AS type,

//   u.id,

//   u.username AS title

// FROM users u

// WHERE

//   u.username LIKE ?

//   AND NOT EXISTS (

//     SELECT 1

//     FROM blocked_users b

//     WHERE

//     (
//       b.blockerId = ?
//       AND b.blockedId = u.id
//     )

//     OR

//     (
//       b.blockedId = ?
//       AND b.blockerId = u.id
//     )

//   )

// UNION

// SELECT

//   'post' AS type,

//   id,

//   \`desc\` AS title

// FROM posts

// WHERE \`desc\` LIKE ?

// UNION

// SELECT

//   'hashtag' AS type,

//   id,

//   tag AS title

// FROM hashtags

// WHERE tag LIKE ?

// `;

// db.query(

// searchQuery,

// [

//   value,

//   userInfo.id,
//   userInfo.id,

//   value,

//   value,

// ],

// (err, data) => {

//   if (err) {

//     logger.error(
//       `Search failed: ${err.message}`
//     );

//     return next(err);

//   }

//   logger.info(
//     `User ${userInfo.id} searched for "${search}"`
//   );

//   return res
//     .status(200)
//     .json(data);

// }

// );

// };