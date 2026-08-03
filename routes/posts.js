import express from "express";

import {
  getPosts,
  addPost,
  deletePost,
  getTrendingPosts,
  getPostsByHashtag,
  getTrendingHashtags,
  getExplorePosts,
} from "../controllers/post.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import {
  validate,
  postValidation,
} from "../middleware/validation.js";

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get feed posts
 *     description: Returns posts for the authenticated user's feed.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       401:
 *         description: Unauthorized
 */

router.get("/", verifyToken, getPosts);

/**
 * @swagger
 * /posts/trending:
 *   get:
 *     summary: Get trending posts
 *     description: Returns the most popular posts based on engagement.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Trending posts returned
 *       401:
 *         description: Unauthorized
 */

router.get("/trending", verifyToken, getTrendingPosts);

/**
 * @swagger
 * /posts/explore:
 *   get:
 *     summary: Explore posts
 *     description: Returns recommended posts for discovery.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Explore posts returned
 *       401:
 *         description: Unauthorized
 */

router.get("/explore", verifyToken, getExplorePosts);

/**
 * @swagger
 * /posts/trending-hashtags:
 *   get:
 *     summary: Get trending hashtags
 *     description: Returns the most popular hashtags on the platform.
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Trending hashtags returned
 */

router.get("/trending-hashtags", getTrendingHashtags);

/**
 * @swagger
 * /posts/hashtag/{tag}:
 *   get:
 *     summary: Get posts by hashtag
 *     description: Returns all posts containing a hashtag.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         example: travel
 *     responses:
 *       200:
 *         description: Posts returned successfully
 *       401:
 *         description: Unauthorized
 */

router.get("/hashtag/:tag", verifyToken, getPostsByHashtag);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a post
 *     description: Creates a new post for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               desc:
 *                 type: string
 *                 example: Enjoying my vacation
 *               img:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */

router.post("/", verifyToken, postValidation, validate, addPost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a post owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Unauthorized deletion attempt
 *       404:
 *         description: Post not found
 */

router.delete("/:id", verifyToken, deletePost);

export default router;






















































// import express from "express";

// import {
//   getPosts,
//   addPost,
//   deletePost,
//   getTrendingPosts,
//   getPostsByHashtag,
//   getTrendingHashtags,
//   getExplorePosts,
// } from "../controllers/post.js";

// const router = express.Router();

// router.get("/", getPosts);

// router.get("/trending", getTrendingPosts);

// router.get("/explore", getExplorePosts);

// router.get("/trending-hashtags", getTrendingHashtags);

// router.get("/hashtag/:tag", getPostsByHashtag);

// router.post("/", addPost);

// router.delete("/:id", deletePost);

// export default router;



































// // import express from "express";
// // import { getPosts, addPost, deletePost, getTrendingPosts, getPostsByHashtag, getTrendingHashtags, getExplorePosts } from "../controllers/post.js";

// // const router = express.Router()

// // router.get("/", getPosts);
// // router.post("/", addPost);
// // router.get("/trending", getTrendingPosts);
// // router.get("/hashtag/:tag", getPostsByHashtag);
// // router.get("/trending-hashtags", getTrendingHashtags);
// // router.get("/explore", getExplorePosts);
// // router.delete("/:id", deletePost);
// // // router.get("/trending", getTrendingPosts);


// // // router.get("/test", getUser)
// // export default router;