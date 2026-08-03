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
  "Get Posts By Hashtag Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return hashtag posts successfully",
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
                  desc: "Post 1",
                },
                {
                  id: 2,
                  desc: "Post 2",
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/hashtags/react"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.hashtag
        ).toBe("react");

        expect(
          res.body.results
        ).toBe(2);

      }
    );

    test(
      "should support pagination",
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
              "/api/hashtags/react?page=2&limit=5"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.page
        ).toBe(2);

        expect(
          res.body.limit
        ).toBe(5);

      }
    );

    test(
      "should return empty posts",
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
              "/api/hashtags/react"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.results
        ).toBe(0);

        expect(
          res.body.posts
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
              "/api/hashtags/react"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);