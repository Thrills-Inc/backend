import express
from "express";

import {
  verifyToken,
} from "../middleware/authMiddleware.js";

import {
  authorize,
} from "../middleware/roleMiddleware.js";

import {

  createReport,

  getReports,

  resolveReport,

  rejectReport,

} from "../controllers/report.js";

const router =
  express.Router();



/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create report
 *     description: Report a user, post, comment, or other content for moderation review.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Reports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetId
 *               - targetType
 *               - reason
 *             properties:
 *               targetId:
 *                 type: integer
 *                 example: 15
 *               targetType:
 *                 type: string
 *                 example: post
 *               reason:
 *                 type: string
 *                 example: Spam content
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/",

  verifyToken,

  createReport
);



/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get reports
 *     description: Returns all submitted reports for moderators and administrators.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Reports
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Moderator/Admin access required
 */

router.get(
  "/",

  verifyToken,

  authorize(
    "moderator",
    "admin",
    "superadmin"
  ),

  getReports
);



/**
 * @swagger
 * /reports/resolve/{id}:
 *   put:
 *     summary: Resolve report
 *     description: Marks a report as resolved.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Report resolved successfully
 *       404:
 *         description: Report not found
 *       403:
 *         description: Moderator/Admin access required
 */

router.put(
  "/resolve/:id",

  verifyToken,

  authorize(
    "moderator",
    "admin",
    "superadmin"
  ),

  resolveReport
);



/**
 * @swagger
 * /reports/resolve/{id}:
 *   put:
 *     summary: Resolve report
 *     description: Marks a report as resolved.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Report resolved successfully
 *       404:
 *         description: Report not found
 *       403:
 *         description: Moderator/Admin access required
 */

router.put(
  "/reject/:id",

  verifyToken,

  authorize(
    "moderator",
    "admin",
    "superadmin"
  ),

  rejectReport
);

export default router;