import express from "express";

import {
  addInterests,
  getUserInterests,
  updateInterests,
  deleteInterest,
  getPopularInterests,
} from "../controllers/interests.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.post(
  "/",
  verifyToken,
  addInterests
);

router.get(
  "/popular",
  getPopularInterests
);

router.get(
  "/:userId",
  getUserInterests
);

router.put(
  "/",
  verifyToken,
  updateInterests
);

router.delete(
  "/:id",
  verifyToken,
  deleteInterest
);

export default router;




































// import express from "express";
// import { addInterests, getUserInterests, } from "../controllers/interests.js";

// const router = express.Router();

// router.post("/", addInterests);
// router.get("/:userId", getUserInterests);

// export default router;