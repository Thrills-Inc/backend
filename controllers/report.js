import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logAudit,
} from "../utils/auditLogger.js";

// CREATE REPORT
export const createReport = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const {
    targetId,
    targetType,
    reason,
  } = req.body;

  if (
    !targetId ||
    !targetType ||
    !reason
  ) {

    return next(
      new ApiError(
        400,
        "All fields are required."
      )
    );

  }

  const q = `
    INSERT INTO reports
    (
      reporterId,
      targetId,
      targetType,
      reason
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    q,
    [
      userInfo.id,
      targetId,
      targetType,
      reason,
    ],

    (err) => {

      if (err)
        return next(err);

      logger.info(
        `User ${userInfo.id} submitted a report`
      );

      return res
        .status(201)
        .json(
          "Report submitted."
        );

    }
  );

};

// GET REPORTS
export const getReports = (
  req,
  res,
  next
) => {

  const q = `
    SELECT *

    FROM reports

    ORDER BY
      createdAt DESC
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

// RESOLVE REPORT
export const resolveReport = (
  req,
  res,
  next
) => {

  const adminId =
    req.userInfo.id;

  const q = `
    UPDATE reports

    SET

      status = 'resolved',

      reviewedBy = ?,

      reviewedAt = NOW()

    WHERE id = ?
  `;

  db.query(
    q,
    [
      adminId,
      req.params.id,
    ],

    (err, data) => {

      if (err)
        return next(err);

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Report not found."
          )
        );

      }

      logAudit(
        adminId,
        "RESOLVE_REPORT",
        "report",
        req.params.id,
        "Report resolved"
      );

      logger.info(
        `Report ${req.params.id} resolved by admin ${adminId}`
      );

      return res
        .status(200)
        .json(
          "Report resolved."
        );

    }
  );

};

// REJECT REPORT
export const rejectReport = (
  req,
  res,
  next
) => {

  const adminId =
    req.userInfo.id;

  const q = `
    UPDATE reports

    SET

      status = 'rejected',

      reviewedBy = ?,

      reviewedAt = NOW()

    WHERE id = ?
  `;

  db.query(
    q,
    [
      adminId,
      req.params.id,
    ],

    (err, data) => {

      if (err)
        return next(err);

      if (
        data.affectedRows === 0
      ) {

        return next(
          new ApiError(
            404,
            "Report not found."
          )
        );

      }

      logAudit(
        adminId,
        "REJECT_REPORT",
        "report",
        req.params.id,
        "Report rejected"
      );

      logger.info(
        `Report ${req.params.id} rejected by admin ${adminId}`
      );

      return res
        .status(200)
        .json(
          "Report rejected."
        );

    }
  );

};





























































// import { db } from "../connect.js";

// import logger
// from "../utils/logger.js";

// import ApiError
// from "../utils/ApiError.js";

// export const createReport = (
//   req,
//   res,
//   next
// ) => {

//   const userInfo =
//     req.userInfo;

//   const {
//     targetId,
//     targetType,
//     reason,
//   } = req.body;

//   if (
//     !targetId ||
//     !targetType ||
//     !reason
//   ) {

//     return next(
//       new ApiError(
//         400,
//         "All fields are required."
//       )
//     );

//   }

//   const q = `
//     INSERT INTO reports
//     (
//       reporterId,
//       targetId,
//       targetType,
//       reason
//     )
//     VALUES (?, ?, ?, ?)
//   `;

//   db.query(
//     q,
//     [
//       userInfo.id,
//       targetId,
//       targetType,
//       reason,
//     ],

//     (err, data) => {

//       if (err)
//         return next(err);

//       logger.info(
//         `Report submitted by user ${userInfo.id}`
//       );

//       return res
//         .status(201)
//         .json(
//           "Report submitted."
//         );

//     }
//   );

// };

// export const getReports = (
//   req,
//   res,
//   next
// ) => {

//   const q = `
//     SELECT *

//     FROM reports

//     ORDER BY
//       createdAt DESC
//   `;

//   db.query(
//     q,

//     (err, data) => {

//       if (err)
//         return next(err);

//       res
//         .status(200)
//         .json(data);

//     }
//   );

// };

// export const resolveReport = (
//   req,
//   res,
//   next
// ) => {

//   const adminId =
//     req.userInfo.id;

//   const q = `
//     UPDATE reports

//     SET

//       status = 'resolved',

//       reviewedBy = ?,

//       reviewedAt = NOW()

//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [
//       adminId,
//       req.params.id,
//     ],

//     (err,data) => {

//       if(err)
//         return next(err);

//       res
//         .status(200)
//         .json(
//           "Report resolved."
//         );

//     }
//   );

// };

// export const rejectReport = (
//   req,
//   res,
//   next
// ) => {

//   const adminId =
//     req.userInfo.id;

//   const q = `
//     UPDATE reports

//     SET

//       status = 'rejected',

//       reviewedBy = ?,

//       reviewedAt = NOW()

//     WHERE id = ?
//   `;

//   db.query(
//     q,
//     [
//       adminId,
//       req.params.id,
//     ],

//     (err,data) => {

//       if(err)
//         return next(err);

//       res
//         .status(200)
//         .json(
//           "Report rejected."
//         );

//     }
//   );

// };

