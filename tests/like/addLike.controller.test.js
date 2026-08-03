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
  "Add Like Controller",
  () => {

    test(
      "should like post successfully",
      async () => {

        let callCount = 0;

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callCount++;

            // duplicate check
            if (
              callCount === 1
            ) {

              callback(
                null,
                []
              );

            }

            // insert like
            else if (
              callCount === 2
            ) {

              callback(
                null,
                {
                  insertId: 1,
                }
              );

            }

            // notification insert
            else {

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
              "/api/likes"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              postId: 5,
              userId: 2,
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe(
          "Post has been liked."
        );

      }
    );

  }
);

test(
  "should return 400 when post already liked",
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
              id: 1,
            },
          ]
        );

      }
    );

    const res =
      await request(app)

        .post(
          "/api/likes"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          postId: 5,
          userId: 2,
        });

    expect(
      res.statusCode
    ).toBe(400);

    expect(
      res.body.message
    ).toBe(
      "Post already liked."
    );

  }
);

test(
  "should return 500 when duplicate check fails",
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
          "/api/likes"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          postId: 5,
          userId: 2,
        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);

test(
  "should return 500 when like insert fails",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        // duplicate check
        if (
          callCount === 1
        ) {

          callback(
            null,
            []
          );

        }

        // insert like fails
        else {

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
          "/api/likes"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          postId: 5,
          userId: 2,
        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);

test(
  "should like post without notification when user likes own post",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        // duplicate check
        if (
          callCount === 1
        ) {

          callback(
            null,
            []
          );

        }

        // like insert
        else {

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
          "/api/likes"
        )

        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        )

        .send({
          postId: 5,

          // same user as JWT
          userId: 1,
        });

    expect(
      res.statusCode
    ).toBe(200);

    expect(
      res.body
    ).toBe(
      "Post has been liked."
    );

  }
);