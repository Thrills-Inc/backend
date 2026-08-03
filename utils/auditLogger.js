import { db }
from "../connect.js";

import logger
from "./logger.js";

export const logAudit = (

  adminId,

  action,

  targetType,

  targetId,

  details = null

) => {

  const q = `
    INSERT INTO audit_logs
    (
      adminId,
      action,
      targetType,
      targetId,
      details
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    q,
    [
      adminId,
      action,
      targetType,
      targetId,
      details,
    ],

    (err) => {

      if (err) {

        logger.error(
          `Audit log failed: ${err.message}`
        );

        return;

      }

      logger.info(
        `AUDIT: ${action} | Admin: ${adminId} | ${targetType}:${targetId}`
      );

    }
  );

};