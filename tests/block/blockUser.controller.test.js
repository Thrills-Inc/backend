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

const {
  logActivity,
} = await import(
  "../../utils/activityLogger.js"
);

const { default: app } =
  await import("../../app.js");

describe(
  "Block User Controller",
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
      "should block user successfully",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null
            );

          }
        );

        const res =
          await request(app)
            .post(
              "/api/block"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              blockedId: 2,
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe(
          "User blocked."
        );

        expect(
          logActivity
        ).toHaveBeenCalledWith(
          1,
          "block_user",
          2
        );

      }
    );

    test(
      "should return 400 when user blocks themselves",
      async () => {

        const res =
          await request(app)
            .post(
              "/api/block"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              blockedId: 1,
            });

        expect(
          res.statusCode
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "You cannot block yourself."
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
              "/api/block"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              blockedId: 2,
            });

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);