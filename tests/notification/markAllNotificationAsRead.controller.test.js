import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

const token = jwt.sign(
  {
    id: 1,
    isAdmin: false,
  },
  process.env.JWT_SECRET
);

jest.unstable_mockModule(
  "../../connect.js",
  () => ({
    db: {
      query: jest.fn(),
    },
  })
);

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Mark All Notifications As Read Controller",
  () => {

    test(
      "should mark all notifications as read",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null,
              {
                affectedRows: 5,
              }
            );

          }
        );

        const res =
          await request(app)

            .put(
              "/api/notifications/read-all"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.message
        ).toBe(
          "All notifications marked as read."
        );

        expect(
          res.body.updatedNotifications
        ).toBe(5);

      }
    );

    test(
      "should return zero updated notifications",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null,
              {
                affectedRows: 0,
              }
            );

          }
        );

        const res =
          await request(app)

            .put(
              "/api/notifications/read-all"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.updatedNotifications
        ).toBe(0);

      }
    );

    test(
      "should return 500 when database fails",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              new Error(
                "Database failed"
              )
            );

          }
        );

        const res =
          await request(app)

            .put(
              "/api/notifications/read-all"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);






































// import request from "supertest";
// import { jest } from "@jest/globals";
// import jwt from "jsonwebtoken";

// process.env.JWT_SECRET =
//   "test-secret";

// const token = jwt.sign(
//   {
//     id: 1,
//     isAdmin: false,
//   },
//   process.env.JWT_SECRET
// );

// jest.unstable_mockModule(
//   "../../connect.js",
//   () => ({
//     db: {
//       query: jest.fn(),
//     },
//   })
// );

// const { db } =
//   await import("../../connect.js");

// const { default: app } =
//   await import("../../app.js");

// describe(
//   "Mark Notification As Read Controller",
//   () => {

//     test(
//       "should mark notification as read",
//       async () => {

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callback(
//               null,
//               {
//                 affectedRows: 1,
//               }
//             );

//           }
//         );

//         const res =
//           await request(app)

//             .put(
//               "/api/notifications/read/1"
//             )

//             .set(
//               "Cookie",
//               [
//                 `accessToken=${token}`,
//               ]
//             );

//         expect(
//           res.statusCode
//         ).toBe(200);

//         expect(
//           res.body
//         ).toBe(
//           "Notification marked as read."
//         );

//       }
//     );

//     test(
//       "should return 404 when notification does not exist",
//       async () => {

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callback(
//               null,
//               {
//                 affectedRows: 0,
//               }
//             );

//           }
//         );

//         const res =
//           await request(app)

//             .put(
//               "/api/notifications/read/999"
//             )

//             .set(
//               "Cookie",
//               [
//                 `accessToken=${token}`,
//               ]
//             );

//         expect(
//           res.statusCode
//         ).toBe(404);

//       }
//     );

//     test(
//       "should return 500 when database fails",
//       async () => {

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callback(
//               new Error(
//                 "Database failed"
//               )
//             );

//           }
//         );

//         const res =
//           await request(app)

//             .put(
//               "/api/notifications/read/1"
//             )

//             .set(
//               "Cookie",
//               [
//                 `accessToken=${token}`,
//               ]
//             );

//         expect(
//           res.statusCode
//         ).toBe(500);

//       }
//     );

//   }
// );