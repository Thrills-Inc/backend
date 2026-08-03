import { db } from "../connect.js";

import moment from "moment";

import {
  extractHashtags,
} from "../utils/extractHashtags.js";

import logger
from "../utils/logger.js";

import ApiError from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// GET POSTS
export const getPosts = (
  req,
  res,
  next
) => {

  const userId =
    req.query.userId;

  const userInfo =
    req.userInfo;

  // PAGINATION
  const page =
    parseInt(req.query.page) || 1;

  const limit =
    parseInt(req.query.limit) || 10;

  const offset =
    (page - 1) * limit;

  let q;
  let values;

  // USER PROFILE POSTS
  if (userId) {

    q = `
      SELECT 
        p.*,
        u.id AS userId,
        u.name,
        u.username,
        u.profilePic

      FROM posts AS p

      JOIN users AS u
      ON u.id = p.userId

      WHERE p.userId = ?

      ORDER BY p.createdAt DESC

      LIMIT ? OFFSET ?
    `;

    values = [
      userId,
      limit,
      offset,
    ];

  }

  // FEED POSTS
  else {

    q = `
      SELECT 
        p.*,
        u.id AS userId,
        u.name,
        u.username,
        u.profilePic

      FROM posts AS p

      JOIN users AS u
      ON u.id = p.userId

      WHERE
        p.userId = ?

        OR p.userId IN (
          SELECT followedUserId
          FROM relationships
          WHERE followerUserId = ?
        )
        )

        AND NOT EXISTS(
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

      ORDER BY p.createdAt DESC

      LIMIT ? OFFSET ?
    `;

    values = [
      userInfo.id,
      userInfo.id,

      userInfo.id,
      userInfo.id,

      limit,
      offset,
    ];

  }

  db.query(
    q,
    values,

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch posts: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Posts fetched successfully`
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

// ADD POST
export const addPost = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

    if (
    !req.body.desc &&
    !req.body.img
  ) {

    logger.warn(
      `Empty post attempt by user ${userInfo.id}`
    );

    return next(
      new ApiError(
        400,
        "Post cannot be empty."
      )
    );

  }

  const q = `
    INSERT INTO posts
    (\`desc\`, \`img\`, \`createdAt\`, \`userId\`)
    VALUES (?)
  `;

  const values = [
    req.body.desc,

    req.body.img,

    moment(Date.now()).format(
      "YYYY-MM-DD HH:mm:ss"
    ),

    userInfo.id,
  ];

  db.query(
    q,
    [values],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to create post: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Post created by user ${userInfo.id}`
      );

      logActivity(
  userInfo.id,
  "create_post",
  data.insertId
);

logger.info(
  `User ${userInfo.id} created post ${data.insertId}`
);

      // EXTRACT HASHTAGS
      const hashtags =
        extractHashtags(
          req.body.desc || ""
        );

      hashtags.forEach(
        (tag) => {

          const checkTagQuery = `
            SELECT *
            FROM hashtags
            WHERE tag = ?
          `;

          db.query(
            checkTagQuery,
            [tag],

            (err, tagData) => {

              if (err) {

                logger.error(
                  `Failed checking hashtag: ${err.message}`
                );

                return;

              }

              // TAG DOESN'T EXIST
              if (
                tagData.length === 0
              ) {

                const insertTagQuery = `
                  INSERT INTO hashtags(tag)
                  VALUES (?)
                `;

                db.query(
                  insertTagQuery,
                  [tag],

                  (err, result) => {

                    if (err) {

                      logger.error(
                        `Failed inserting hashtag: ${err.message}`
                      );

                      return;

                    }

                    const hashtagId =
                      result.insertId;

                    db.query(
                      `
                        INSERT INTO post_hashtags
                        (postId, hashtagId)
                        VALUES (?, ?)
                      `,
                      [
                        data.insertId,
                        hashtagId,
                      ]
                    );

                    logger.info(
                      `New hashtag #${tag} created`
                    );

                  }
                );

              }

              // TAG EXISTS
              else {

                const hashtagId =
                  tagData[0].id;

                db.query(
                  `
                    INSERT INTO post_hashtags
                    (postId, hashtagId)
                    VALUES (?, ?)
                  `,
                  [
                    data.insertId,
                    hashtagId,
                  ]
                );

                logger.info(
                  `Hashtag #${tag} attached to post ${data.insertId}`
                );

              }

            }
          );

        }
      
      );

      return res
        .status(200)
        .json(
          "Post has been created."
        );

    }
  );

};

// DELETE POST
export const deletePost = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    DELETE FROM posts
    WHERE \`id\` = ?
    AND \`userId\` = ?
  `;

  db.query(
    q,
    [
      req.params.id,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to delete post ${req.params.id}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows > 0
      ) {

        logger.info(
          `Post ${req.params.id} deleted by user ${userInfo.id}`
        );

        return res
          .status(200)
          .json(
            "Post has been deleted."
          );

      }

      logger.warn(
        `Unauthorized post delete attempt by user ${userInfo.id}`
      );

      return res
        .status(403)
        .json(
          "You can delete only your post"
        );

    }
  );

};

// GET TRENDING POSTS
export const getTrendingPosts = (
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
      p.*,
      u.name,
      u.username,
      u.profilePic,

      COUNT(DISTINCT l.id)
      AS likesCount,

      COUNT(DISTINCT c.id)
      AS commentsCount

    FROM posts p

    JOIN users u
    ON u.id = p.userId

    LEFT JOIN likes l
    ON l.postId = p.id

    LEFT JOIN comments c
    ON c.postId = p.id

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

    GROUP BY p.id

    ORDER BY
      (likesCount + commentsCount)
      DESC

    LIMIT ? OFFSET ?
  `;

  db.query(
    q,
    [
      req.userInfo.id,
      req.userInfo.id,


      limit, 
      offset,
    
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch trending posts: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Trending posts fetched`
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

// GET POSTS BY HASHTAG
export const getPostsByHashtag = (
  req,
  res,
  next
) => {

  const hashtag =
    req.params.tag;

  const q = `
    SELECT 
      p.*, 
      u.name,
      u.username,
      u.profilePic

    FROM posts p

    JOIN users u
    ON u.id = p.userId

    JOIN post_hashtags ph
    ON ph.postId = p.id

    JOIN hashtags h
    ON h.id = ph.hashtagId

    WHERE LOWER(h.tag) = LOWER(?)

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

    ORDER BY p.createdAt DESC
  `;

  db.query(
    q,
    [
      req.params.tag.toLowerCase(),
    
      req.userInfo.id,
      req.userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed fetching posts for hashtag #${req.params.tag}: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Posts fetched for hashtag #${req.params.tag}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// GET TRENDING HASHTAGS
export const getTrendingHashtags = (
  req,
  res,
  next
) => {

  const q = `
    SELECT 
      h.tag, 

      COUNT(ph.hashtagId)
      AS count

    FROM hashtags h

    JOIN post_hashtags ph
    ON h.id = ph.hashtagId

    GROUP BY h.id

    ORDER BY count DESC

    LIMIT 10
  `;

  db.query(
    q,

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch trending hashtags: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Trending hashtags fetched`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// GET EXPLORE POSTS
export const getExplorePosts = (
  req,
  res,
  next
) => {

  // PAGINATION
  const page =
    parseInt(req.query.page) || 1;

  const limit =
    parseInt(req.query.limit) || 20;

  const offset =
    (page - 1) * limit;

  const q = `
    SELECT
      p.*,
      u.name,
      u.username,
      u.profilePic,

      COUNT(DISTINCT l.id)
      AS likesCount,

      COUNT(DISTINCT c.id)
      AS commentsCount,

      (
        COUNT(DISTINCT l.id) +
        COUNT(DISTINCT c.id)
      ) AS engagementScore

    FROM posts p

    JOIN users u
    ON u.id = p.userId

    LEFT JOIN likes l
    ON l.postId = p.id

    LEFT JOIN comments c
    ON c.postId = p.id

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

    GROUP BY p.id

    ORDER BY
      engagementScore DESC,
      p.createdAt DESC

    LIMIT ? OFFSET ?
  `;

  db.query(
    q,
    [
      req.userInfo.id,
      req.userInfo.id,
      
      limit, 
      offset,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch explore posts: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Explore posts fetched`
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














































// import { db } from "../connect.js";
// import moment from "moment";
// import { extractHashtags } from "../utils/extractHashtags.js";

// export const getPosts = (req, res) => {

//   const userId = req.query.userId;

//   const userInfo = req.userInfo;

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 10;

//   const offset =
//     (page - 1) * limit;

//   let q;
//   let values;

//   // USER PROFILE POSTS
//   if (userId) {

//     q = `
//       SELECT 
//         p.*,
//         u.id AS userId,
//         u.name,
//         u.username,
//         u.profilePic

//       FROM posts AS p

//       JOIN users AS u
//       ON u.id = p.userId

//       WHERE p.userId = ?

//       ORDER BY p.createdAt DESC

//       LIMIT ? OFFSET ?
//     `;

//     values = [
//       userId,
//       limit,
//       offset,
//     ];

//   }

//   // FEED POSTS
//   else {

//     q = `
//       SELECT 
//         p.*,
//         u.id AS userId,
//         u.name,
//         u.username,
//         u.profilePic

//       FROM posts AS p

//       JOIN users AS u
//       ON u.id = p.userId

//       WHERE
//         p.userId = ?

//         OR p.userId IN (
//           SELECT followedUserId
//           FROM relationships
//           WHERE followerUserId = ?
//         )

//       ORDER BY p.createdAt DESC

//       LIMIT ? OFFSET ?
//     `;

//     values = [
//       userInfo.id,
//       userInfo.id,
//       limit,
//       offset,
//     ];
//   }

//   db.query(q, values, (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json({
//       page,
//       limit,
//       results: data.length,
//       posts: data,
//     });

//   });

// };

// export const addPost = (req, res) => {

//   const userInfo = req.userInfo;

//   const q =
//     "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";

//   const values = [
//     req.body.desc,
//     req.body.img,
//     moment(Date.now()).format(
//       "YYYY-MM-DD HH:mm:ss"
//     ),
//     userInfo.id,
//   ];

//   db.query(q, [values], (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     // EXTRACT HASHTAGS
//     const hashtags =
//       extractHashtags(req.body.desc);

//     hashtags.forEach((tag) => {

//       const checkTagQuery =
//         "SELECT * FROM hashtags WHERE tag = ?";

//       db.query(
//         checkTagQuery,
//         [tag],
//         (err, tagData) => {

//           if (err) return;

//           // TAG DOESN'T EXIST
//           if (tagData.length === 0) {

//             const insertTagQuery =
//               "INSERT INTO hashtags(tag) VALUES (?)";

//             db.query(
//               insertTagQuery,
//               [tag],
//               (err, result) => {

//                 if (err) return;

//                 const hashtagId =
//                   result.insertId;

//                 db.query(
//                   "INSERT INTO post_hashtags(postId, hashtagId) VALUES (?, ?)",
//                   [data.insertId, hashtagId]
//                 );

//               }
//             );

//           } else {

//             // TAG EXISTS
//             const hashtagId =
//               tagData[0].id;

//             db.query(
//               "INSERT INTO post_hashtags(postId, hashtagId) VALUES (?, ?)",
//               [data.insertId, hashtagId]
//             );
//           }
//         }
//       );
//     });

//     return res
//       .status(200)
//       .json("Post has been created.");

//   });

// };

// export const deletePost = (req, res) => {

//   const userInfo = req.userInfo;

//   const q =
//     "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

//   db.query(
//     q,
//     [req.params.id, userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.affectedRows > 0) {

//         return res
//           .status(200)
//           .json("Post has been deleted.");
//       }

//       return res
//         .status(403)
//         .json(
//           "You can delete only your post"
//         );

//     }
//   );

// };

// export const getTrendingPosts = (req, res) => {

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 10;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT 
//       p.*,
//       u.name,
//       u.username,
//       u.profilePic,

//       COUNT(DISTINCT l.id) AS likesCount,

//       COUNT(DISTINCT c.id) AS commentsCount

//     FROM posts p

//     JOIN users u
//     ON u.id = p.userId

//     LEFT JOIN likes l
//     ON l.postId = p.id

//     LEFT JOIN comments c
//     ON c.postId = p.id

//     GROUP BY p.id

//     ORDER BY (likesCount + commentsCount) DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [limit, offset],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json({
//         page,
//         limit,
//         results: data.length,
//         posts: data,
//       });

//     }
//   );

// };

// export const getPostsByHashtag = (req, res) => {

//   const q = `
//     SELECT 
//       p.*, 
//       u.name,
//       u.username,
//       u.profilePic

//     FROM posts p

//     JOIN users u
//     ON u.id = p.userId

//     JOIN post_hashtags ph
//     ON ph.postId = p.id

//     JOIN hashtags h
//     ON h.id = ph.hashtagId

//     WHERE LOWER(h.tag) = LOWER(?)

//     ORDER BY p.createdAt DESC
//   `;

//   db.query(
//     q,
//     [req.params.tag.toLowerCase()],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json(data);

//     }
//   );

// };

// export const getTrendingHashtags = (req, res) => {

//   const q = `
//     SELECT 
//       h.tag, 
//       COUNT(ph.hashtagId) AS count

//     FROM hashtags h

//     JOIN post_hashtags ph
//     ON h.id = ph.hashtagId

//     GROUP BY h.id

//     ORDER BY count DESC

//     LIMIT 10
//   `;

//   db.query(q, (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };

// export const getExplorePosts = (req, res) => {

//   // PAGINATION
//   const page =
//     parseInt(req.query.page) || 1;

//   const limit =
//     parseInt(req.query.limit) || 20;

//   const offset =
//     (page - 1) * limit;

//   const q = `
//     SELECT
//       p.*,
//       u.name,
//       u.username,
//       u.profilePic,

//       COUNT(DISTINCT l.id) AS likesCount,

//       COUNT(DISTINCT c.id) AS commentsCount,

//       (
//         COUNT(DISTINCT l.id) +
//         COUNT(DISTINCT c.id)
//       ) AS engagementScore

//     FROM posts p

//     JOIN users u
//     ON u.id = p.userId

//     LEFT JOIN likes l
//     ON l.postId = p.id

//     LEFT JOIN comments c
//     ON c.postId = p.id

//     GROUP BY p.id

//     ORDER BY engagementScore DESC,
//     p.createdAt DESC

//     LIMIT ? OFFSET ?
//   `;

//   db.query(
//     q,
//     [limit, offset],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json({
//         page,
//         limit,
//         results: data.length,
//         posts: data,
//       });

//     }
//   );

// };




















































// import { db } from "../connect.js";
// import moment from "moment";
// import { extractHashtags } from "../utils/extractHashtags.js";

// export const getPosts = (req, res) => {

//   const userId = req.query.userId;

//   const userInfo = req.userInfo;

//   let q;
//   let values;

//   // USER PROFILE POSTS
//   if (userId) {

//     q = `
//       SELECT 
//         p.*,
//         u.id AS userId,
//         u.name,
//         u.username,
//         u.profilePic

//       FROM posts AS p

//       JOIN users AS u
//       ON u.id = p.userId

//       WHERE p.userId = ?

//       ORDER BY p.createdAt DESC
//     `;

//     values = [userId];

//   } 
  
//   // FEED POSTS
//   else {

//     q = `
//       SELECT 
//         p.*,
//         u.id AS userId,
//         u.name,
//         u.username,
//         u.profilePic

//       FROM posts AS p

//       JOIN users AS u
//       ON u.id = p.userId

//       WHERE
//         p.userId = ?

//         OR p.userId IN (
//           SELECT followedUserId
//           FROM relationships
//           WHERE followerUserId = ?
//         )

//       ORDER BY p.createdAt DESC
//     `;

//     values = [userInfo.id, userInfo.id];
//   }

//   db.query(q, values, (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };

// export const addPost = (req, res) => {

//   const userInfo = req.userInfo;

//   const q =
//     "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";

//   const values = [
//     req.body.desc,
//     req.body.img,
//     moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//     userInfo.id,
//   ];

//   db.query(q, [values], (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     // EXTRACT HASHTAGS
//     const hashtags =
//       extractHashtags(req.body.desc);

//     hashtags.forEach((tag) => {

//       const checkTagQuery =
//         "SELECT * FROM hashtags WHERE tag = ?";

//       db.query(
//         checkTagQuery,
//         [tag],
//         (err, tagData) => {

//           if (err) return;

//           // TAG DOESN'T EXIST
//           if (tagData.length === 0) {

//             const insertTagQuery =
//               "INSERT INTO hashtags(tag) VALUES (?)";

//             db.query(
//               insertTagQuery,
//               [tag],
//               (err, result) => {

//                 if (err) return;

//                 const hashtagId =
//                   result.insertId;

//                 db.query(
//                   "INSERT INTO post_hashtags(postId, hashtagId) VALUES (?, ?)",
//                   [data.insertId, hashtagId]
//                 );

//               }
//             );

//           } else {

//             // TAG EXISTS
//             const hashtagId =
//               tagData[0].id;

//             db.query(
//               "INSERT INTO post_hashtags(postId, hashtagId) VALUES (?, ?)",
//               [data.insertId, hashtagId]
//             );
//           }
//         }
//       );
//     });

//     return res
//       .status(200)
//       .json("Post has been created.");

//   });

// };

// export const deletePost = (req, res) => {

//   const userInfo = req.userInfo;

//   const q =
//     "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

//   db.query(
//     q,
//     [req.params.id, userInfo.id],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       if (data.affectedRows > 0) {

//         return res
//           .status(200)
//           .json("Post has been deleted.");
//       }

//       return res
//         .status(403)
//         .json("You can delete only your post");

//     }
//   );

// };

// export const getTrendingPosts = (req, res) => {

//   const q = `
//     SELECT 
//       p.*,
//       u.name,
//       u.username,
//       u.profilePic,

//       COUNT(DISTINCT l.id) AS likesCount,

//       COUNT(DISTINCT c.id) AS commentsCount

//     FROM posts p

//     JOIN users u
//     ON u.id = p.userId

//     LEFT JOIN likes l
//     ON l.postId = p.id

//     LEFT JOIN comments c
//     ON c.postId = p.id

//     GROUP BY p.id

//     ORDER BY (likesCount + commentsCount) DESC

//     LIMIT 10
//   `;

//   db.query(q, (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };

// export const getPostsByHashtag = (req, res) => {

//   const q = `
//     SELECT 
//       p.*, 
//       u.name,
//       u.username,
//       u.profilePic

//     FROM posts p

//     JOIN users u
//     ON u.id = p.userId

//     JOIN post_hashtags ph
//     ON ph.postId = p.id

//     JOIN hashtags h
//     ON h.id = ph.hashtagId

//     WHERE LOWER(h.tag) = LOWER(?)

//     ORDER BY p.createdAt DESC
//   `;

//   db.query(
//     q,
//     [req.params.tag.toLowerCase()],
//     (err, data) => {

//       if (err)
//         return res.status(500).json(err);

//       return res.status(200).json(data);

//     }
//   );

// };

// export const getTrendingHashtags = (req, res) => {

//   const q = `
//     SELECT 
//       h.tag, 
//       COUNT(ph.hashtagId) AS count

//     FROM hashtags h

//     JOIN post_hashtags ph
//     ON h.id = ph.hashtagId

//     GROUP BY h.id

//     ORDER BY count DESC

//     LIMIT 10
//   `;

//   db.query(q, (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };

// export const getExplorePosts = (req, res) => {

//   const q = `
//     SELECT
//       p.*,
//       u.name,
//       u.username,
//       u.profilePic,

//       COUNT(DISTINCT l.id) AS likesCount,

//       COUNT(DISTINCT c.id) AS commentsCount,

//       (
//         COUNT(DISTINCT l.id) +
//         COUNT(DISTINCT c.id)
//       ) AS engagementScore

//     FROM posts p

//     JOIN users u
//     ON u.id = p.userId

//     LEFT JOIN likes l
//     ON l.postId = p.id

//     LEFT JOIN comments c
//     ON c.postId = p.id

//     GROUP BY p.id

//     ORDER BY engagementScore DESC, p.createdAt DESC

//     LIMIT 20
//   `;

//   db.query(q, (err, data) => {

//     if (err)
//       return res.status(500).json(err);

//     return res.status(200).json(data);

//   });

// };



















































































































































































































































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";
// import moment from "moment";
// import { extractHashtags } from "../utils/extractHashtags.js";


// export const getPosts = (req, res) => {
//   const userId = req.query.userId;
//   const token = req.cookies.accessToken;

//   if (!token) {
//     return res.status(401).json("Not logged in!");
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {

//     if (err) {
//       return res.status(403).json("Token is not valid!");
//     }

//     let q;
//     let values;

//     // GET POSTS FOR A SPECIFIC USER PROFILE
//     if (userId) {

//       q = `
//         SELECT 
//           p.*,
//           u.id AS userId,
//           u.name,
//           u.username,
//           u.profilePic

//         FROM posts AS p

//         JOIN users AS u
//         ON u.id = p.userId

//         WHERE p.userId = ?

//         ORDER BY p.createdAt DESC
//       `;

//       values = [userId];

//     } 
    
//     // GET FEED POSTS (FOLLOWING + OWN POSTS)
//     else {

//       q = `
//         SELECT 
//           p.*,
//           u.id AS userId,
//           u.name,
//           u.username,
//           u.profilePic

//         FROM posts AS p

//         JOIN users AS u
//         ON u.id = p.userId

//         WHERE
//           p.userId = ?

//           OR p.userId IN (
//             SELECT followedUserId
//             FROM relationships
//             WHERE followerUserId = ?
//           )

//         ORDER BY p.createdAt DESC
//       `;

//       values = [userInfo.id, userInfo.id];
//     }

//     db.query(q, values, (err, data) => {

//       if (err) {
//         return res.status(500).json(err);
//       }

//       return res.status(200).json(data);
//     });
//   });
// };


// // export const getPosts = (req, res) => {
// //   const userId = req.query.userId;
// //   const token = req.cookies.accessToken;
// //   if (!token) return res.status(401).json("Not logged in!");

// //   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
// //     if (err) return res.status(403).json("Token is not valid!");

// //     console.log(userId);

// //     const q =
// //       userId !== "undefined"
// //         ? `SELECT p.*, u.id AS userId, u.name, u.username, u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
// //         : `SELECT p.*, u.id AS userId, u.name, u.username, u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
// //     LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId= ? OR p.userId =?
// //     ORDER BY p.createdAt DESC`;

// //     const values =
// //       userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];

// //     db.query(q, values, (err, data) => {
// //       if (err) return res.status(500).json(err);
// //       return res.status(200).json(data);
// //     });
// //   });
// // };


// export const addPost = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q =
//       "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
//     const values = [
//       req.body.desc,
//       req.body.img,
//       moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//       userInfo.id,
//     ];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);

//       const hashtags = extractHashtags(req.body.desc);

//     hashtags.forEach((tag) => {

//       const checkTagQuery =
//         "SELECT * FROM hashtags WHERE tag = ?";

//       db.query(checkTagQuery, [tag], (err, tagData) => {

//         if (err) return;

//         // IF TAG DOESN'T EXIST
//         if (tagData.length === 0) {

//           const insertTagQuery =
//             "INSERT INTO hashtags(tag) VALUES (?)";

//           db.query(insertTagQuery, [tag], (err, result) => {

//             if (err) return;

//             const hashtagId = result.insertId;

//             db.query(
//               "INSERT INTO post_hashtags(postId, hashtagId) VALUES (?, ?)",
//               [data.insertId, hashtagId]
//             );
//           });

//         } else {

//           const hashtagId = tagData[0].id;

//           db.query(
//             "INSERT INTO post_hashtags(postId, hashtagId) VALUES (?, ?)",
//             [data.insertId, hashtagId]
//           );
//         }
//       });
//     });


//       return res.status(200).json("Post has been created.");
//     });
//   });
// };


// export const deletePost = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q =
//       "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

//     db.query(q, [req.params.id, userInfo.id], (err, data) => {
//       if (err) return res.status(500).json(err);
//       if(data.affectedRows>0) return res.status(200).json("Post has been deleted.");
//       return res.status(403).json("You can delete only your post")
//     });
//   });
// };

// export const getTrendingPosts = (req, res) => {

//   const q = `
//     SELECT 
//       p.*,
//       u.name,
//       COUNT(DISTINCT l.id) AS likesCount,
//       COUNT(DISTINCT c.id) AS commentsCount
//     FROM posts p
//     JOIN users u ON u.id = p.userId
//     LEFT JOIN likes l ON l.postId = p.id
//     LEFT JOIN comments c ON c.postId = p.id
//     GROUP BY p.id
//     ORDER BY (likesCount + commentsCount) DESC
//     LIMIT 10
//   `;

//   db.query(q, (err, data) => {
//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };

// export const getPostsByHashtag = (req, res) => {

//   const q = `
//     SELECT p.*, u.name
//     FROM posts p
//     JOIN users u ON u.id = p.userId
//     JOIN post_hashtags ph ON ph.postId = p.id
//     JOIN hashtags h ON h.id = ph.hashtagId
//     WHERE LOWER(h.tag) = LOWER(?)
//     ORDER BY p.createdAt DESC
//   `;

//   db.query(q, [req.params.tag.toLowerCase()], (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };


// export const getTrendingHashtags = (req, res) => {

//   const q = `
//     SELECT h.tag, COUNT(ph.hashtagId) AS count
//     FROM hashtags h
//     JOIN post_hashtags ph
//     ON h.id = ph.hashtagId
//     GROUP BY h.id
//     ORDER BY count DESC
//     LIMIT 10
//   `;

//   db.query(q, (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };

// export const getExplorePosts = (req, res) => {

//   const q = `
//     SELECT
//       p.*,
//       u.name,
//       COUNT(DISTINCT l.id) AS likesCount,
//       COUNT(DISTINCT c.id) AS commentsCount,
//       (
//         COUNT(DISTINCT l.id) +
//         COUNT(DISTINCT c.id)
//       ) AS engagementScore

//     FROM posts p

//     JOIN users u
//     ON u.id = p.userId

//     LEFT JOIN likes l
//     ON l.postId = p.id

//     LEFT JOIN comments c
//     ON c.postId = p.id

//     GROUP BY p.id

//     ORDER BY engagementScore DESC, p.createdAt DESC

//     LIMIT 20
//   `;

//   db.query(q, (err, data) => {

//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };

// // db.query(q, [`#${req.params.tag}`], (err, data)














































































































// // import {db} from "../connect.js";
// // import jwt from "jsonwebtoken";
// // import moment from "moment";

// // export const getPosts = (req, res) => {
// //     const userId = req.query.userId;
// //     const token = req.cookies.accessToken;
// //     if (!token) return res.status(401).json("Not logged in!");
  
// //     jwt.verify(token, "secretkey", (err, userInfo) => {
// //       if (err) return res.status(403).json("Token is not valid!");
  
// //       console.log(userId);
// //     const q = `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
// //     LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId= ? OR p.userId =?
// //     ORDER BY p.createdAt DESC`;

// //     db.query(q, [userInfo.id, userInfo.id], (err,data)=>{
// //         if (err) return res.status(500).json(err);
// //         return res.status(200).json(data);
// //       });
// //     });
// // };

// // export const addPost = (req, res) => {
// //     const userId = req.query.userId;
// //     const token = req.cookies.accessToken;
// //     if (!token) return res.status(401).json("Not logged in!");
  
// //     jwt.verify(token, "secretkey", (err, userInfo) => {
// //       if (err) return res.status(403).json("Token is not valid!");
  
// //       console.log(userId);
// //     const q = "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";

// //     const values = [
// //         req.body.desc,
// //         req.body.img,
// //         moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
// //         userInfo.id,
// //       ];

// //     db.query(q, [values], (err,data)=>{
// //         if (err) return res.status(500).json(err);
// //         return res.status(200).json("Post has been created.");
// //       });
// //     });
// // };