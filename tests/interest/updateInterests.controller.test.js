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
  "Update Interests Controller",
  () => {

    let token;

    beforeEach(() => {

      jest.clearAllMocks();

      token = jwt.sign(
        { id: 1 },
        process.env.JWT_SECRET
      );

    });

    test(
      "should update interests successfully",
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
                {}
              );

            } else {

              callback(
                null,
                {}
              );

            }

          }
        );

        const res =
          await request(app)
            .put(
              "/api/interests"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              interests: [
                "sports",
                "music",
              ],
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe(
          "Interests updated."
        );

      }
    );

    test(
      "should clear all interests",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null,
              {}
            );

          }
        );

        const res =
          await request(app)
            .put(
              "/api/interests"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              interests: [],
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe(
          "Interests updated."
        );

      }
    );

    test(
      "should return 400 for invalid interests",
      async () => {

        const res =
          await request(app)
            .put(
              "/api/interests"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              interests:
                "sports",
            });

        expect(
          res.statusCode
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "Invalid interests data."
        );

      }
    );

    test(
      "should return 500 when delete query fails",
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
              "/api/interests"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              interests: [
                "sports",
              ],
            });

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

    test(
      "should return 500 when insert query fails",
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
                {}
              );

            } else {

              callback(
                new Error(
                  "Insert failed"
                )
              );

            }

          }
        );

        const res =
          await request(app)
            .put(
              "/api/interests"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              interests: [
                "sports",
              ],
            });

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);