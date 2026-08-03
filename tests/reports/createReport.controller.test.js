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

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Create Report Controller",
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
      "should create report successfully",
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
            .post(
              "/api/reports"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({

              targetId: 5,

              targetType:
                "post",

              reason:
                "Spam content",

            });

        expect(
          res.statusCode
        ).toBe(201);

        expect(
          res.body
        ).toBe(
          "Report submitted."
        );

      }
    );

    test(
      "should return 400 when fields are missing",
      async () => {

        const res =
          await request(app)
            .post(
              "/api/reports"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({

              targetId: 5,

            });

        expect(
          res.statusCode
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "All fields are required."
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
              "/api/reports"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({

              targetId: 5,

              targetType:
                "post",

              reason:
                "Spam content",

            });

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);