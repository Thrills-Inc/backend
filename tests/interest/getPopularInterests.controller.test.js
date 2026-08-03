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
  "Get Popular Interests Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return popular interests",
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
                  category:
                    "sports",

                  usersCount: 25,
                },
                {
                  category:
                    "music",

                  usersCount: 18,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/interests/popular"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(2);

        expect(
          res.body[0].category
        ).toBe(
          "sports"
        );

      }
    );

    test(
      "should return empty array when no interests exist",
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
              "/api/interests/popular"
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
              "/api/interests/popular"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);