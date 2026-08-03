import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

// const JWT_SECRET =
//   process.env.JWT_SECRET ||
//   "testsecret";
  
// const adminToken = jwt.sign(
//   {
//     id: 1,
//     role: "admin",
//   },
//   process.env.JWT_SECRET || "testsecret"
// );

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

jest.unstable_mockModule(
  "../../sockets/socketInstance.js",
  () => ({
    getIO: () => ({
      to: () => ({
        emit: jest.fn(),
      }),
    }),
  })
);

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Send Message Controller",
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
      "should send message successfully",
      async () => {

        let callCount = 0;

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callCount++;

            // conversation lookup
            if (
              callCount === 1
            ) {

              callback(
                null,
                [
                  {
                    id: 1,
                    user1Id: 1,
                    user2Id: 2,
                  },
                ]
              );

            }

            // block lookup
            else if (
              callCount === 2
            ) {

              callback(
                null,
                []
              );

            }

            // insert message
            else if (
              callCount === 3
            ) {

              callback(
                null,
                {
                  insertId: 100,
                }
              );

            }

            // notification insert
            else if (
              callCount === 4
            ) {

              callback(
                null,
                {
                  insertId: 1,
                }
              );

            }

          }
        );

        const res =
          await request(app)
            .post(
              "/api/messages"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({

              conversationId: 1,

              text:
                "Hello world",

            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toEqual({

          message:
            "Message sent.",

          messageId: 100,

        });

      }
    );

    test(
  "should return 400 when message is empty",
  async () => {

    const res =
      await request(app)
        .post(
          "/api/messages"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )
        .send({

          conversationId: 1,

          text: "",

        });

    expect(
      res.statusCode
    ).toBe(400);

    expect(
      res.body.message
    ).toBe(
      "Message cannot be empty."
    );

  }
);

test(
  "should return 404 when conversation does not exist",
  async () => {

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callback(
          null,
          []
        );

      }
    );

    const res =
      await request(app)
        .post(
          "/api/messages"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )
        .send({

          conversationId: 999,

          text:
            "Hello world",

        });

    expect(
      res.statusCode
    ).toBe(404);

    expect(
      res.body.message
    ).toBe(
      "Conversation not found."
    );

  }
);

test(
  "should return 403 when users are blocked",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        // conversation exists
        if (
          callCount === 1
        ) {

          callback(
            null,
            [
              {
                id: 1,
                user1Id: 1,
                user2Id: 2,
              },
            ]
          );

        }

        // blocked users found
        else if (
          callCount === 2
        ) {

          callback(
            null,
            [
              {
                blockerId: 2,
                blockedId: 1,
              },
            ]
          );

        }

      }
    );

    const res =
      await request(app)
        .post(
          "/api/messages"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )
        .send({

          conversationId: 1,

          text:
            "Hello world",

        });

    expect(
      res.statusCode
    ).toBe(403);

    expect(
      res.body.message
    ).toBe(
      "Messaging unavailable."
    );

  }
);

test(
  "should return 500 when conversation lookup fails",
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
        .post(
          "/api/messages"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )
        .send({

          conversationId: 1,

          text:
            "Hello world",

        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);

test(
  "should return 500 when block lookup fails",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        // conversation exists
        if (
          callCount === 1
        ) {

          callback(
            null,
            [
              {
                id: 1,
                user1Id: 1,
                user2Id: 2,
              },
            ]
          );

        }

        // block lookup fails
        else if (
          callCount === 2
        ) {

          callback(
            new Error(
              "Database failed"
            )
          );

        }

      }
    );

    const res =
      await request(app)
        .post(
          "/api/messages"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )
        .send({

          conversationId: 1,

          text:
            "Hello world",

        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);

test(
  "should return 500 when message insert fails",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        // conversation exists
        if (
          callCount === 1
        ) {

          callback(
            null,
            [
              {
                id: 1,
                user1Id: 1,
                user2Id: 2,
              },
            ]
          );

        }

        // no block
        else if (
          callCount === 2
        ) {

          callback(
            null,
            []
          );

        }

        // insert message fails
        else if (
          callCount === 3
        ) {

          callback(
            new Error(
              "Database failed"
            )
          );

        }

      }
    );

    const res =
      await request(app)
        .post(
          "/api/messages"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )
        .send({

          conversationId: 1,

          text:
            "Hello world",

        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);

  }
);

// test(
//   "should return 400 when message is empty",
//   async () => {

//     const res =
//       await request(app)
//         .post(
//           "/api/messages"
//         )
//         .set(
//           "Cookie",
//           [
//             `accessToken=${token}`,
//           ]
//         )
//         .send({

//           conversationId: 1,

//           text: "",

//         });

//     expect(
//       res.statusCode
//     ).toBe(400);

//     expect(
//       res.body.message
//     ).toBe(
//       "Message cannot be empty."
//     );

//   }
// );

