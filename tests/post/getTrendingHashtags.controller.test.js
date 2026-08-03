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
  "Get Trending Hashtags Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return trending hashtags",
      async () => {

        db.query.mockImplementation(
          (q, callback) => {

            callback(
              null,
              [
                {
                  tag: "javascript",
                  count: 20,
                },
                {
                  tag: "react",
                  count: 15,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/posts/trending-hashtags"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(2);

        expect(
          res.body[0].tag
        ).toBe(
          "javascript"
        );

      }
    );

    test(
      "should return empty array when no hashtags exist",
      async () => {

        db.query.mockImplementation(
          (q, callback) => {

            callback(
              null,
              []
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/posts/trending-hashtags"
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
          (q, callback) => {

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
              "/api/posts/trending-hashtags"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);