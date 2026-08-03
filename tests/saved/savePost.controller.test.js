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

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Save Post Controller",
  () => {

    test(
      "should save post successfully",
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

              callback(
                null,
                []
              );

            } else {

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
              "/api/saved"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              postId: 5,
            });

        expect(
          res.statusCode
        ).toBe(201);

        expect(
          res.body.message
        ).toBe(
          "Post saved."
        );

        expect(
          res.body.saveId
        ).toBe(10);

      }
    );

    test(
      "should return 400 when postId is missing",
      async () => {

        const res =
          await request(app)

            .post(
              "/api/saved"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({});

        expect(
          res.statusCode
        ).toBe(400);

      }
    );

    test(
      "should return 400 when post already saved",
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
              "/api/saved"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              postId: 5,
            });

        expect(
          res.statusCode
        ).toBe(400);

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

            .post(
              "/api/saved"
            )

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              postId: 5,
            });

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);