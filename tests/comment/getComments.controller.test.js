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
  "Get Comments Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return comments successfully",
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
                  desc: "Nice post",
                  userId: 2,
                },
                {
                  id: 2,
                  desc: "Awesome",
                  userId: 3,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/comments?postId=1"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.results
        ).toBe(2);

        expect(
          res.body.comments.length
        ).toBe(2);

      }
    );

    test(
      "should return empty comments array",
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
              "/api/comments?postId=1"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.results
        ).toBe(0);

        expect(
          res.body.comments
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
              "/api/comments?postId=1"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);