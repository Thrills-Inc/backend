import {
  SOCKET_EVENTS,
} from "../../constants/socketEvents.js";

export const typingHandler =
(
  io,
  socket
) => {

  // USER TYPING
  socket.on(
    SOCKET_EVENTS.TYPING,

    ({
      receiverId,
      conversationId,
    }) => {

      io.to(
        receiverId.toString()
      ).emit(
        SOCKET_EVENTS.USER_TYPING,
        {
          senderId:
            socket.userInfo.id,

          conversationId,
        }
      );

    }
  );

  // USER STOPPED TYPING
  socket.on(
    SOCKET_EVENTS.STOP_TYPING,

    ({
      receiverId,
      conversationId,
    }) => {

      io.to(
        receiverId.toString()
      ).emit(
        SOCKET_EVENTS.USER_STOPPED_TYPING,
        {
          senderId:
            socket.userInfo.id,

          conversationId,
        }
      );

    }
  );

};


























// export const typingHandler =
// (
//   io,
//   socket
// ) => {

//   // TYPING
//   socket.on(
//     "typing",

//     ({
//       receiverId,
//       conversationId,
//     }) => {

//       io.to(
//         receiverId.toString()
//       ).emit(
//         "userTyping",
//         {
//           senderId:
//             socket.userInfo.id,

//           conversationId,
//         }
//       );

//     }
//   );

//   // STOP TYPING
//   socket.on(
//     "stopTyping",

//     ({
//       receiverId,
//       conversationId,
//     }) => {

//       io.to(
//         receiverId.toString()
//       ).emit(
//         "userStoppedTyping",
//         {
//           senderId:
//             socket.userInfo.id,

//           conversationId,
//         }
//       );

//     }
//   );

// };