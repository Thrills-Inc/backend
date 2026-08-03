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
  "Get Reports Controller",
  () => {

    let token;

    beforeEach(() => {

      jest.clearAllMocks();

      token = jwt.sign(
        {
          id: 99,
          role: "admin",
        },
        process.env.JWT_SECRET
      );

    });

    test(
      "should return reports successfully",
      async () => {

        db.query.mockImplementation(
          (
            q,
            callback
          ) => {

            callback(
              null,
              [
                {
                  id: 1,
                  reporterId: 2,
                  targetId: 10,
                  targetType: "post",
                  reason: "Spam",
                },
                {
                  id: 2,
                  reporterId: 3,
                  targetId: 11,
                  targetType: "comment",
                  reason: "Abuse",
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/reports"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(2);

        expect(
          res.body[0].reason
        ).toBe("Spam");

      }
    );

    test(
      "should return empty array when no reports exist",
      async () => {

        db.query.mockImplementation(
          (
            q,
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
            .get(
              "/api/reports"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toEqual([]);

      }
    );

    test(
      "should return 500 when database fails",
      async () => {

        db.query.mockImplementation(
          (
            q,
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
            .get(
              "/api/reports"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);