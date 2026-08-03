import express from "express";

import {
  verifyToken,
} from "../middleware/authMiddleware.js";

import {
  authorize,
} from "../middleware/roleMiddleware.js";

import {

  banUser,
  unbanUser,

  getDashboardStats,

  getAllUsers,

  deleteAnyPost,

  deleteAnyComment,

} from "../controllers/admin.js";

const router =
  express.Router();



/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: Returns platform-wide statistics for administrators.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Dashboard statistics returned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

router.get(
  "/dashboard",

  verifyToken,

  authorize(
    "admin",
    "superadmin"
  ),

  getDashboardStats
);




/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     description: Returns all registered users.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Users returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

router.get(
  "/users",

  verifyToken,

  authorize(
    "admin",
    "superadmin"
  ),

  getAllUsers
);



/**
 * @swagger
 * /admin/ban/{id}:
 *   put:
 *     summary: Ban user
 *     description: Prevents a user from accessing the platform.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: User banned successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */

router.put(
  "/ban/:id",

  verifyToken,

  authorize(
    "admin",
    "superadmin"
  ),

  banUser
);



/**
 * @swagger
 * /admin/unban/{id}:
 *   put:
 *     summary: Unban user
 *     description: Restores platform access for a banned user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */

router.put(
  "/unban/:id",

  verifyToken,

  authorize(
    "admin",
    "superadmin"
  ),

  unbanUser
);



/**
 * @swagger
 * /admin/posts/{id}:
 *   delete:
 *     summary: Delete any post
 *     description: Allows moderators and administrators to remove a post.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 25
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       403:
 *         description: Moderator/Admin access required
 */

router.delete(
  "/posts/:id",

  verifyToken,

  authorize(
    "moderator",
    "admin",
    "superadmin"
  ),

  deleteAnyPost
);



/**
 * @swagger
 * /admin/comments/{id}:
 *   delete:
 *     summary: Delete any comment
 *     description: Allows moderators and administrators to remove a comment.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 30
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       403:
 *         description: Moderator/Admin access required
 */

router.delete(
  "/comments/:id",

  verifyToken,

  authorize(
    "moderator",
    "admin",
    "superadmin"
  ),

  deleteAnyComment
);

export default router;




















































// import express from "express";

// import { verifyToken }
// from "../middleware/authMiddleware.js";

// import { authorize }
// from "../middleware/roleMiddleware.js";

// import {
//   banUser,
//   unbanUser,
//   getDashboardStats,
// } from "../controllers/admin.js";

// const router =
//   express.Router();

// router.get(
//   "/dashboard",

//   verifyToken,

//   authorize(
//     "admin",
//     "superadmin"
//   ),

//   getDashboardStats
// );

// router.put(
//   "/ban/:id",

//   verifyToken,

//   authorize(
//     "admin",
//     "superadmin"
//   ),

//   banUser
// );

// router.put(
//   "/unban/:id",

//   verifyToken,

//   authorize(
//     "admin",
//     "superadmin"
//   ),

//   unbanUser
// );

// export default router;