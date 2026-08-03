import express from "express";

import {
  getUser,
  updateUser,
  getSuggestedUsers,
  searchUsers,
  getUserStatus,
} from "../controllers/user.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by username or name.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: john
 *     responses:
 *       200:
 *         description: Users returned successfully
 *       400:
 *         description: Search query required
 *       401:
 *         description: Unauthorized
 */

// SEARCH USERS
router.get(
  "/search",
  verifyToken,
  searchUsers
);

/**
 * @swagger
 * /users/suggested/{userId}:
 *   get:
 *     summary: Get suggested users
 *     description: Returns user recommendations based on current user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Suggested users returned
 *       401:
 *         description: Unauthorized
 */

// SUGGESTED USERS
router.get(
  "/suggested/:userId",
  verifyToken,
  getSuggestedUsers
);

/**
 * @swagger
 * /users/status/{userId}:
 *   get:
 *     summary: Get user online status
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User status returned
 *       404:
 *         description: User not found
 */

// USER ONLINE STATUS
router.get(
  "/status/:userId",
  getUserStatus
);

/**
 * @swagger
 * /users/find/{userId}:
 *   get:
 *     summary: Get user profile
 *     description: Returns a user's public profile information.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User returned successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */

// GET SINGLE USER
router.get(
  "/find/:userId",
  verifyToken,
  getUser
);

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               website:
 *                 type: string
 *               profilePic:
 *                 type: string
 *               coverPic:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// UPDATE USER
router.put(
  "/",
  verifyToken,
  updateUser
);

export default router;
































// import express from "express";
// import { getUser, updateUser, getSuggestedUsers, searchUsers, getUserStatus } from "../controllers/user.js";

// const router = express.Router()

// // router.get("/find/:userId", getUser)
// router.get("/search", searchUsers);
// router.get("/suggested/:userId", getSuggestedUsers);
// router.get(
//   "/status/:userId",
//   getUserStatus
// );
// // router.get("/search", searchUsers);
// router.get("/find/:userId", getUser)
// router.put("/", updateUser)
// // router.get("/suggested/:userId", getSuggestedUsers);


// // router.get("/test", getUser)
// export default router;