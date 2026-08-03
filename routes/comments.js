import express from "express";
import { getComments, addComment, deleteComment } from "../controllers/comment.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { commentLimiter } from "../middleware/rateLimiter.js";
import {
  validate,
  commentValidation,
} from "../middleware/validation.js";

const router = express.Router()

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get comments for a post
 *     description: Returns all comments belonging to a post.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       400:
 *         description: Invalid request
 */

router.get("/", getComments)

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Add comment
 *     description: Create a new comment on a post.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - desc
 *             properties:
 *               postId:
 *                 type: integer
 *                 example: 15
 *               desc:
 *                 type: string
 *                 example: This is a great post!
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post("/", verifyToken, commentLimiter, commentValidation, validate, addComment);


/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete comment
 *     description: Deletes a comment owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 25
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Unauthorized deletion attempt
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", verifyToken, deleteComment);








// router.post("/", addComment)
// router.delete("/:id", deleteComment);


// router.get("/test", getUser)
export default router;