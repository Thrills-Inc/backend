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

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Get Recent Notifications Controller",
  () => {

    test(
      "should return recent notifications",
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
                  type: "like",
                  senderId: 2,
                },
                {
                  id: 2,
                  type: "follow",
                  senderId: 3,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/notifications/recent"
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
          res.body[0].type
        ).toBe("like");

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
            .get(
              "/api/notifications/recent"
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