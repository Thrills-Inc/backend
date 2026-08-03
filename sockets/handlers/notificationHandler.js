import {
  SOCKET_EVENTS,
} from "../../constants/socketEvents.js";

export const notificationHandler =
(
  io,
  socket,
  getUser
) => {

  socket.on(
    SOCKET_EVENTS.SEND_NOTIFICATION,

    ({
      receiverId,
      type,
    }) => {

      const senderId =
        socket.userInfo.id;

      const userSocketId =
        getUser(receiverId);

      if (userSocketId) {

        io.to(
          userSocketId
        ).emit(
          SOCKET_EVENTS.GET_NOTIFICATION,
          {
            senderId,
            type,
          }
        );

      }

    }
  );

};