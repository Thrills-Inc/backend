import express
from "express";

import {
  verifyToken,
} from "../middleware/authMiddleware.js";

import {
  authorize,
} from "../middleware/roleMiddleware.js";

import {
  getAuditLogs,
} from "../controllers/audit.js";

const router =
  express.Router();


/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Get audit logs
 *     description: Returns paginated administrative audit logs for security and compliance review.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Audit
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 50
 *     responses:
 *       200:
 *         description: Audit logs returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

router.get(

  "/",

  verifyToken,

  authorize(
    "admin",
    "superadmin"
  ),

  getAuditLogs

);

export default router;