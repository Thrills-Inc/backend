import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";

// ADD INTERESTS
export const addInterests = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const interests =
    req.body.interests;

  if (
    !Array.isArray(interests) ||
    interests.length === 0
  ) {

    return next(
      new ApiError(
        400,
        "Interests are required."
      )
    );

  }

  const values =
    interests.map(
      (interest) => [
        userInfo.id,
        interest,
      ]
    );

  const q = `
    INSERT IGNORE INTO interests
    (
      userId,
      category
    )
    VALUES ?
  `;

  db.query(
    q,
    [values],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to add interests: ${err.message}`
        );

        return next(err);

      }

      logActivity(
        userInfo.id,
        "add_interests",
        null
      );

      logger.info(
        `Interests added for user ${userInfo.id}`
      );

      return res
        .status(201)
        .json({

          message:
            "Interests added successfully.",

          added:
            data.affectedRows,

        });

    }
  );

};

// GET USER INTERESTS
export const getUserInterests = (
  req,
  res,
  next
) => {

  const userId =
    req.params.userId;

  const q = `
    SELECT
      id,
      category

    FROM interests

    WHERE userId = ?
  `;

  db.query(
    q,
    [userId],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed to fetch interests: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        `Fetched interests for user ${userId}`
      );

      return res
        .status(200)
        .json(data);

    }
  );

};

// UPDATE INTERESTS
export const updateInterests = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const interests =
    req.body.interests;

  if (
    !Array.isArray(interests)
  ) {

    return next(
      new ApiError(
        400,
        "Invalid interests data."
      )
    );

  }

  const deleteQuery = `
    DELETE FROM interests

    WHERE userId = ?
  `;

  db.query(
    deleteQuery,
    [userInfo.id],

    (err) => {

      if (err) {

        logger.error(
          `Failed clearing interests: ${err.message}`
        );

        return next(err);

      }

      if (
        interests.length === 0
      ) {

        logger.info(
          `User ${userInfo.id} cleared all interests`
        );

        return res
          .status(200)
          .json(
            "Interests updated."
          );

      }

      const values =
        interests.map(
          (interest) => [
            userInfo.id,
            interest,
          ]
        );

      const insertQuery = `
        INSERT INTO interests
        (
          userId,
          category
        )
        VALUES ?
      `;

      db.query(
        insertQuery,
        [values],

        (err) => {

          if (err) {

            logger.error(
              `Failed updating interests: ${err.message}`
            );

            return next(err);

          }

          logActivity(
            userInfo.id,
            "update_interests",
            null
          );

          logger.info(
            `Interests updated for user ${userInfo.id}`
          );

          return res
            .status(200)
            .json(
              "Interests updated."
            );

        }
      );

    }
  );

};

// DELETE INTEREST
export const deleteInterest = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const interestId =
    req.params.id;

  const q = `
    DELETE FROM interests

    WHERE
      id = ?
      AND userId = ?
  `;

  db.query(
    q,
    [
      interestId,
      userInfo.id,
    ],

    (err, data) => {

      if (err) {

        logger.error(
          `Failed deleting interest: ${err.message}`
        );

        return next(err);

      }

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Interest not found."
          )
        );

      }

      logger.info(
        `Interest ${interestId} deleted by user ${userInfo.id}`
      );

      return res
        .status(200)
        .json(
          "Interest deleted."
        );

    }
  );

};

// GET POPULAR INTERESTS
export const getPopularInterests = (
  req,
  res,
  next
) => {

  const q = `
    SELECT

      category,

      COUNT(*)
      AS usersCount

    FROM interests

    GROUP BY category

    ORDER BY usersCount DESC

    LIMIT 20
  `;

  db.query(
    q,

    (err, data) => {

      if (err) {

        logger.error(
          `Failed fetching popular interests: ${err.message}`
        );

        return next(err);

      }

      logger.info(
        "Popular interests fetched"
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

// // ADD INTERESTS
// export const addInterests = (
//   req,
//   res
// ) => {

//   const userId =
//     req.body.userId;

//   const interests =
//     req.body.interests;

//   // VALIDATION
//   if (
//     !interests ||
//     !Array.isArray(interests) ||
//     interests.length === 0
//   ) {

//     logger.warn(
//       `Invalid interests submission by user ${userId}`
//     );

//     return res
//       .status(400)
//       .json(
//         "Please provide valid interests."
//       );

//   }

//   interests.forEach(
//     (interest) => {

//       const q = `
//         INSERT INTO interests
//         (userId, category)
//         VALUES (?, ?)
//       `;

//       db.query(
//         q,
//         [
//           userId,
//           interest,
//         ],

//         (err) => {

//           if (err) {

//             logger.error(
//               `Failed to add interest "${interest}" for user ${userId}: ${err.message}`
//             );

//             return;

//           }

//           logger.info(
//             `Interest "${interest}" added for user ${userId}`
//           );

//         }
//       );

//     }
//   );

//   return res
//     .status(200)
//     .json(
//       "Interests added successfully"
//     );

// };

// // GET USER INTERESTS
// export const getUserInterests = (
//   req,
//   res
// ) => {

//   const userId =
//     req.params.userId;

//   const q = `
//     SELECT *
//     FROM interests
//     WHERE userId = ?
//   `;

//   db.query(
//     q,
//     [userId],

//     (err, data) => {

//       if (err) {

//         logger.error(
//           `Failed to fetch interests for user ${userId}: ${err.message}`
//         );

//         return res
//           .status(500)
//           .json(err);

//       }

//       logger.info(
//         `Fetched interests for user ${userId}`
//       );

//       return res
//         .status(200)
//         .json(data);

//     }
//   );

// };






























// import { db } from "../connect.js";

// export const addInterests = (req, res) => {

//   const userId = req.body.userId;
//   const interests = req.body.interests;

//   interests.forEach((interest) => {

//     const q = `
//       INSERT INTO interests (userId, category)
//       VALUES (?, ?)
//     `;

//     db.query(q, [userId, interest]);

//   });

//   return res.status(200).json("Interests added successfully");

// };

// export const getUserInterests = (req, res) => {
//   const userId = req.params.userId;

//   const q = "SELECT * FROM interests WHERE userId = ?";

//   db.query(q, [userId], (err, data) => {
//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data);
//   });
// };