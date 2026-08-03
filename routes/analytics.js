import express from "express";

import {
  getPlatformStats,
  getTrendingStats,
  getMostActiveUsers,
} from "../controllers/analytics.js";

import { verifyToken } from "../middleware/authMiddleware.js";

import { authorize } from "../middleware/roleMiddleware.js";

const router =
  express.Router();



/**
 * @swagger
 * /analytics/stats:
 *   get:
 *     summary: Get platform statistics
 *     description: Returns overall platform metrics including users, posts, comments, likes, messages, and conversations.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Platform statistics returned successfully
 */

router.get(
  "/stats",
  verifyToken,
  authorize("admin", "superadmin"),
  getPlatformStats
);


/**
 * @swagger
 * /analytics/trending:
 *   get:
 *     summary: Get trending hashtags
 *     description: Returns the most popular hashtags based on post usage.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Trending hashtag statistics returned
 */

router.get(
  "/trending",
  getTrendingStats
);



/**
 * @swagger
 * /analytics/active-users:
 *   get:
 *     summary: Get most active users
 *     description: Returns users ranked by content activity.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Active users returned successfully
 */

router.get(
  "/active-users",
  verifyToken,
  authorize("admin", "superadmin"),
  getMostActiveUsers
);

export default router;