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
  "Add Interests Controller",
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
      "should add interests successfully",
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
                affectedRows: 3,
              }
            );

          }
        );

        const res =
          await request(app)
            .post(
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
                "tech",
              ],
            });

        expect(
          res.statusCode
        ).toBe(201);

        expect(
          res.body.message
        ).toBe(
          "Interests added successfully."
        );

        expect(
          res.body.added
        ).toBe(3);

      }
    );

    test(
      "should return 400 when interests array is empty",
      async () => {

        const res =
          await request(app)
            .post(
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
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "Interests are required."
        );

      }
    );

    test(
      "should return 400 when interests is invalid",
      async () => {

        const res =
          await request(app)
            .post(
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
          "Interests are required."
        );

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