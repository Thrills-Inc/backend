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
                  tag: "react",
                  totalPosts: 20,
                },
                {
                  id: 2,
                  tag: "nodejs",
                  totalPosts: 15,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/hashtags/trending"
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
      "should support custom limit",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            expect(
              values[0]
            ).toBe(5);

            callback(
              null,
              []
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/hashtags/trending?limit=5"
            );

        expect(
          res.statusCode
        ).toBe(200);

      }
    );

    test(
      "should return empty array",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
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
              "/api/hashtags/trending"
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
              "/api/hashtags/trending"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);