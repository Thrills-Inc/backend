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
  "Get Trending Searches Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return trending searches successfully",
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
                  keyword:
                    "javascript",

                  searches: 25,
                },
                {
                  keyword:
                    "react",

                  searches: 18,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/search/trending"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(2);

        expect(
          res.body[0].keyword
        ).toBe(
          "javascript"
        );

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
              "/api/search/trending"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);