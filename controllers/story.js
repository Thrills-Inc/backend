import { db } from "../connect.js";

import moment from "moment";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// GET STORIES
export const getStories = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    SELECT
      s.*,

      u.id AS userId,
      u.name,
      u.username,
      u.profilePic

    FROM stories s

    JOIN users u
    ON u.id = s.userId

    LEFT JOIN relationships r

    ON (
      s.userId = r.followedUserId

      AND

      r.followerUserId = ?
    )

    WHERE

      s.userId = ?

      OR

      r.followerUserId = ?

    ORDER BY s.createdAt DESC
  `;

  db.query(
    q,
    [
      userInfo.id,
      userInfo.id,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch stories: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Stories fetched for user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// ADD STORY
export const addStory = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  if (!req.body.img) {

    logger.warn(
      `Story creation attempted without image by user ${userInfo.id}`
    );

    return next(
      new ApiError(
        400,
        "Story image is required."
      )
    );

  }

  const q = `
    INSERT INTO stories
    (
      \`img\`,
      \`createdAt\`,
      \`userId\`
    )
    VALUES (?)
  `;

  const values = [
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
          `Failed to create story: ${err.message}`
        );

        return next(err);

      }

      // ACTIVITY LOG
      logActivity(
        userInfo.id,
        "story",
        data.insertId
      );

      logger.info(
        `Story created by user ${userInfo.id}`
      );

      return res
        .status(201)
        .json({

          message:
            "Story has been created.",

          storyId:
            data.insertId,

        });

    }
  );

};

// DELETE STORY
export const deleteStory = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const storyId =
    req.params.id;

  const q = `
    DELETE FROM stories

    WHERE
      id = ?
      AND userId = ?
  `;

  db.query(
    q,
    [
      storyId,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to delete story ${storyId}: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        logger.warn(
          `Unauthorized story deletion attempt by user ${userInfo.id}`
        );

        return next(
          new ApiError(
            403,
            "You can delete only your story."
          )
        );

      }

      logger.info(
        `Story ${storyId} deleted by user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(
          "Story has been deleted."
        );

    }
  );

};

// GET USER STORIES
export const getUserStories = (
  req,
  res,
  next
) => {

  const userId =
    req.params.userId;

  const q = `
    SELECT
      s.*,

      u.name,
      u.username,
      u.profilePic

    FROM stories s

    JOIN users u
    ON u.id = s.userId

    WHERE s.userId = ?

    ORDER BY s.createdAt DESC
  `;

  db.query(
    q,
    [userId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch user stories: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Stories fetched for user ${userId}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// GET ACTIVE STORIES (24 HOURS)
export const getActiveStories = (
  req,
  res,
  next
) => {

  const q = `
    SELECT
      s.*,

      u.name,
      u.username,
      u.profilePic

    FROM stories s

    JOIN users u
    ON u.id = s.userId

    WHERE
      s.createdAt >=
      DATE_SUB(
        NOW(),
        INTERVAL 24 HOUR
      )

    ORDER BY s.createdAt DESC
  `;

  db.query(
    q,

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch active stories: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        "Active stories fetched"
      );

      return res
        .status(200)
        .json(data);

    }
  );

};







































// import { db } from "../connect.js";

// import moment from "moment";

// import logger
// from "../utils/logger.js";

// // GET STORIES
// export const getStories = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const q = `
//     SELECT 
//       s.*,
//       u.name,
//       u.username,
//       u.profilePic

//     FROM stories AS s

//     JOIN users AS u
//     ON u.id = s.userId

//     LEFT JOIN relationships AS r

//     ON (
//       s.userId = r.followedUserId

//       AND

//       r.followerUserId = ?
//     )

//     WHERE
//       s.userId = ?
//       OR r.followerUserId = ?

//     ORDER BY s.createdAt DESC

//     LIMIT 20
//   `;

//   db.query(
//     q,
//     [
//       userInfo.id,
//       userInfo.id,
//       userInfo.id,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch stories for user ${userInfo.id}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Stories fetched for user ${userInfo.id}`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };

// // ADD STORY
// export const addStory = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   // VALIDATION
//   if (!req.body.img) {

//     logger.warn(
//       `Story creation attempted without image by user ${userInfo.id}`
//     );

//     return res
//       .status(400)
//       .json(
//         "Story image is required."
//       );

//   }

//   const q = `
//     INSERT INTO stories
//     (\`img\`, \`createdAt\`, \`userId\`)
//     VALUES (?)
//   `;

//   const values = [
//     req.body.img,

//     moment(Date.now()).format(
//       "YYYY-MM-DD HH:mm:ss"
//     ),

//     userInfo.id,
//   ];

//   db.query(
//     q,
//     [values],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to create story for user ${userInfo.id}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Story created by user ${userInfo.id}`
//       );

//       return res
//         .status(200)
//         .json(
//           "Story has been created."
//         );

//     }
//   );

// };

// // DELETE STORY
// export const deleteStory = (
//   req,
//   res
// ) => {

//   const userInfo =
//     req.userInfo;

//   const storyId =
//     req.params.id;

//   const q = `
//     DELETE FROM stories

//     WHERE \`id\` = ?
//     AND \`userId\` = ?
//   `;

//   db.query(
//     q,
//     [
//       storyId,
//       userInfo.id,
//     ],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to delete story ${storyId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       if (
//         data.affectedRows > 0
//       ) {

//         logger.info(
//           `Story ${storyId} deleted by user ${userInfo.id}`
//         );

//         return res
//           .status(200)
//           .json(
//             "Story has been deleted."
//           );

//       }

//       logger.warn(
//         `Unauthorized story delete attempt by user ${userInfo.id}`
//       );

//       return res
//         .status(403)
//         .json(
//           "You can delete only your story!"
//         );

//     }
//   );

// };














































// import { db } from "../connect.js";
// import jwt from "jsonwebtoken";
// import moment from "moment";

// export const getStories = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     console.log(userId);

//     const q = `SELECT s.*, name FROM stories AS s JOIN users AS u ON (u.id = s.userId)
//     LEFT JOIN relationships AS r ON (s.userId = r.followedUserId AND r.followerUserId= ?) LIMIT 4`;

//     db.query(q, [userInfo.id], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json(data);
//     });
//   });
// };

// export const addStory = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q = "INSERT INTO stories(`img`, `createdAt`, `userId`) VALUES (?)";
//     const values = [
//       req.body.img,
//       moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//       userInfo.id,
//     ];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json("Story has been created.");
//     });
//   });
// };

// export const deleteStory = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");

//   jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q = "DELETE FROM stories WHERE `id`=? AND `userId` = ?";

//     db.query(q, [req.params.id, userInfo.id], (err, data) => {
//       if (err) return res.status(500).json(err);
//       if (data.affectedRows > 0)
//         return res.status(200).json("Story has been deleted.");
//       return res.status(403).json("You can delete only your story!");
//     });
//   });
// };