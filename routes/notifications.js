import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  getRecentNotifications,
  deleteNotification,
  deleteAllNotifications
} from "../controllers/notification.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications
 *     description: Returns all notifications for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */

// GET ALL NOTIFICATIONS
router.get("/", verifyToken, getNotifications);



/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Returns the number of unread notifications.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Unread notification count returned
 *       401:
 *         description: Unauthorized
 */

// GET UNREAD COUNT
router.get(
  "/unread-count",
  verifyToken,
  getUnreadNotificationsCount
);




/**
 * @swagger
 * /notifications/read/{id}:
 *   put:
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */

// MARK SINGLE NOTIFICATION AS READ
router.put(
  "/read/:id",
  verifyToken,
  markNotificationAsRead
);




/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Marks all notifications for the authenticated user as read.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */

// MARK ALL NOTIFICATIONS AS READ
router.put(
  "/read-all",
  verifyToken,
  markAllNotificationsAsRead
);



/**
 * @swagger
 * /notifications/recent:
 *   get:
 *     summary: Get recent notifications
 *     description: Returns the most recent notifications for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Recent notifications returned
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/recent",
  verifyToken,
  getRecentNotifications
);



/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Deletes a specific notification.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */

router.delete(
  "/:id",
  verifyToken,
  deleteNotification
);



/**
 * @swagger
 * /notifications:
 *   delete:
 *     summary: Delete all notifications
 *     description: Deletes all notifications belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: All notifications deleted
 *       401:
 *         description: Unauthorized
 */

router.delete(
  "/",
  verifyToken,
  deleteAllNotifications
);

export default router;


































// import express from "express";
// import { getNotifications } from "../controllers/notification.js";

// const router = express.Router();

// router.get("/", getNotifications);

// export default router;










// import express from "express";
// import { getNotifications } from "../controllers/notification.js";

// const router = express.Router();

// router.get("/:userId", getNotifications);

// export default router;