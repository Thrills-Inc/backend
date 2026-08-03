import { createServer }
from "http";

import { Server }
from "socket.io";

import app from "./app.js";

import {
  initializeSocket,
} from "./sockets/socketHandler.js";

import { setIO } from "./sockets/socketInstance.js";

const httpServer =
  createServer(app);

const io =
  new Server(httpServer, {

    cors: {

      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
      ],

      credentials: true,

    },

  });

  setIO(io);

initializeSocket(io);

const PORT =
  process.env.PORT || 8800;

httpServer.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);


































































// import express from "express";
// const app = express();

// import { createServer } from "http";
// import { Server } from "socket.io";

// import cors from "cors";
// import multer from "multer";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";

// import cloudinary from "./utils/cloudinary.js";

// import {
//   CloudinaryStorage,
// } from "multer-storage-cloudinary";

// // SOCKET HANDLER
// import {
//   initializeSocket,
// } from "./sockets/socketHandler.js";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";
// import { requestLogger } from "./middleware/requestLogger.js";
// import analyticsRoutes
// from "./routes/analytics.js";
// import adminRoutes
// from "./routes/admin.js";
// import reportRoutes
// from "./routes/reports.js";
// import auditRoutes
// from "./routes/audit.js";
// import blockRoutes
// from "./routes/block.js";
// import uploadRoutes
// from "./routes/upload.js";
// import path from "path";
// import { apiLimiter } from "./middleware/rateLimiter.js";

// // import app from "./app.js";

// // server.listen(
// //   process.env.PORT,
// //   () => {
// //     console.log("Server running");
// //   }
// // );

// // ERROR HANDLER
// import {
//   errorHandler,
// } from "./middleware/errorHandler.js";

// // MIDDLEWARES
// app.use((req, res, next) => {

//   res.header(
//     "Access-Control-Allow-Credentials",
//     true
//   );

//   next();

// });

// app.use(express.json());

// app.use(
//   "/api",
//   apiLimiter
// );

// // SECURITY
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// // CORS
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],

//     credentials: true,
//   })
// );

// app.use(cookieParser());

// // CLOUDINARY STORAGE
// const storage =
//   new CloudinaryStorage({

//     cloudinary,

//     params: {

//       folder: "thrills",

//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//       ],

//     },

//   });

//   app.use(
//   "/uploads",

//   express.static(
//     path.join(
//       process.cwd(),
//       "uploads"
//     )
//   )
// );

// // MULTER
// const upload =
//   multer({ storage });

// // UPLOAD ROUTE
// app.post(
//   "/api/upload",

//   upload.single("file"),

//   (req, res) => {

//     const file = req.file;

//     if (!file) {

//       return res
//         .status(400)
//         .json("No file uploaded.");

//     }

//     return res
//       .status(200)
//       .json(file.path);

//   }
// );

// // API ROUTES
// app.use("/api/auth", authRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/comments", commentRoutes);

// app.use("/api/likes", likeRoutes);

// app.use(
//   "/api/relationships",
//   relationshipRoutes
// );

// app.use(
//   "/api/discover",
//   discoverRoutes
// );

// app.use(
//   "/api/interests",
//   interestRoutes
// );

// app.use(
//   "/api/notifications",
//   notificationRoutes
// );

// app.use(
//   "/api/hashtags",
//   hashtagRoutes
// );

// app.use("/api/saved", savedRoutes);

// app.use("/api/search", searchRoutes);

// app.use("/api/messages", messageRoutes);

// app.use(
//   "/api/conversations",
//   conversationRoutes
// );

// app.use(
//   requestLogger
// );

// app.use(
//   "/api/analytics",
//   analyticsRoutes
// );

// app.use(
//   "/api/admin",
//   adminRoutes
// );

// app.use(
//   "/api/reports",
//   reportRoutes
// );

// app.use(
//   "/api/audit",
//   auditRoutes
// );

// app.use(
//   "/api/block",
//   blockRoutes
// );

// app.use(
//   "/api/upload",
//   uploadRoutes
// );

// // ERROR HANDLER LAST
// app.use(errorHandler);

// // HTTP SERVER
// const httpServer =
//   createServer(app);

// // SOCKET SERVER
// export const io =
//   new Server(httpServer, {

//     cors: {

//       origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//       ],

//       credentials: true,

//     },

//   });

// // INITIALIZE SOCKETS
// initializeSocket(io);

// // GLOBAL ERROR HANDLER
// app.use(errorHandler);

// // START SERVER
// httpServer.listen(
//   8800,
//   () => {

//     console.log(
//       "Socket server running"
//     );

//   }
// );











































// import express from "express";
// const app = express();

// import { createServer } from "http";
// import { Server } from "socket.io";

// import cors from "cors";
// import multer from "multer";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import jwt from "jsonwebtoken";

// import { db } from "./connect.js";

// import cloudinary from "./utils/cloudinary.js";

// import {
//   CloudinaryStorage,
// } from "multer-storage-cloudinary";

// import {
//   onlineUsers,
// } from "./utils/onlineUsers.js";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";

// // ERROR HANDLER
// import {
//   errorHandler,
// } from "./middleware/errorHandler.js";

// // MIDDLEWARES
// app.use((req, res, next) => {

//   res.header(
//     "Access-Control-Allow-Credentials",
//     true
//   );

//   next();

// });

// app.use(express.json());

// // SECURITY
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// // CORS
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],

//     credentials: true,
//   })
// );

// app.use(cookieParser());

// // CLOUDINARY STORAGE
// const storage =
//   new CloudinaryStorage({

//     cloudinary,

//     params: {

//       folder: "thrills",

//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//       ],

//     },

//   });

// // MULTER
// const upload =
//   multer({ storage });

// // UPLOAD ROUTE
// app.post(
//   "/api/upload",

//   upload.single("file"),

//   (req, res) => {

//     const file = req.file;

//     if (!file) {

//       return res
//         .status(400)
//         .json("No file uploaded.");

//     }

//     return res
//       .status(200)
//       .json(file.path);

//   }
// );

// // API ROUTES
// app.use("/api/auth", authRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/comments", commentRoutes);

// app.use("/api/likes", likeRoutes);

// app.use(
//   "/api/relationships",
//   relationshipRoutes
// );

// app.use(
//   "/api/discover",
//   discoverRoutes
// );

// app.use(
//   "/api/interests",
//   interestRoutes
// );

// app.use(
//   "/api/notifications",
//   notificationRoutes
// );

// app.use(
//   "/api/hashtags",
//   hashtagRoutes
// );

// app.use("/api/saved", savedRoutes);

// app.use("/api/search", searchRoutes);

// app.use("/api/messages", messageRoutes);

// app.use(
//   "/api/conversations",
//   conversationRoutes
// );

// // HTTP SERVER
// const httpServer =
//   createServer(app);

// // SOCKET SERVER
// export const io =
//   new Server(httpServer, {

//     cors: {

//       origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//       ],

//       credentials: true,

//     },

//   });

// // SOCKET AUTHENTICATION
// io.use((socket, next) => {

//   const token =
//     socket.handshake.auth.token;

//   if (!token) {

//     return next(
//       new Error(
//         "Authentication error"
//       )
//     );

//   }

//   jwt.verify(
//     token,
//     process.env.JWT_SECRET,

//     (err, userInfo) => {

//       if (err) {

//         return next(
//           new Error(
//             "Invalid token"
//           )
//         );

//       }

//       socket.userInfo =
//         userInfo;

//       next();

//     }
//   );

// });

// // ADD USER
// const addUser = (
//   userId,
//   socketId
// ) => {

//   onlineUsers.set(
//     userId.toString(),
//     socketId
//   );

// };

// // REMOVE USER
// const removeUser =
//   (socketId) => {

//     for (
//       const [userId, id]
//       of onlineUsers.entries()
//     ) {

//       if (id === socketId) {

//         onlineUsers.delete(
//           userId
//         );

//         break;

//       }

//     }

//   };

// // GET USER SOCKET
// const getUser = (
//   userId
// ) => {

//   return onlineUsers.get(
//     userId.toString()
//   );

// };

// // SOCKET CONNECTION
// io.on(
//   "connection",
//   (socket) => {

//     console.log(
//       "User connected"
//     );

//     // AUTHENTICATED USER
//     const userId =
//       socket.userInfo.id;

//     // JOIN ROOM
//     socket.join(
//       userId.toString()
//     );

//     // ADD ONLINE USER
//     addUser(
//       userId,
//       socket.id
//     );

//     // SEND ONLINE USERS
//     io.emit(
//       "getUsers",
//       Array.from(
//         onlineUsers.keys()
//       )
//     );

//     // SEND NOTIFICATION
//     socket.on(
//       "sendNotification",

//       ({
//         receiverId,
//         type,
//       }) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(receiverId);

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getNotification",
//             {
//               senderId,
//               type,
//             }
//           );

//           console.log(
//             "Realtime notification sent"
//           );

//         }

//       }
//     );

//     // SEND MESSAGE
//     socket.on(
//       "sendMessage",
//       (data) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(
//             data.receiverId
//           );

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getMessage",
//             {
//               senderId,

//               text:
//                 data.text,

//               conversationId:
//                 data.conversationId,
//             }
//           );

//           console.log(
//             "Realtime message sent"
//           );

//         }

//       }
//     );

//     // USER TYPING
//     socket.on(
//       "typing",
//       ({
//         receiverId,
//         conversationId,
//       }) => {

//         io.to(
//           receiverId.toString()
//         ).emit(
//           "userTyping",
//           {
//             senderId:
//               socket.userInfo.id,

//             conversationId,
//           }
//         );

//       }
//     );

//     // USER STOPPED TYPING
//     socket.on(
//       "stopTyping",
//       ({
//         receiverId,
//         conversationId,
//       }) => {

//         io.to(
//           receiverId.toString()
//         ).emit(
//           "userStoppedTyping",
//           {
//             senderId:
//               socket.userInfo.id,

//             conversationId,
//           }
//         );

//       }
//     );

//     // MARK MESSAGE AS SEEN
//     socket.on(
//       "markMessageSeen",
//       ({
//         messageId,
//         receiverId,
//       }) => {

//         const q = `
//           UPDATE messages
//           SET seen = 1
//           WHERE id = ?
//         `;

//         db.query(
//           q,
//           [messageId],
//           (err) => {

//             if (err) {

//               console.log(
//                 "Failed to mark message as seen"
//               );

//               return;

//             }

//             io.to(
//               receiverId.toString()
//             ).emit(
//               "messageSeen",
//               {
//                 messageId,
//               }
//             );

//             console.log(
//               "Message marked as seen"
//             );

//           }
//         );

//       }
//     );

//     // DISCONNECT
//     socket.on(
//       "disconnect",
//       () => {

//         console.log(
//           "User disconnected"
//         );

//         // UPDATE LAST SEEN
//         const q = `
//           UPDATE users
//           SET lastSeen = NOW()
//           WHERE id = ?
//         `;

//         db.query(
//           q,
//           [userId],
//           (err) => {

//             if (err) {

//               console.log(
//                 "Failed to update lastSeen"
//               );

//             }

//           }
//         );

//         // REMOVE USER
//         removeUser(
//           socket.id
//         );

//         // UPDATE ONLINE USERS
//         io.emit(
//           "getUsers",
//           Array.from(
//             onlineUsers.keys()
//           )
//         );

//       }
//     );

//   }
// );

// // GLOBAL ERROR HANDLER
// app.use(errorHandler);

// // START SERVER
// httpServer.listen(
//   8800,
//   () => {

//     console.log(
//       "Socket server running"
//     );

//   }
// );















































































// import express from "express";
// const app = express();

// import { createServer } from "http";
// import { Server } from "socket.io";

// import cors from "cors";
// import multer from "multer";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import jwt from "jsonwebtoken";

// import { db } from "./connect.js";

// import cloudinary from "./utils/cloudinary.js";

// import {
//   CloudinaryStorage,
// } from "multer-storage-cloudinary";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";

// // ERROR HANDLER
// import {
//   errorHandler,
// } from "./middleware/errorHandler.js";

// // MIDDLEWARES
// app.use((req, res, next) => {

//   res.header(
//     "Access-Control-Allow-Credentials",
//     true
//   );

//   next();

// });

// app.use(express.json());

// // SECURITY
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// // CORS
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],

//     credentials: true,
//   })
// );

// app.use(cookieParser());

// // CLOUDINARY STORAGE
// const storage =
//   new CloudinaryStorage({

//     cloudinary,

//     params: {

//       folder: "thrills",

//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//       ],

//     },

//   });

// // MULTER
// const upload =
//   multer({ storage });

// // UPLOAD ROUTE
// app.post(
//   "/api/upload",

//   upload.single("file"),

//   (req, res) => {

//     const file = req.file;

//     if (!file) {

//       return res
//         .status(400)
//         .json("No file uploaded.");

//     }

//     return res
//       .status(200)
//       .json(file.path);

//   }
// );

// // API ROUTES
// app.use("/api/auth", authRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/comments", commentRoutes);

// app.use("/api/likes", likeRoutes);

// app.use(
//   "/api/relationships",
//   relationshipRoutes
// );

// app.use(
//   "/api/discover",
//   discoverRoutes
// );

// app.use(
//   "/api/interests",
//   interestRoutes
// );

// app.use(
//   "/api/notifications",
//   notificationRoutes
// );

// app.use(
//   "/api/hashtags",
//   hashtagRoutes
// );

// app.use("/api/saved", savedRoutes);

// app.use("/api/search", searchRoutes);

// app.use("/api/messages", messageRoutes);

// app.use(
//   "/api/conversations",
//   conversationRoutes
// );

// // HTTP SERVER
// const httpServer =
//   createServer(app);

// // SOCKET SERVER
// export const io =
//   new Server(httpServer, {

//     cors: {

//       origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//       ],

//       credentials: true,

//     },

//   });

// // SOCKET AUTHENTICATION
// io.use((socket, next) => {

//   const token =
//     socket.handshake.auth.token;

//   if (!token) {

//     return next(
//       new Error(
//         "Authentication error"
//       )
//     );

//   }

//   jwt.verify(
//     token,
//     process.env.JWT_SECRET,

//     (err, userInfo) => {

//       if (err) {

//         return next(
//           new Error(
//             "Invalid token"
//           )
//         );

//       }

//       socket.userInfo =
//         userInfo;

//       next();

//     }
//   );

// });

// // ONLINE USERS
// let onlineUsers =
//   new Map();

// // ADD USER
// const addUser = (
//   userId,
//   socketId
// ) => {

//   onlineUsers.set(
//     userId.toString(),
//     socketId
//   );

// };

// // REMOVE USER
// const removeUser =
//   (socketId) => {

//     for (
//       const [userId, id]
//       of onlineUsers.entries()
//     ) {

//       if (id === socketId) {

//         onlineUsers.delete(
//           userId
//         );

//         break;

//       }

//     }

//   };

// // GET USER SOCKET
// const getUser = (
//   userId
// ) => {

//   return onlineUsers.get(
//     userId.toString()
//   );

// };

// // SOCKET CONNECTION
// io.on(
//   "connection",
//   (socket) => {

//     console.log(
//       "User connected"
//     );

//     // AUTHENTICATED USER
//     const userId =
//       socket.userInfo.id;

//     // JOIN ROOM
//     socket.join(
//       userId.toString()
//     );

//     // ADD ONLINE USER
//     addUser(
//       userId,
//       socket.id
//     );

//     // SEND ONLINE USERS
//     io.emit(
//       "getUsers",
//       Array.from(
//         onlineUsers.keys()
//       )
//     );

//     // SEND NOTIFICATION
//     socket.on(
//       "sendNotification",

//       ({
//         receiverId,
//         type,
//       }) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(receiverId);

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getNotification",
//             {
//               senderId,
//               type,
//             }
//           );

//           console.log(
//             "Realtime notification sent"
//           );

//         }

//       }
//     );

//     // SEND MESSAGE
//     socket.on(
//       "sendMessage",
//       (data) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(
//             data.receiverId
//           );

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getMessage",
//             {
//               senderId,

//               text:
//                 data.text,

//               conversationId:
//                 data.conversationId,
//             }
//           );

//           console.log(
//             "Realtime message sent"
//           );

//         }

//       }
//     );

//     // USER TYPING
//     socket.on(
//       "typing",
//       ({
//         receiverId,
//         conversationId,
//       }) => {

//         io.to(
//           receiverId.toString()
//         ).emit(
//           "userTyping",
//           {
//             senderId:
//               socket.userInfo.id,

//             conversationId,
//           }
//         );

//       }
//     );

//     // USER STOPPED TYPING
//     socket.on(
//       "stopTyping",
//       ({
//         receiverId,
//         conversationId,
//       }) => {

//         io.to(
//           receiverId.toString()
//         ).emit(
//           "userStoppedTyping",
//           {
//             senderId:
//               socket.userInfo.id,

//             conversationId,
//           }
//         );

//       }
//     );

//     // MARK MESSAGE AS SEEN
//     socket.on(
//       "markMessageSeen",
//       ({
//         messageId,
//         receiverId,
//       }) => {

//         const q = `
//           UPDATE messages
//           SET seen = 1
//           WHERE id = ?
//         `;

//         db.query(
//           q,
//           [messageId],
//           (err) => {

//             if (err) {

//               console.log(
//                 "Failed to mark message as seen"
//               );

//               return;

//             }

//             io.to(
//               receiverId.toString()
//             ).emit(
//               "messageSeen",
//               {
//                 messageId,
//               }
//             );

//             console.log(
//               "Message marked as seen"
//             );

//           }
//         );

//       }
//     );

//     // DISCONNECT
//     socket.on(
//       "disconnect",
//       () => {

//         console.log(
//           "User disconnected"
//         );

//         removeUser(
//           socket.id
//         );

//         io.emit(
//           "getUsers",
//           Array.from(
//             onlineUsers.keys()
//           )
//         );

//       }
//     );

//   }
// );

// // GLOBAL ERROR HANDLER
// app.use(errorHandler);

// // START SERVER
// httpServer.listen(
//   8800,
//   () => {

//     console.log(
//       "Socket server running"
//     );

//   }
// );
































































// import express from "express";
// const app = express();

// import { createServer } from "http";
// import { Server } from "socket.io";

// import cors from "cors";
// import multer from "multer";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import jwt from "jsonwebtoken";

// import cloudinary from "./utils/cloudinary.js";

// import {
//   CloudinaryStorage,
// } from "multer-storage-cloudinary";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";

// // ERROR HANDLER
// import {
//   errorHandler,
// } from "./middleware/errorHandler.js";

// // MIDDLEWARES
// app.use((req, res, next) => {

//   res.header(
//     "Access-Control-Allow-Credentials",
//     true
//   );

//   next();

// });

// app.use(express.json());

// // SECURITY
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// // CORS
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],

//     credentials: true,
//   })
// );

// app.use(cookieParser());

// // CLOUDINARY STORAGE
// const storage =
//   new CloudinaryStorage({

//     cloudinary,

//     params: {

//       folder: "thrills",

//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//       ],

//     },

//   });

// // MULTER
// const upload =
//   multer({ storage });

// // UPLOAD ROUTE
// app.post(
//   "/api/upload",

//   upload.single("file"),

//   (req, res) => {

//     const file = req.file;

//     if (!file) {

//       return res
//         .status(400)
//         .json("No file uploaded.");

//     }

//     return res
//       .status(200)
//       .json(file.path);

//   }
// );

// // API ROUTES
// app.use("/api/auth", authRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/comments", commentRoutes);

// app.use("/api/likes", likeRoutes);

// app.use(
//   "/api/relationships",
//   relationshipRoutes
// );

// app.use(
//   "/api/discover",
//   discoverRoutes
// );

// app.use(
//   "/api/interests",
//   interestRoutes
// );

// app.use(
//   "/api/notifications",
//   notificationRoutes
// );

// app.use(
//   "/api/hashtags",
//   hashtagRoutes
// );

// app.use("/api/saved", savedRoutes);

// app.use("/api/search", searchRoutes);

// app.use("/api/messages", messageRoutes);

// app.use(
//   "/api/conversations",
//   conversationRoutes
// );

// // HTTP SERVER
// const httpServer =
//   createServer(app);

// // SOCKET SERVER
// export const io =
//   new Server(httpServer, {

//     cors: {

//       origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//       ],

//       credentials: true,

//     },

//   });

// // SOCKET AUTHENTICATION
// io.use((socket, next) => {

//   const token =
//     socket.handshake.auth.token;

//   if (!token) {

//     return next(
//       new Error(
//         "Authentication error"
//       )
//     );

//   }

//   jwt.verify(
//     token,
//     process.env.JWT_SECRET,

//     (err, userInfo) => {

//       if (err) {

//         return next(
//           new Error(
//             "Invalid token"
//           )
//         );

//       }

//       socket.userInfo =
//         userInfo;

//       next();

//     }
//   );

// });

// // ONLINE USERS
// let onlineUsers =
//   new Map();

// // ADD USER
// const addUser = (
//   userId,
//   socketId
// ) => {

//   onlineUsers.set(
//     userId.toString(),
//     socketId
//   );

// };

// // REMOVE USER
// const removeUser =
//   (socketId) => {

//     for (
//       const [userId, id]
//       of onlineUsers.entries()
//     ) {

//       if (id === socketId) {

//         onlineUsers.delete(
//           userId
//         );

//         break;

//       }

//     }

//   };

// // GET USER SOCKET
// const getUser = (
//   userId
// ) => {

//   return onlineUsers.get(
//     userId.toString()
//   );

// };

// // SOCKET CONNECTION
// io.on(
//   "connection",
//   (socket) => {

//     console.log(
//       "User connected"
//     );

//     // AUTHENTICATED USER
//     const userId =
//       socket.userInfo.id;

//     // JOIN ROOM
//     socket.join(
//       userId.toString()
//     );

//     // ADD ONLINE USER
//     addUser(
//       userId,
//       socket.id
//     );

//     // SEND ONLINE USERS
//     io.emit(
//       "getUsers",
//       Array.from(
//         onlineUsers.keys()
//       )
//     );

//     // SEND NOTIFICATION
//     socket.on(
//       "sendNotification",

//       ({
//         receiverId,
//         type,
//       }) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(receiverId);

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getNotification",
//             {
//               senderId,
//               type,
//             }
//           );

//           console.log(
//             "Realtime notification sent"
//           );

//         }

//       }
//     );

//     // SEND MESSAGE
//     socket.on(
//       "sendMessage",
//       (data) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(
//             data.receiverId
//           );

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getMessage",
//             {
//               senderId,

//               text:
//                 data.text,

//               conversationId:
//                 data.conversationId,
//             }
//           );

//           console.log(
//             "Realtime message sent"
//           );

//         }

//       }
//     );

//     // USER TYPING
//     socket.on(
//       "typing",
//       ({
//         receiverId,
//         conversationId,
//       }) => {

//         io.to(
//           receiverId.toString()
//         ).emit(
//           "userTyping",
//           {
//             senderId:
//               socket.userInfo.id,

//             conversationId,
//           }
//         );

//       }
//     );

//     // USER STOPPED TYPING
//     socket.on(
//       "stopTyping",
//       ({
//         receiverId,
//         conversationId,
//       }) => {

//         io.to(
//           receiverId.toString()
//         ).emit(
//           "userStoppedTyping",
//           {
//             senderId:
//               socket.userInfo.id,

//             conversationId,
//           }
//         );

//       }
//     );

//     // DISCONNECT
//     socket.on(
//       "disconnect",
//       () => {

//         console.log(
//           "User disconnected"
//         );

//         removeUser(
//           socket.id
//         );

//         io.emit(
//           "getUsers",
//           Array.from(
//             onlineUsers.keys()
//           )
//         );

//       }
//     );

//   }
// );

// // GLOBAL ERROR HANDLER
// app.use(errorHandler);

// // START SERVER
// httpServer.listen(
//   8800,
//   () => {

//     console.log(
//       "Socket server running"
//     );

//   }
// );


































































// import express from "express";
// const app = express();

// import { createServer } from "http";
// import { Server } from "socket.io";

// import cors from "cors";
// import multer from "multer";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import jwt from "jsonwebtoken";

// import cloudinary from "./utils/cloudinary.js";

// import {
//   CloudinaryStorage,
// } from "multer-storage-cloudinary";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";

// // ERROR HANDLER
// import {
//   errorHandler,
// } from "./middleware/errorHandler.js";

// // MIDDLEWARES
// app.use((req, res, next) => {

//   res.header(
//     "Access-Control-Allow-Credentials",
//     true
//   );

//   next();

// });

// app.use(express.json());

// // SECURITY
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// // CORS
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],

//     credentials: true,
//   })
// );

// app.use(cookieParser());

// // CLOUDINARY STORAGE
// const storage =
//   new CloudinaryStorage({

//     cloudinary,

//     params: {

//       folder: "thrills",

//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//       ],

//     },

//   });

// // MULTER
// const upload =
//   multer({ storage });

// // UPLOAD ROUTE
// app.post(
//   "/api/upload",

//   upload.single("file"),

//   (req, res) => {

//     const file = req.file;

//     if (!file) {

//       return res
//         .status(400)
//         .json("No file uploaded.");

//     }

//     return res
//       .status(200)
//       .json(file.path);

//   }
// );

// // API ROUTES
// app.use("/api/auth", authRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/comments", commentRoutes);

// app.use("/api/likes", likeRoutes);

// app.use(
//   "/api/relationships",
//   relationshipRoutes
// );

// app.use(
//   "/api/discover",
//   discoverRoutes
// );

// app.use(
//   "/api/interests",
//   interestRoutes
// );

// app.use(
//   "/api/notifications",
//   notificationRoutes
// );

// app.use(
//   "/api/hashtags",
//   hashtagRoutes
// );

// app.use("/api/saved", savedRoutes);

// app.use("/api/search", searchRoutes);

// app.use("/api/messages", messageRoutes);

// app.use(
//   "/api/conversations",
//   conversationRoutes
// );

// // HTTP SERVER
// const httpServer =
//   createServer(app);

// // SOCKET SERVER
// export const io =
//   new Server(httpServer, {

//     cors: {

//       origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//       ],

//       credentials: true,

//     },

//   });

// // SOCKET AUTHENTICATION
// io.use((socket, next) => {

//   const token =
//     socket.handshake.auth.token;

//   if (!token) {

//     return next(
//       new Error(
//         "Authentication error"
//       )
//     );

//   }

//   jwt.verify(
//     token,
//     process.env.JWT_SECRET,

//     (err, userInfo) => {

//       if (err) {

//         return next(
//           new Error(
//             "Invalid token"
//           )
//         );

//       }

//       socket.userInfo =
//         userInfo;

//       next();

//     }
//   );

// });

// // ONLINE USERS
// let onlineUsers =
//   new Map();

// // ADD USER
// const addUser = (
//   userId,
//   socketId
// ) => {

//   onlineUsers.set(
//     userId.toString(),
//     socketId
//   );

// };

// // REMOVE USER
// const removeUser =
//   (socketId) => {

//     for (
//       const [userId, id]
//       of onlineUsers.entries()
//     ) {

//       if (id === socketId) {

//         onlineUsers.delete(
//           userId
//         );

//         break;

//       }

//     }

//   };

// // GET USER SOCKET
// const getUser = (
//   userId
// ) => {

//   return onlineUsers.get(
//     userId.toString()
//   );

// };

// // SOCKET CONNECTION
// io.on(
//   "connection",
//   (socket) => {

//     console.log(
//       "User connected"
//     );

//     // AUTHENTICATED USER
//     const userId =
//       socket.userInfo.id;

//     // JOIN ROOM
//     socket.join(
//       userId.toString()
//     );

//     // ADD ONLINE USER
//     addUser(
//       userId,
//       socket.id
//     );

//     // SEND ONLINE USERS
//     io.emit(
//       "getUsers",
//       Array.from(
//         onlineUsers.keys()
//       )
//     );

//     // SEND NOTIFICATION
//     socket.on(
//       "sendNotification",

//       ({
//         receiverId,
//         type,
//       }) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(receiverId);

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getNotification",
//             {
//               senderId,
//               type,
//             }
//           );

//           console.log(
//             "Realtime notification sent"
//           );

//         }

//       }
//     );

//     // SEND MESSAGE
//     socket.on(
//       "sendMessage",
//       (data) => {

//         const senderId =
//           socket.userInfo.id;

//         const userSocketId =
//           getUser(
//             data.receiverId
//           );

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getMessage",
//             {
//               senderId,

//               text:
//                 data.text,

//               conversationId:
//                 data.conversationId,
//             }
//           );

//           console.log(
//             "Realtime message sent"
//           );

//         }

//       }
//     );

//     // DISCONNECT
//     socket.on(
//       "disconnect",
//       () => {

//         console.log(
//           "User disconnected"
//         );

//         removeUser(
//           socket.id
//         );

//         io.emit(
//           "getUsers",
//           Array.from(
//             onlineUsers.keys()
//           )
//         );

//       }
//     );

//   }
// );

// // GLOBAL ERROR HANDLER
// app.use(errorHandler);

// // START SERVER
// httpServer.listen(
//   8800,
//   () => {

//     console.log(
//       "Socket server running"
//     );

//   }
// );
































// import express from "express";
// const app = express();

// import { createServer } from "http";
// import { Server } from "socket.io";

// import cors from "cors";
// import multer from "multer";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";

// import cloudinary from "./utils/cloudinary.js";

// import { CloudinaryStorage }
// from "multer-storage-cloudinary";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";

// // ERROR HANDLER
// import { errorHandler }
// from "./middleware/errorHandler.js";

// // MIDDLEWARES
// app.use((req, res, next) => {

//   res.header(
//     "Access-Control-Allow-Credentials",
//     true
//   );

//   next();

// });

// app.use(express.json());

// // SECURITY HEADERS
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// // CORS
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],

//     credentials: true,
//   })
// );

// app.use(cookieParser());

// // CLOUDINARY STORAGE
// const storage =
//   new CloudinaryStorage({

//     cloudinary,

//     params: {

//       folder: "thrills",

//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//       ],

//     },

//   });

// // MULTER
// const upload =
//   multer({ storage });

// // UPLOAD ROUTE
// app.post(
//   "/api/upload",
//   upload.single("file"),
//   (req, res) => {

//     const file = req.file;

//     if (!file) {

//       return res
//         .status(400)
//         .json("No file uploaded.");

//     }

//     // RETURN CLOUDINARY URL
//     return res
//       .status(200)
//       .json(file.path);

//   }
// );

// // API ROUTES
// app.use("/api/auth", authRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/comments", commentRoutes);

// app.use("/api/likes", likeRoutes);

// app.use("/api/relationships", relationshipRoutes);

// app.use("/api/discover", discoverRoutes);

// app.use("/api/interests", interestRoutes);

// app.use("/api/notifications", notificationRoutes);

// app.use("/api/hashtags", hashtagRoutes);

// app.use("/api/saved", savedRoutes);

// app.use("/api/search", searchRoutes);

// app.use("/api/messages", messageRoutes);

// app.use("/api/conversations", conversationRoutes);

// // HTTP SERVER
// const httpServer =
//   createServer(app);

// // SOCKET SERVER
// export const io =
//   new Server(httpServer, {

//     cors: {

//       origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//       ],

//       credentials: true,

//     },

//   });

// // ONLINE USERS
// let onlineUsers =
//   new Map();

// // ADD USER
// const addUser = (
//   userId,
//   socketId
// ) => {

//   onlineUsers.set(
//     userId.toString(),
//     socketId
//   );

// };

// // REMOVE USER
// const removeUser =
//   (socketId) => {

//     for (
//       const [userId, id]
//       of onlineUsers.entries()
//     ) {

//       if (id === socketId) {

//         onlineUsers.delete(userId);

//         break;

//       }

//     }

//   };

// // GET USER SOCKET
// const getUser = (
//   userId
// ) => {

//   return onlineUsers.get(
//     userId.toString()
//   );

// };

// // SOCKET CONNECTION
// io.on(
//   "connection",
//   (socket) => {

//     console.log(
//       "User connected"
//     );

//     // ADD USER
//     socket.on(
//       "addUser",
//       (userId) => {

//         socket.join(
//           userId.toString()
//         );

//         addUser(
//           userId,
//           socket.id
//         );

//         io.emit(
//           "getUsers",
//           Array.from(
//             onlineUsers.keys()
//           )
//         );

//       }
//     );

//     // SEND NOTIFICATION
//     socket.on(
//       "sendNotification",

//       ({
//         senderId,
//         receiverId,
//         type,
//       }) => {

//         const userSocketId =
//           getUser(receiverId);

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getNotification",
//             {
//               senderId,
//               type,
//             }
//           );

//           console.log(
//             "Realtime notification sent"
//           );

//         }

//       }
//     );

//     // SEND MESSAGE
//     socket.on(
//       "sendMessage",
//       (data) => {

//         const userSocketId =
//           getUser(
//             data.receiverId
//           );

//         if (userSocketId) {

//           io.to(
//             userSocketId
//           ).emit(
//             "getMessage",
//             {
//               senderId:
//                 data.senderId,

//               text:
//                 data.text,

//               conversationId:
//                 data.conversationId,
//             }
//           );

//           console.log(
//             "Realtime message sent"
//           );

//         }

//       }
//     );

//     // DISCONNECT
//     socket.on(
//       "disconnect",
//       () => {

//         console.log(
//           "User disconnected"
//         );

//         removeUser(
//           socket.id
//         );

//         io.emit(
//           "getUsers",
//           Array.from(
//             onlineUsers.keys()
//           )
//         );

//       }
//     );

//   }
// );

// // GLOBAL ERROR HANDLER
// app.use(errorHandler);

// // START SERVER
// httpServer.listen(
//   8800,
//   () => {

//     console.log(
//       "Socket server running"
//     );

//   }
// );






































// import express from "express";
// const app = express();

// import { createServer } from "http";
// import { Server } from "socket.io";

// import cors from "cors";
// import multer from "multer";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";

// import { errorHandler } from "./middleware/errorHandler.js";

// // MIDDLEWARES
// app.use((req, res, next) => {

//   res.header(
//     "Access-Control-Allow-Credentials",
//     true
//   );

//   next();

// });

// app.use(express.json());
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// app.use(
//   "/upload",
//   express.static("public/upload")
// );

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],
//     credentials: true,
//   })
// );

// app.use(cookieParser());

// // FILE UPLOAD
// const storage = multer.diskStorage({

//   destination: function (req, file, cb) {

//     cb(null, "public/upload");

//   },

//   filename: function (req, file, cb) {

//     cb(
//       null,
//       Date.now() + file.originalname
//     );

//   },

// });

// const upload = multer({ storage });

// app.post(
//   "/api/upload",
//   upload.single("file"),
//   (req, res) => {

//     const file = req.file;

//     res.status(200).json(file.filename);

//   }
// );

// // API ROUTES
// app.use("/api/auth", authRoutes);

// app.use("/api/users", userRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/comments", commentRoutes);

// app.use("/api/likes", likeRoutes);

// app.use("/api/relationships", relationshipRoutes);

// app.use("/api/discover", discoverRoutes);

// app.use("/api/interests", interestRoutes);

// app.use("/api/notifications", notificationRoutes);

// app.use("/api/hashtags", hashtagRoutes);

// app.use("/api/saved", savedRoutes);

// app.use("/api/search", searchRoutes);

// app.use("/api/messages", messageRoutes);

// app.use("/api/conversations", conversationRoutes);

// // HTTP SERVER
// const httpServer = createServer(app);

// // SOCKET SERVER
// export const io = new Server(httpServer, {

//   cors: {

//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],

//     credentials: true,

//   },

// });

// // ONLINE USERS MAP
// let onlineUsers = new Map();

// // ADD USER
// const addUser = (userId, socketId) => {

//   onlineUsers.set(
//     userId.toString(),
//     socketId
//   );

// };

// // REMOVE USER
// const removeUser = (socketId) => {

//   for (const [userId, id] of onlineUsers.entries()) {

//     if (id === socketId) {

//       onlineUsers.delete(userId);

//       break;

//     }
//   }
// };

// // GET USER SOCKET ID
// const getUser = (userId) => {

//   return onlineUsers.get(
//     userId.toString()
//   );

// };

// // SOCKET CONNECTION
// io.on("connection", (socket) => {

//   console.log("User connected");

//   // ADD USER
//   socket.on("addUser", (userId) => {

//     // JOIN USER ROOM
//     socket.join(userId.toString());

//     addUser(userId, socket.id);

//     io.emit(
//       "getUsers",
//       Array.from(onlineUsers.keys())
//     );

//   });

//   // SEND NOTIFICATION
//   socket.on(
//     "sendNotification",
//     ({ senderId, receiverId, type }) => {

//       const userSocketId =
//         getUser(receiverId);

//       if (userSocketId) {

//         io.to(userSocketId).emit(
//           "getNotification",
//           {
//             senderId,
//             type,
//           }
//         );

//         console.log(
//           "Realtime notification sent"
//         );

//       }

//     }
//   );

//   // SEND MESSAGE
//   socket.on("sendMessage", (data) => {

//     const userSocketId =
//       getUser(data.receiverId);

//     if (userSocketId) {

//       io.to(userSocketId).emit(
//         "getMessage",
//         {
//           senderId: data.senderId,
//           text: data.text,
//           conversationId:
//             data.conversationId,
//         }
//       );

//       console.log(
//         "Realtime message sent"
//       );

//     }

//   });

//   // DISCONNECT
//   socket.on("disconnect", () => {

//     console.log("User disconnected");

//     removeUser(socket.id);

//     io.emit(
//       "getUsers",
//       Array.from(onlineUsers.keys())
//     );

//   });

// });

// // START SERVER

// app.use(errorHandler);

// httpServer.listen(8800, () => {

//   console.log("Socket server running");

// });












































































































































































// import express from "express";
// const app = express();
// import { createServer } from "http";
// import { Server } from "socket.io";
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import postRoutes from "./routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";
// import relationshipRoutes from "./routes/relationships.js";
// import discoverRoutes from "./routes/discover.js";
// import interestRoutes from "./routes/interests.js";
// import notificationRoutes from "./routes/notifications.js";
// import hashtagRoutes from "./routes/hashtags.js";
// import savedRoutes from "./routes/saved.js";
// import searchRoutes from "./routes/search.js";
// import messageRoutes from "./routes/messages.js";
// import conversationRoutes from "./routes/conversations.js";
// import cors from "cors"
// import multer from "multer";
// import cookieParser from "cookie-parser";

// //middlewares
// app.use((req,res,next)=>{
//     res.header("Access-Control-Allow-Credentials", true)
//     next()
// })
// app.use(express.json())
// app.use("/upload", express.static("public/upload"));
// app.use(
//     cors({
//     origin: [
//       "http://localhost:5173", 
//       "http://localhost:5174",
//     ],
//     credentials: true, // localhost on the client side
//   })
// );
// app.use(cookieParser());

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//     //   cb(null, '/tmp/my-uploads')
//         cb(null, "public/upload")
//     },
//     filename: function (req, file, cb) {
//     //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     //   cb(null, file.fieldname + '-' + uniqueSuffix)
//         cb(null, Date.now() + file.originalname)
//     }
//   })
  
//   const upload = multer({ storage: storage })

//   app.post("/api/upload", upload.single("file"), (req, res) => {
//     const file = req.file;
//     res.status(200).json(file.filename);
//   });

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/posts", postRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/relationships", relationshipRoutes);
// app.use("/api/discover", discoverRoutes);
// app.use("/api/interests", interestRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/hashtags", hashtagRoutes);
// app.use("/api/saved", savedRoutes);
// app.use("/api/search", searchRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/conversations", conversationRoutes);

// const httpServer = createServer(app);

// export const io = new Server(httpServer, {
//   cors: {
//     origin: ["http://localhost:5173", "http://localhost:5174"],
//     credentials: true,
//   },
// });

// let onlineUsers = [];

// const addUser = (userId, socketId) => {
//   !onlineUsers.some((user) => user.userId === userId) &&
//     onlineUsers.push({ userId, socketId });
// };

// const removeUser = (socketId) => {
//   onlineUsers = onlineUsers.filter(
//     (user) => user.socketId !== socketId
//   );
// };

// const getUser = (userId) => {
//   return onlineUsers.find((user) => user.userId === userId);
// };

// io.on("connection", (socket) => {

//   console.log("User connected");

//   socket.on("addUser", (userId) => {

//     socket.join(userId.toString());

//     addUser(userId, socket.id);

//     io.emit("getUsers", onlineUsers);
//   });

//   socket.on("sendNotification", ({ senderId, receiverId, type }) => {


//     const user = getUser(receiverId);

//     if (user) {
//       io.to(user.socketId).emit("getNotification", {
//         senderId,
//         type,
//       });
//       console.log("Notification emitted");
//     }
//   });


//   socket.on("sendMessage", (data) => {

//   const user = getUser(data.receiverId);

//   if (user) {

//     io.to(user.socketId).emit("getMessage", {
//       senderId: data.senderId,
//       text: data.text,
//       conversationId: data.conversationId,
//     });

//     console.log("Realtime message sent");
//   }
// });


//   socket.on("disconnect", () => {

//     console.log("User disconnected");

//     removeUser(socket.id);

//     io.emit("getUsers", onlineUsers);
//   });
// });

// httpServer.listen(8800, () => {
//   console.log("Socket server running");
// });

// // app.listen(8800, ()=>{
// //     console.log("API is working!")
// })