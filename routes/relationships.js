import express from "express";
import { getRelationships, addRelationship, deleteRelationship, getRelationshipCounts } from "../controllers/relationship.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router()

/**
 * @swagger
 * /relationships:
 *   get:
 *     summary: Get following relationships
 *     description: Returns a list of users followed by a specific user.
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: query
 *         name: followedUserId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Relationships retrieved successfully
 *       400:
 *         description: Invalid request
 */

router.get("/", getRelationships)


/**
 * @swagger
 * /relationships/count:
 *   get:
 *     summary: Get follower and following counts
 *     description: Returns follower and following statistics for a user.
 *     tags:
 *       - Relationships
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Relationship counts returned
 *       404:
 *         description: User not found
 */
router.get("/count", getRelationshipCounts);

/**
 * @swagger
 * /relationships:
 *   post:
 *     summary: Follow a user
 *     description: Creates a following relationship between the authenticated user and another user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Relationships
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 25
 *     responses:
 *       200:
 *         description: User followed successfully
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Relationship already exists
 */
router.post("/", verifyToken, addRelationship)



/**
 * @swagger
 * /relationships:
 *   delete:
 *     summary: Unfollow a user
 *     description: Removes a following relationship.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Relationships
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 25
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Relationship not found
 */
router.delete("/", verifyToken, deleteRelationship)


export default router