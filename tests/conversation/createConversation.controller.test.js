import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

jest.unstable_mockModule(
  "../../connect.js",
  () => ({
    db: {
      query: jest.fn(),
    },
  })
);

jest.unstable_mockModule(
  "../../utils/activityLogger.js",
  () => ({
    logActivity:
      jest.fn(),
  })
);

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Create Conversation Controller",
  () => {

    let token;

    beforeEach(() => {

      jest.clearAllMocks();

      token = jwt.sign(
        {
          id: 1,
        },
        process.env.JWT_SECRET
      );

    });

    test(
      "should create conversation successfully",
      async () => {

        let callCount = 0;

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callCount++;

            // CHECK EXISTING
            if (
              callCount === 1
            ) {

              callback(
                null,
                []
              );

            }

            // INSERT NEW
            else if (
              callCount === 2
            ) {

              callback(
                null,
                {
                  insertId: 10,
                }
              );

            }

          }
        );

        const res =
          await request(app)
            .post(
              "/api/conversations"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              receiverId: 2,
            });

        expect(
          res.statusCode
        ).toBe(201);

        expect(
          res.body
        ).toEqual({

          conversationId: 10,

          alreadyExists:
            false,

        });

      }
    );

    test(
      "should return existing conversation",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null,
              [
                {
                  id: 25,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .post(
              "/api/conversations"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              receiverId: 2,
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toEqual({

          conversationId: 25,

          alreadyExists: true,

        });

      }
    );

    test(
      "should return 400 when user tries to message themselves",
      async () => {

        const res =
          await request(app)
            .post(
              "/api/conversations"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              receiverId: 1,
            });

        expect(
          res.statusCode
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "You cannot message yourself."
        );

      }
    );

  }
);












































// import request from "supertest";
// import { jest } from "@jest/globals";
// import jwt from "jsonwebtoken";

// process.env.JWT_SECRET =
//   "test-secret";

// jest.unstable_mockModule(
//   "../../connect.js",
//   () => ({
//     db: {
//       query: jest.fn(),
//     },
//   })
// );

// jest.unstable_mockModule(
//   "../../utils/activityLogger.js",
//   () => ({
//     logActivity:
//       jest.fn(),
//   })
// );

// const { db } =
//   await import("../../connect.js");

// const { default: app } =
//   await import("../../app.js");

// describe(
//   "Create Conversation Controller",
//   () => {

//     let token;

//     beforeEach(() => {

//       jest.clearAllMocks();

//       token = jwt.sign(
//         {
//           id: 1,
//         },
//         process.env.JWT_SECRET
//       );

//     });

//     test(
//       "should create conversation successfully",
//       async () => {

//         let callCount = 0;

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callCount++;

//             if (
//               callCount === 1
//             ) {

//               callback(
//                 null,
//                 []
//               );

//             }

//             else if (
//               callCount === 2
//             ) {

//               callback(
//                 null,
//                 {
//                   insertId: 10,
//                 }
//               );

//             }

//           }
//         );


//         test(
//       "should return existing conversation",
//       async () => {

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callback(
//               null,
//               [
//                 {
//                   id: 25,
//                 },
//               ]
//             );

//           }
//         );

//          test(
//       "should return existing conversation",
//       async () => {

        

//         const res =
//           await request(app)
//             .post(
//               "/api/conversations"
//             )
//             .set(
//               "Cookie",
//               [
//                 `accessToken=${token}`,
//               ]
//             )
//             .send({
//               receiverId: 2,
//             });

//         expect(
//           res.statusCode
//         ).toBe(201);

//         expect(
//           res.body
//         ).toEqual({

//           conversationId: 10,

//           alreadyExists:
//             false,

//         });

//       }
//     );

//     // test(
//     //   "should return existing conversation",
//     //   async () => {

//     //     db.query.mockImplementation(
//     //       (
//     //         q,
//     //         values,
//     //         callback
//     //       ) => {

//     //         callback(
//     //           null,
//     //           [
//     //             {
//     //               id: 25,
//     //             },
//     //           ]
//     //         );

//     //       }
//     //     );

//         const res =
//           await request(app)
//             .post(
//               "/api/conversations"
//             )
//             .set(
//               "Cookie",
//               [
//                 `accessToken=${token}`,
//               ]
//             )
//             .send({
//               receiverId: 2,
//             });

//         expect(
//           res.statusCode
//         ).toBe(200);

//         expect(
//           res.body
//         ).toEqual({

//           conversationId: 25,

//           alreadyExists:
//             true,

//         });

//       }
//     );

//   }
// );

// // test(
// //   "should return 400 when user tries to message themselves",
// //   async () => {

// //     const res =
// //       await request(app)
// //         .post(
// //           "/api/conversations"
// //         )
// //         .set(
// //           "Cookie",
// //           [
// //             `accessToken=${token}`,
// //           ]
// //         )
// //         .send({
// //           receiverId: 1,
// //         });

//     expect(
//       res.statusCode
//     ).toBe(400);

//     expect(
//       res.body.message
//     ).toBe(
//       "You cannot message yourself."
//     );

//   }
// );





















































// describe(
//   "Create Conversation Controller",
//   () => {

//     let token;

//     beforeEach(() => {

//       jest.clearAllMocks();

//       token = jwt.sign(
//         {
//           id: 1,
//         },
//         process.env.JWT_SECRET
//       );

//     });

//     test(
//       "should create conversation successfully",
//       async () => {

//         let callCount = 0;

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callCount++;

//             // CHECK EXISTING
//             if (
//               callCount === 1
//             ) {

//               callback(
//                 null,
//                 []
//               );

//             }

//             // INSERT NEW
//             else if (
//               callCount === 2
//             ) {

//               callback(
//                 null,
//                 {
//                   insertId: 10,
//                 }
//               );

//             }

//           }
//         );

//         const res =
//           await request(app)
//             .post(
//               "/api/conversations"
//             )
//             .set(
//               "Cookie",
//               [
//                 `accessToken=${token}`,
//               ]
//             )
//             .send({
//               receiverId: 2,
//             });

//         expect(
//           res.statusCode
//         ).toBe(201);

//         expect(
//           res.body
//         ).toEqual({

//           conversationId: 10,

//           alreadyExists:
//             false,

//         });

//       }
//     );

//   }
// );

// test(
//   "should return existing conversation",
//   async () => {

//     db.query.mockImplementation(
//       (
//         q,
//         values,
//         callback
//       ) => {

//         callback(
//           null,
//           [
//             {
//               id: 25,
//             },
//           ]
//         );

//       }
//     );

//     const res =
//       await request(app)
//         .post(
//           "/api/conversations"
//         )
//         .set(
//           "Cookie",
//           [
//             `accessToken=${token}`,
//           ]
//         )
//         .send({
//           receiverId: 2,
//         });

//     expect(
//       res.statusCode
//     ).toBe(200);

//     expect(
//       res.body
//     ).toEqual({

//       conversationId: 25,

//       alreadyExists: true,

//     });

//   }
// );


// test(
//   "should return existing conversation",
//   async () => {

//     db.query.mockImplementation(
//       (
//         q,
//         values,
//         callback
//       ) => {

//         callback(
//           null,
//           [
//             {
//               id: 25,
//             },
//           ]
//         );

//       }
//     );

//     const res =
//       await request(app)
//         .post(
//           "/api/conversations"
//         )
//         .set(
//           "Cookie",
//           [
//             `accessToken=${token}`,
//           ]
//         )
//         .send({
//           receiverId: 2,
//         });

//     expect(
//       res.statusCode
//     ).toBe(200);

//     expect(
//       res.body
//     ).toEqual({

//       conversationId: 25,

//       alreadyExists:
//         true,

//     });

//   }
// );