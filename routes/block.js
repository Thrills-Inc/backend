import express
from "express";

import {
  verifyToken,
} from "../middleware/authMiddleware.js";

import {

  blockUser,

  unblockUser,

  getBlockedUsers,

} from "../controllers/block.js";

const router =
  express.Router();


/**
 * @swagger
 * /block:
 *   post:
 *     summary: Block user
 *     description: Blocks another user from interacting with the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Block
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blockedId
 *             properties:
 *               blockedId:
 *                 type: integer
 *                 example: 15
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Cannot block yourself
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/",
  verifyToken,
  blockUser
);


/**
 * @swagger
 * /block/{id}:
 *   delete:
 *     summary: Unblock user
 *     description: Removes a user from the authenticated user's block list.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Block
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       401:
 *         description: Unauthorized
 */

router.delete(
  "/:id",
  verifyToken,
  unblockUser
);



/**
 * @swagger
 * /block:
 *   get:
 *     summary: Get blocked users
 *     description: Returns all users blocked by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Block
 *     responses:
 *       200:
 *         description: Blocked users returned successfully
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/",
  verifyToken,
  getBlockedUsers
);

export default router;