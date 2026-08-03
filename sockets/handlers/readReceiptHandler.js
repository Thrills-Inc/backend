import { db }
from "../../connect.js";

import {
  SOCKET_EVENTS,
} from "../../constants/socketEvents.js";

export const readReceiptHandler =
(
  io,
  socket
) => {

  socket.on(
    SOCKET_EVENTS.MARK_MESSAGE_SEEN,

    ({
      messageId,
      receiverId,
    }) => {

      const q = `
        UPDATE messages
        SET seen = 1
        WHERE id = ?
      `;

      db.query(
        q,
        [messageId],

        (err) => {

          if (err) {

            console.log(
              "Failed to update read receipt"
            );

            return;

          }

          io.to(
            receiverId.toString()
          ).emit(
            SOCKET_EVENTS.MESSAGE_SEEN,
            {
              messageId,
            }
          );

        }
      );

    }
  );

};




















// import { db }
// from "../../connect.js";

// export const readReceiptHandler =
// (
//   io,
//   socket
// ) => {

//   socket.on(
//     "markMessageSeen",

//     ({
//       messageId,
//       receiverId,
//     }) => {

//       const q = `
//         UPDATE messages
//         SET seen = 1
//         WHERE id = ?
//       `;

//       db.query(
//         q,
//         [messageId],
//         (err) => {

//           if (err) return;

//           io.to(
//             receiverId.toString()
//           ).emit(
//             "messageSeen",
//             {
//               messageId,
//             }
//           );

//         }
//       );

//     }
//   );

// };