import express from "express";

import {
  createConversation,
  getConversations,
  deleteConversation,
  getConversation,
  getUnreadConversationsCount
} from "../controllers/conversation.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Create conversation
 *     description: Creates a new conversation between two users.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Conversations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: integer
 *                 example: 25
 *     responses:
 *       201:
 *         description: Conversation created
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conversation already exists
 */

// CREATE CONVERSATION
router.post(
  "/",
  verifyToken,
  createConversation
);


/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Get user conversations
 *     description: Returns all conversations for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Conversations
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       401:
 *         description: Unauthorized
 */

// GET USER CONVERSATIONS
router.get(
  "/",
  verifyToken,
  getConversations
);



/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Get single conversation
 *     description: Returns details of a specific conversation.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Conversations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/:id",
  // "/single/:id",
  verifyToken,
  getConversation
);



/**
 * @swagger
 * /conversations/{id}:
 *   delete:
 *     summary: Delete conversation
 *     description: Deletes a conversation owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Conversations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */

router.delete(
  "/:id",
  verifyToken,
  deleteConversation
);



/**
 * @swagger
 * /conversations/unread/count:
 *   get:
 *     summary: Get unread conversation count
 *     description: Returns the number of conversations containing unread messages.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Conversations
 *     responses:
 *       200:
 *         description: Unread count returned
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/unread/count",
  verifyToken,
  getUnreadConversationsCount
);

export default router;















































// import express from "express";

// import {
//   createConversation,
//   getConversations
// } from "../controllers/conversation.js";

// const router = express.Router();

// router.post("/", createConversation);

// router.get("/:userId", getConversations);

// export default router;