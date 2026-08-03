import express
from "express";

import {
  upload,
} from "../middleware/upload.js";

import {
  verifyToken,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.post(

  "/",

  verifyToken,

  upload.single(
    "file"
  ),

  (
    req,
    res
  ) => {

    return res
      .status(200)
      .json({

        filename:
          req.file.filename,

      });

  }

);

export default router;