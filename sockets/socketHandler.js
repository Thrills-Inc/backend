import jwt from "jsonwebtoken";

import { db } from "../connect.js";

import {
  onlineUsers,
} from "../utils/onlineUsers.js";

import logger
from "../utils/logger.js";

// SOCKET HANDLERS
import {
  notificationHandler,
} from "./handlers/notificationHandler.js";

import {
  messageHandler,
} from "./handlers/messageHandler.js";

import {
  typingHandler,
} from "./handlers/typingHandler.js";

import {
  readReceiptHandler,
} from "./handlers/readReceiptHandler.js";

import {
  SOCKET_EVENTS,
} from "../constants/socketEvents.js";

export const initializeSocket =
(io) => {

  // SOCKET AUTHENTICATION
  io.use((socket, next) => {

    const token =
      socket.handshake.auth.token;

    if (!token) {

      logger.warn(
        "Socket connection rejected: No token provided"
      );

      return next(
        new Error(
          "Authentication error"
        )
      );

    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,

      (err, userInfo) => {

        if (err) {

          logger.error(
            `Socket authentication failed: ${err.message}`
          );

          return next(
            new Error(
              "Invalid token"
            )
          );

        }

        socket.userInfo =
          userInfo;

        logger.info(
          `Socket authenticated for user ${userInfo.id}`
        );

        next();

      }
    );

  });

  // ADD USER
  const addUser = (
    userId,
    socketId
  ) => {

    onlineUsers.set(
      userId.toString(),
      socketId
    );

    logger.info(
      `User ${userId} added to online users`
    );

  };

  // REMOVE USER
  const removeUser =
    (socketId) => {

      for (
        const [userId, id]
        of onlineUsers.entries()
      ) {

        if (id === socketId) {

          onlineUsers.delete(
            userId
          );

          logger.info(
            `User ${userId} removed from online users`
          );

          break;

        }

      }

    };

  // GET USER
  const getUser =
    (userId) => {

      return onlineUsers.get(
        userId.toString()
      );

    };

  // SOCKET CONNECTION
  io.on(
    SOCKET_EVENTS.CONNECTION,

    (socket) => {

      // AUTHENTICATED USER
      const userId =
        socket.userInfo.id;

      logger.info(
        `User connected: ${userId}`
      );

      // JOIN USER ROOM
      socket.join(
        userId.toString()
      );

      logger.info(
        `User ${userId} joined personal socket room`
      );

      // ADD ONLINE USER
      addUser(
        userId,
        socket.id
      );

      // SEND ONLINE USERS
      io.emit(
        "getUsers",
        Array.from(
          onlineUsers.keys()
        )
      );

      logger.info(
        `Online users broadcasted`
      );

      // NOTIFICATION EVENTS
      notificationHandler(
        io,
        socket,
        getUser
      );

      logger.info(
        `Notification handler initialized for user ${userId}`
      );

      // MESSAGE EVENTS
      messageHandler(
        io,
        socket,
        getUser
      );

      logger.info(
        `Message handler initialized for user ${userId}`
      );

      // TYPING EVENTS
      typingHandler(
        io,
        socket
      );

      logger.info(
        `Typing handler initialized for user ${userId}`
      );

      // READ RECEIPT EVENTS
      readReceiptHandler(
        io,
        socket
      );

      logger.info(
        `Read receipt handler initialized for user ${userId}`
      );

      // DISCONNECT
      socket.on(
        SOCKET_EVENTS.DISCONNECT,

        () => {

          logger.info(
            `User disconnected: ${userId}`
          );

          // UPDATE LAST SEEN
          const q = `
            UPDATE users

            SET lastSeen = NOW()

            WHERE id = ?
          `;

          db.query(
            q,
            [userId],

            (err) => {

              if (err) {

                logger.error(
                  `Failed to update lastSeen for user ${userId}: ${err.message}`
                );

                return;

              }

              logger.info(
                `lastSeen updated for user ${userId}`
              );

            }
          );

          // REMOVE USER
          removeUser(
            socket.id
          );

          // UPDATE ONLINE USERS
          io.emit(
            "getUsers",
            Array.from(
              onlineUsers.keys()
            )
          );

          logger.info(
            `Updated online users broadcasted after disconnect`
          );

        }
      );

    }
  );

};









































// import jwt from "jsonwebtoken";

// import { db } from "../connect.js";

// import {
//   onlineUsers,
// } from "../utils/onlineUsers.js";

// import logger
// from "../utils/logger.js";

// // SOCKET HANDLERS
// import {
//   notificationHandler,
// } from "./handlers/notificationHandler.js";

// import {
//   messageHandler,
// } from "./handlers/messageHandler.js";

// import {
//   typingHandler,
// } from "./handlers/typingHandler.js";

// import {
//   readReceiptHandler,
// } from "./handlers/readReceiptHandler.js";

// import {
//   SOCKET_EVENTS,
// } from "../constants/socketEvents.js";

// export const initializeSocket =
// (io) => {

//   // SOCKET AUTHENTICATION
//   io.use((socket, next) => {

//     const token =
//       socket.handshake.auth.token;

//     if (!token) {

//       return next(
//         new Error(
//           "Authentication error"
//         )
//       );

//     }

//     jwt.verify(
//       token,
//       process.env.JWT_SECRET,

//       (err, userInfo) => {

//         if (err) {

//           return next(
//             new Error(
//               "Invalid token"
//             )
//           );

//         }

//         socket.userInfo =
//           userInfo;

//         next();

//       }
//     );

//   });

//   // ADD USER
//   const addUser = (
//     userId,
//     socketId
//   ) => {

//     onlineUsers.set(
//       userId.toString(),
//       socketId
//     );

//   };

//   // REMOVE USER
//   const removeUser =
//     (socketId) => {

//       for (
//         const [userId, id]
//         of onlineUsers.entries()
//       ) {

//         if (id === socketId) {

//           onlineUsers.delete(
//             userId
//           );

//           break;

//         }

//       }

//     };

//   // GET USER
//   const getUser =
//     (userId) => {

//       return onlineUsers.get(
//         userId.toString()
//       );

//     };

//   // SOCKET CONNECTION
//   io.on(
//     SOCKET_EVENTS.CONNECTION,
//     (socket) => {

//         logger.info(
//   `User connected: ${userId}`
//     );

//     //   console.log(
//     //     "User connected"
//     //   );

//       // AUTHENTICATED USER
//       const userId =
//         socket.userInfo.id;

//       // JOIN ROOM
//       socket.join(
//         userId.toString()
//       );

//       // ADD ONLINE USER
//       addUser(
//         userId,
//         socket.id
//       );

//       // SEND ONLINE USERS
//       io.emit(
//         "getUsers",
//         Array.from(
//           onlineUsers.keys()
//         )
//       );

//       // NOTIFICATION EVENTS
//       notificationHandler(
//         io,
//         socket,
//         getUser
//       );

//       // MESSAGE EVENTS
//       messageHandler(
//         io,
//         socket,
//         getUser
//       );

//       // TYPING EVENTS
//       typingHandler(
//         io,
//         socket
//       );

//       // READ RECEIPT EVENTS
//       readReceiptHandler(
//         io,
//         socket
//       );

//       // DISCONNECT
//       socket.on(
//         SOCKET_EVENTS.DISCONNECT,
//         () => {


//             logger.info(
//   `User disconnected: ${userId}`
//         );
//         //   console.log(
//         //     "User disconnected"
//         //   );

//           // UPDATE LAST SEEN
//           const q = `
//             UPDATE users
//             SET lastSeen = NOW()
//             WHERE id = ?
//           `;

//           db.query(
//             q,
//             [userId],
//             (err) => {

//               if (err) {


//                 logger.error(
//   `Failed to update lastSeen for user ${userId}`
//           );
//                 // console.log(
//                 //   "Failed to update lastSeen"
//                 // );

//               }

//             }
//           );

//           // REMOVE USER
//           removeUser(
//             socket.id
//           );

//           // UPDATE ONLINE USERS
//           io.emit(
//             "getUsers",
//             Array.from(
//               onlineUsers.keys()
//             )
//           );

//         }
//       );

//     }
//   );

// };





































// import jwt from "jsonwebtoken";
// import { db } from "../connect.js";
// import { onlineUsers }
// from "../utils/onlineUsers.js";

// export const initializeSocket =
// (io) => {

//   // SOCKET AUTH
//   io.use((socket, next) => {

//     const token =
//       socket.handshake.auth.token;

//     if (!token) {

//       return next(
//         new Error(
//           "Authentication error"
//         )
//       );

//     }

//     jwt.verify(
//       token,
//       process.env.JWT_SECRET,

//       (err, userInfo) => {

//         if (err) {

//           return next(
//             new Error(
//               "Invalid token"
//             )
//           );

//         }

//         socket.userInfo =
//           userInfo;

//         next();

//       }
//     );

//   });

//   // ADD USER
//   const addUser = (
//     userId,
//     socketId
//   ) => {

//     onlineUsers.set(
//       userId.toString(),
//       socketId
//     );

//   };

//   // REMOVE USER
//   const removeUser =
//     (socketId) => {

//       for (
//         const [userId, id]
//         of onlineUsers.entries()
//       ) {

//         if (id === socketId) {

//           onlineUsers.delete(
//             userId
//           );

//           break;

//         }

//       }

//     };

//   // GET USER
//   const getUser =
//     (userId) => {

//       return onlineUsers.get(
//         userId.toString()
//       );

//     };

//   // CONNECTION
//   io.on(
//     "connection",
//     (socket) => {

//       console.log(
//         "User connected"
//       );

//       const userId =
//         socket.userInfo.id;

//       socket.join(
//         userId.toString()
//       );

//       addUser(
//         userId,
//         socket.id
//       );

//       io.emit(
//         "getUsers",
//         Array.from(
//           onlineUsers.keys()
//         )
//       );

//       // NOTIFICATIONS
//       socket.on(
//         "sendNotification",

//         ({
//           receiverId,
//           type,
//         }) => {

//           const senderId =
//             socket.userInfo.id;

//           const userSocketId =
//             getUser(receiverId);

//           if (userSocketId) {

//             io.to(
//               userSocketId
//             ).emit(
//               "getNotification",
//               {
//                 senderId,
//                 type,
//               }
//             );

//           }

//         }
//       );

//       // MESSAGES
//       socket.on(
//         "sendMessage",
//         (data) => {

//           const senderId =
//             socket.userInfo.id;

//           const userSocketId =
//             getUser(
//               data.receiverId
//             );

//           if (userSocketId) {

//             io.to(
//               userSocketId
//             ).emit(
//               "getMessage",
//               {
//                 senderId,
//                 text: data.text,
//                 conversationId:
//                   data.conversationId,
//               }
//             );

//           }

//         }
//       );

//       // TYPING
//       socket.on(
//         "typing",

//         ({
//           receiverId,
//           conversationId,
//         }) => {

//           io.to(
//             receiverId.toString()
//           ).emit(
//             "userTyping",
//             {
//               senderId:
//                 socket.userInfo.id,

//               conversationId,
//             }
//           );

//         }
//       );

//       // STOP TYPING
//       socket.on(
//         "stopTyping",

//         ({
//           receiverId,
//           conversationId,
//         }) => {

//           io.to(
//             receiverId.toString()
//           ).emit(
//             "userStoppedTyping",
//             {
//               senderId:
//                 socket.userInfo.id,

//               conversationId,
//             }
//           );

//         }
//       );

//       // READ RECEIPTS
//       socket.on(
//         "markMessageSeen",

//         ({
//           messageId,
//           receiverId,
//         }) => {

//           const q = `
//             UPDATE messages
//             SET seen = 1
//             WHERE id = ?
//           `;

//           db.query(
//             q,
//             [messageId],
//             (err) => {

//               if (err) return;

//               io.to(
//                 receiverId.toString()
//               ).emit(
//                 "messageSeen",
//                 {
//                   messageId,
//                 }
//               );

//             }
//           );

//         }
//       );

//       // DISCONNECT
//       socket.on(
//         "disconnect",
//         () => {

//           const q = `
//             UPDATE users
//             SET lastSeen = NOW()
//             WHERE id = ?
//           `;

//           db.query(
//             q,
//             [userId]
//           );

//           removeUser(
//             socket.id
//           );

//           io.emit(
//             "getUsers",
//             Array.from(
//               onlineUsers.keys()
//             )
//           );

//           console.log(
//             "User disconnected"
//           );

//         }
//       );

//     }
//   );

// };