import request from "supertest";
import { jest } from "@jest/globals";

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
  "Get Likes Controller",
  () => {

    test(
      "should return likes successfully",
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
                  userId: 1,
                },
                {
                  userId: 2,
                },
                {
                  userId: 3,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/likes?postId=1"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toEqual([
          1,
          2,
          3,
        ]);

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
              "/api/likes?postId=1"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);