import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";

import multer from "multer";

import swaggerUi
from "swagger-ui-express";

import specs
from "./swagger.js";

import cloudinary from "./utils/cloudinary.js";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import {
  requestLogger,
} from "./middleware/requestLogger.js";

import {
  errorHandler,
} from "./middleware/errorHandler.js";

import {
  apiLimiter,
} from "./middleware/rateLimiter.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import relationshipRoutes from "./routes/relationships.js";
import discoverRoutes from "./routes/discover.js";
import interestRoutes from "./routes/interests.js";
import notificationRoutes from "./routes/notifications.js";
import hashtagRoutes from "./routes/hashtags.js";
import savedRoutes from "./routes/saved.js";
import searchRoutes from "./routes/search.js";
import messageRoutes from "./routes/messages.js";
import conversationRoutes from "./routes/conversations.js";
import analyticsRoutes from "./routes/analytics.js";
import adminRoutes from "./routes/admin.js";
import reportRoutes from "./routes/reports.js";
import auditRoutes from "./routes/audit.js";
import blockRoutes from "./routes/block.js";
import uploadRoutes from "./routes/upload.js";
import storyRoutes from "./routes/stories.js"

const app = express();

// BASIC HEALTH CHECK
app.get("/", (req, res) => {

  res.status(200).json({
    message: "API Running",
  });

});

// RENDER HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Thrills API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// HEADERS
app.use((req, res, next) => {

  res.header(
    "Access-Control-Allow-Credentials",
    true
  );

  next();

});

// BODY PARSER
app.use(express.json());

// RATE LIMITING
app.use(
  "/api",
  apiLimiter
);

// SECURITY
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],

    credentials: true,
  })
);

// COOKIES
app.use(cookieParser());

// STATIC FILES
app.use(
  "/uploads",

  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

// CLOUDINARY STORAGE
const storage =
  new CloudinaryStorage({

    cloudinary,

    params: {

      folder: "thrills",

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],

    },

  });

const upload =
  multer({ storage });

// FILE UPLOAD
app.post(
  "/api/upload",

  upload.single("file"),

  (req, res) => {

    if (!req.file) {

      return res
        .status(400)
        .json(
          "No file uploaded."
        );

    }

    return res
      .status(200)
      .json(
        req.file.path
      );

  }
);

// REQUEST LOGGER
app.use(requestLogger);

// ROUTES
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/likes", likeRoutes);

app.use(
  "/api/relationships",
  relationshipRoutes
);

app.use(
  "/api/discover",
  discoverRoutes
);

app.use(
  "/api/interests",
  interestRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/hashtags",
  hashtagRoutes
);

app.use(
  "/api/saved",
  savedRoutes
);

app.use(
  "/api/search",
  searchRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/conversations",
  conversationRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/audit",
  auditRoutes
);

app.use(
  "/api/block",
  blockRoutes
);

app.use(
  "/api/stories",
  storyRoutes
)

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

// ERROR HANDLER MUST BE LAST
app.use(errorHandler);

export default app;













































// import request from "supertest";
// import app from "../../app.js";

// describe("Auth API", () => {

//   test(
//     "POST login with invalid credentials",
//     async () => {

//       const res =
//         await request(app)

//           .post(
//             "/api/auth/login"
//           )

//           .send({
//             email:
//               "fake@test.com",

//             password:
//               "wrongpassword"
//           });

//       expect(
//         res.statusCode
//       ).toBeGreaterThanOrEqual(
//         400
//       );

//     }
//   );

// });

























// import express from "express";

// const app =
//   express();

// app.use(
//   express.json()
// );

// export default app;