import express from "express";

import {
  searchAll,
  searchUsers,
  searchPosts,
  searchHashtags,
  getTrendingSearches,
} from "../controllers/search.js";

import { verifyToken } from "../middleware/authMiddleware.js";

import { searchLimiter } from "../middleware/rateLimiter.js";

const router =
  express.Router();


/**
 * @swagger
 * /search:
 *   get:
 *     summary: Global search
 *     description: Search users, posts, and hashtags from a single endpoint.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: travel
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 20
 *     responses:
 *       200:
 *         description: Search results returned
 *       400:
 *         description: Search query required
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */

router.get(
  "/",
  verifyToken,
  searchLimiter,
  searchAll
);



/**
 * @swagger
 * /search/users:
 *   get:
 *     summary: Search users
 *     description: Search users by username or display name.
 *     tags:
 *       - Search
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
 */

router.get(
  "/users",
  searchUsers
);



/**
 * @swagger
 * /search/posts:
 *   get:
 *     summary: Search posts
 *     description: Search posts by content.
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: vacation
 *     responses:
 *       200:
 *         description: Posts returned successfully
 *       400:
 *         description: Search query required
 */

router.get(
  "/posts",
  searchPosts
);



/**
 * @swagger
 * /search/hashtags:
 *   get:
 *     summary: Search hashtags
 *     description: Search hashtags by keyword.
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: travel
 *     responses:
 *       200:
 *         description: Hashtags returned successfully
 *       400:
 *         description: Search query required
 */

router.get(
  "/hashtags",
  searchHashtags
);



/**
 * @swagger
 * /search/trending:
 *   get:
 *     summary: Get trending searches
 *     description: Returns the most frequently searched keywords on the platform.
 *     tags:
 *       - Search
 *     responses:
 *       200:
 *         description: Trending searches returned successfully
 */

router.get(
  "/trending",
  getTrendingSearches
);

export default router;






















// import express from "express";
// import { searchAll } from "../controllers/search.js";

// const router = express.Router();

// router.get("/", searchAll);

// export default router;