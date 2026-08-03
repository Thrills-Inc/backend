import express from "express";

import {
  getPostsByHashtag,
  getTrendingHashtags,
  searchHashtags,
  trackHashtagVisit,
} from "../controllers/hashtag.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.get(
  "/trending",
  getTrendingHashtags
);

router.get(
  "/search",
  searchHashtags
);

router.post(
  "/visit/:tag",
  verifyToken,
  trackHashtagVisit
);

router.get(
  "/:tag",
  getPostsByHashtag
);

export default router;


































// import express from "express";
// import { getPostsByHashtag } from "../controllers/hashtag.js";

// const router = express.Router();

// router.get("/:tag", getPostsByHashtag);

// export default router;