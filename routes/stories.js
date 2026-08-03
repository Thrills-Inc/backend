import express from "express";
import { getStories, addStory, deleteStory, getUserStories, getActiveStories, } from "../controllers/story.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Get stories feed
 *     description: Returns stories from the authenticated user and users they follow.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Stories
 *     responses:
 *       200:
 *         description: Stories retrieved successfully
 *       401:
 *         description: Unauthorized
 */

router.get("/", verifyToken, getStories);



/**
 * @swagger
 * /stories:
 *   post:
 *     summary: Create story
 *     description: Creates a new story for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Stories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - img
 *             properties:
 *               img:
 *                 type: string
 *                 example: https://example.com/story.jpg
 *     responses:
 *       201:
 *         description: Story created successfully
 *       400:
 *         description: Story image is required
 *       401:
 *         description: Unauthorized
 */

router.post("/", verifyToken, addStory);



/**
 * @swagger
 * /stories/user/{userId}:
 *   get:
 *     summary: Get user stories
 *     description: Returns all stories created by a specific user.
 *     tags:
 *       - Stories
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: User stories returned successfully
 *       404:
 *         description: User not found
 */

router.get(
    "/user/:userId",
    getUserStories
);




/**
 * @swagger
 * /stories/active:
 *   get:
 *     summary: Get active stories
 *     description: Returns all stories created within the last 24 hours.
 *     tags:
 *       - Stories
 *     responses:
 *       200:
 *         description: Active stories returned successfully
 */

router.get(
    "/active",
    getActiveStories
);



/**
 * @swagger
 * /stories/{id}:
 *   delete:
 *     summary: Delete story
 *     description: Deletes a story owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Stories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Story deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You can delete only your story
 */

router.delete("/:id", verifyToken, deleteStory);

export default router;