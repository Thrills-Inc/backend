import { db } from "../connect.js";
import logger from "../utils/logger.js";

export const getPlatformStats = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      (SELECT COUNT(*) FROM users) AS totalUsers,

      (SELECT COUNT(*) FROM posts) AS totalPosts,

      (SELECT COUNT(*) FROM comments) AS totalComments,

      (SELECT COUNT(*) FROM likes) AS totalLikes,

      (SELECT COUNT(*) FROM messages) AS totalMessages,

      (SELECT COUNT(*) FROM conversations) AS totalConversations
  `;

  db.query(
    q,
    (err, data) => {

      if (err)
        return next(err);

      logger.info(
        "Platform stats fetched"
      );

      return res
        .status(200)
        .json(data[0]);

    }
  );

};

export const getTrendingStats = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      h.tag,

      COUNT(ph.postId)
      AS totalPosts

    FROM hashtags h

    JOIN post_hashtags ph
    ON ph.hashtagId = h.id

    GROUP BY h.id

    ORDER BY totalPosts DESC

    LIMIT 10
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

export const getMostActiveUsers = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      u.id,

      u.name,

      u.username,

      COUNT(p.id)
      AS postsCount

    FROM users u

    LEFT JOIN posts p
    ON p.userId = u.id

    GROUP BY u.id

    ORDER BY postsCount DESC

    LIMIT 10
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