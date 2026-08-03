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
  "Add Relationship Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should follow user successfully",
      async () => {

        let callCount = 0;

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callCount++;

            // block check
            if (
              callCount === 1
            ) {
              return callback(
                null,
                []
              );
            }

            // already following check
            if (
              callCount === 2
            ) {
              return callback(
                null,
                []
              );
            }

            // insert relationship
            if (
              callCount === 3
            ) {
              return callback(
                null,
                {
                  affectedRows: 1,
                }
              );
            }

          }
        );

        const res =
          await request(app)

            .post(
              "/api/relationships"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              userId: 2,
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe("Following");

      }
    );

  }
);

test(
  "should not allow self follow",
  async () => {

    const res =
      await request(app)

        .post(
          "/api/relationships"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          userId: 1,
        });

    expect(
      res.statusCode
    ).toBe(400);

    expect(
      res.body.message
    ).toBe(
      "You cannot follow yourself."
    );

  }
);

test(
  "should reject already followed user",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        if (
          callCount === 1
        ) {
          return callback(
            null,
            []
          );
        }

        if (
          callCount === 2
        ) {
          return callback(
            null,
            [
              {
                followerUserId: 1,
                followedUserId: 2,
              },
            ]
          );
        }

      }
    );

    const res =
      await request(app)

        .post(
          "/api/relationships"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          userId: 2,
        });

    expect(
      res.statusCode
    ).toBe(400);

    expect(
      res.body.message
    ).toBe(
      "Already following this user."
    );

  }
);

test(
  "should reject blocked user",
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
              blockerId: 2,
            },
          ]
        );

      }
    );

    const res =
      await request(app)

        .post(
          "/api/relationships"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          userId: 2,
        });

    expect(
      res.statusCode
    ).toBe(403);

    expect(
      res.body.message
    ).toBe(
      "Cannot follow this user."
    );

  }
);

test(
  "should handle database error",
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
          "/api/relationships"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          userId: 2,
        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);