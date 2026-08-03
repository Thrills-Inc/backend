import {
  SOCKET_EVENTS,
} from "../../constants/socketEvents.js";

export const messageHandler =
(
  io,
  socket,
  getUser
) => {

  socket.on(
    SOCKET_EVENTS.SEND_MESSAGE,
    (data) => {

      const senderId =
        socket.userInfo.id;

      const userSocketId =
        getUser(
          data.receiverId
        );

      if (userSocketId) {

        io.to(
          userSocketId
        ).emit(
          SOCKET_EVENTS.GET_MESSAGE,
          {
            senderId,

            text:
              data.text,

            conversationId:
              data.conversationId,
          }
        );

      }

    }
  );

};