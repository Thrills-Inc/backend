import express from "express";
import { getDiscoverPosts, getPersonalizedFeed, getTrendingCreators, getExploreHashtags, trackDiscoverVisit } from "../controllers/discover.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @swagger
 * /discover:
 *   get:
 *     summary: Get discover posts
 *     description: Returns popular and recommended posts for discovery.
 *     tags:
 *       - Discover
 *     parameters:
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
 *         description: Discover posts returned successfully
 */

router.get(
  "/",
  getDiscoverPosts
);


/**
 * @swagger
 * /discover/feed:
 *   get:
 *     summary: Get personalized feed
 *     description: Returns a feed based on the authenticated user's interests.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Discover
 *     parameters:
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
 *         description: Personalized feed returned
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/feed",
  verifyToken,
  getPersonalizedFeed
);


/**
 * @swagger
 * /discover/creators:
 *   get:
 *     summary: Get trending creators
 *     description: Returns the most popular creators based on followers and activity.
 *     tags:
 *       - Discover
 *     responses:
 *       200:
 *         description: Trending creators returned
 */

router.get(
  "/creators",
  getTrendingCreators
);



/**
 * @swagger
 * /discover/hashtags:
 *   get:
 *     summary: Get trending hashtags
 *     description: Returns the most popular hashtags currently used on the platform.
 *     tags:
 *       - Discover
 *     responses:
 *       200:
 *         description: Hashtags returned successfully
 */

router.get(
  "/hashtags",
  getExploreHashtags
);


/**
 * @swagger
 * /discover/visit:
 *   post:
 *     summary: Track discover page visit
 *     description: Records a discover-page visit for analytics and recommendations.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Discover
 *     responses:
 *       200:
 *         description: Visit tracked successfully
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/visit",
  verifyToken,
  trackDiscoverVisit
);



export default router;

























































// router.get("/", getDiscoverPosts);

// router.get("/feed", verifyToken, getPersonalizedFeed);

// router.get("/:userId", getPersonalizedFeed);




