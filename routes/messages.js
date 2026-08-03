import express from "express";

import {
  sendMessage,
  getMessages,
  markMessageAsSeen,
  markConversationAsSeen
} from "../controllers/message.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
import {
  validate,
  messageValidation,
} from "../middleware/validation.js";

// import { messageLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();


/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     description: Sends a message to a conversation participant.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - text
 *             properties:
 *               conversationId:
 *                 type: integer
 *                 example: 10
 *               text:
 *                 type: string
 *                 example: Hello, how are you?
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid message
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Messaging unavailable
 *       404:
 *         description: Conversation not found
 *       429:
 *         description: Too many requests
 */

// SEND MESSAGE
router.post("/", verifyToken, messageLimiter, messageValidation, validate, sendMessage);



/**
 * @swagger
 * /messages/{conversationId}:
 *   get:
 *     summary: Get conversation messages
 *     description: Returns paginated messages for a conversation.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 30
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       404:
 *         description: Conversation not found
 */
// GET CONVERSATION MESSAGES
router.get(
  "/:conversationId",
  verifyToken,
  getMessages
);


/**
 * @swagger
 * /messages/seen/{messageId}:
 *   put:
 *     summary: Mark message as seen
 *     description: Marks a specific message as read.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 25
 *     responses:
 *       200:
 *         description: Message marked as seen
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */

router.put(
  "/seen/:messageId",
  verifyToken,
  markMessageAsSeen
);


/**
 * @swagger
 * /messages/conversation/seen/{conversationId}:
 *   put:
 *     summary: Mark conversation as seen
 *     description: Marks all unread messages in a conversation as read.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Conversation marked as seen
 *       401:
 *         description: Unauthorized
 */

router.put(
  "/conversation/seen/:conversationId",
  // "/conversation/:conversationId/seen",
  verifyToken,
  markConversationAsSeen
);

export default router;

































































// import express from "express";
// import {
//   sendMessage,
//   getMessages
// } from "../controllers/message.js";

// const router = express.Router();

// router.post("/", sendMessage);

// router.get("/:conversationId", getMessages);

// export default router;