import express from "express";

import {
  savePost,
  getSavedPosts,
  removeSavedPost,
  isPostSaved,
  getSavedPostsCount,
} from "../controllers/saved.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.post(
  "/",
  verifyToken,
  savePost
);

router.get(
  "/",
  verifyToken,
  getSavedPosts
);

router.delete(
  "/:postId",
  verifyToken,
  removeSavedPost
);

router.get(
  "/check/:postId",
  verifyToken,
  isPostSaved
);

router.get(
  "/count/all",
  verifyToken,
  getSavedPostsCount
);

export default router;














// import express from "express";
// import {
//   savePost,
//   getSavedPosts,
//   removeSavedPost
// } from "../controllers/saved.js";

// const router = express.Router();

// router.post("/", savePost);
// router.get("/:userId", getSavedPosts);
// router.delete("/:postId/:userId", removeSavedPost);

// export default router;