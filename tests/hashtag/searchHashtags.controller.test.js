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
  "Search Hashtags Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return matching hashtags",
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
                  totalPosts: 10,
                },
                {
                  id: 2,
                  tag: "reactjs",
                  totalPosts: 5,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/hashtags/search?q=react"
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
      "should return empty array when no hashtags match",
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
              "/api/hashtags/search?q=unknown"
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
      "should return 400 when search query is missing",
      async () => {

        const res =
          await request(app)
            .get(
              "/api/hashtags/search"
            );

        expect(
          res.statusCode
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "Search query is required."
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
              "/api/hashtags/search?q=react"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);