import express from "express";
import { getLikes, addLike, deleteLike } from "../controllers/like.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { likeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router()

/**
 * @swagger
 * /likes:
 *   get:
 *     summary: Get likes for a post
 *     description: Returns all likes associated with a post.
 *     tags:
 *       - Likes
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: Likes retrieved successfully
 *       400:
 *         description: Invalid request
 */

router.get("/", getLikes)

/**
 * @swagger
 * /likes:
 *   post:
 *     summary: Like a post
 *     description: Adds a like from the authenticated user to a post.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Likes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: integer
 *                 example: 15
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post("/", verifyToken, likeLimiter, addLike)

/**
 * @swagger
 * /likes:
 *   delete:
 *     summary: Remove like
 *     description: Removes the authenticated user's like from a post.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Likes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: integer
 *                 example: 15
 *     responses:
 *       200:
 *         description: Like removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Like not found
 */
router.delete("/", verifyToken, deleteLike)




// router.get("/test", getUser)
export default router;