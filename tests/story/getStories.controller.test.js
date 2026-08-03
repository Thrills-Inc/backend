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
  "Get Stories Controller",
  () => {

    test(
      "should return stories successfully",
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
                  img: "story.jpg",
                  userId: 1,
                },
              ]
            );

          }
        );

        const res =
          await request(app)

            .get(
              "/api/stories"
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
        ).toBe(1);

        expect(
          res.body[0].img
        ).toBe(
          "story.jpg"
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

            .get(
              "/api/stories"
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