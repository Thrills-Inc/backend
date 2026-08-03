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
  "../../sockets/socketInstance.js",
  () => ({
    getIO: () => ({
      to: () => ({
        emit: jest.fn(),
      }),
    }),
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
  "Add Comment Controller",
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
      "should create comment successfully",
      async () => {

        let callCount = 0;

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callCount++;

            // INSERT COMMENT
            if (
              callCount === 1
            ) {

              callback(
                null,
                {
                  insertId: 10,
                }
              );

            }

            // GET POST OWNER
            else if (
              callCount === 2
            ) {

              callback(
                null,
                [
                  {
                    userId: 2,
                  },
                ]
              );

            }

            // INSERT NOTIFICATION
            else if (
              callCount === 3
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
              "/api/comments"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              desc:
                "Nice post",
              postId: 5,
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe(
          "Comment has been created."
        );

      }
    );

  }
);