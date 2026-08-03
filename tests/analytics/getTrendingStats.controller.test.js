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
  "Get Trending Stats Controller",
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
                  tag: "react",
                  totalPosts: 25,
                },
                {
                  tag: "nodejs",
                  totalPosts: 18,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/analytics/trending"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(2);

        expect(
          res.body[0].tag
        ).toBe("react");

      }
    );

    test(
      "should return empty array",
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
              "/api/analytics/trending"
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
              "/api/analytics/trending"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);