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
  "Get Active Stories Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return active stories",
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
                  img: "active1.jpg",
                },
                {
                  id: 2,
                  img: "active2.jpg",
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/stories/active"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(2);

      }
    );

    test(
      "should return empty array",
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
              "/api/stories/active"
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
              "/api/stories/active"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);