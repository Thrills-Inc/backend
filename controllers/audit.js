import { db } from "../connect.js";

import logger
from "../utils/logger.js";

// GET AUDIT LOGS
export const getAuditLogs = (
  req,
  res,
  next
) => {

  const page =
    parseInt(req.query.page) || 1;

  const limit =
    parseInt(req.query.limit) || 50;

  const offset =
    (page - 1) * limit;

  const q = `
    SELECT

      a.*,

      u.name,

      u.username

    FROM audit_logs a

    JOIN users u
    ON u.id = a.adminId

    ORDER BY
      a.createdAt DESC

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

      if (err)
        return next(err);

      logger.info(
        `Audit logs viewed by admin ${req.userInfo.id}`
      );

      return res
        .status(200)
        .json({

          page,

          limit,

          results:
            data.length,

          logs:
            data,

        });

    }
  );

};





























// import { db }
// from "../connect.js";

// export const getAuditLogs = (
//   req,
//   res,
//   next
// ) => {

//   const q = `
//     SELECT

//       a.*,

//       u.name,

//       u.username

//     FROM audit_logs a

//     JOIN users u
//     ON u.id = a.adminId

//     ORDER BY
//       a.createdAt DESC

//     LIMIT 200
//   `;

//   db.query(
//     q,

//     (err,data) => {

//       if(err)
//         return next(err);

//       res
//         .status(200)
//         .json(data);

//     }
//   );

// };