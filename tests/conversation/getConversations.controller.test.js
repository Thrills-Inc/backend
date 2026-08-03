import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

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
  "Get Conversations Controller",
  () => {

    let token;

    beforeEach(() => {

      jest.clearAllMocks();

      token = jwt.sign(
        {
          id: 1,
        },
        process.env.JWT_SECRET
      );

    });

    test(
      "should return conversations successfully",
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
                  otherUserId: 2,
                  name: "John",
                  username: "john",
                  lastMessage: "Hello",
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/conversations"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.results
        ).toBe(1);

        expect(
          res.body.conversations[0].id
        ).toBe(1);

      }
    );

    test(
      "should return empty conversations list",
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
              "/api/conversations"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.results
        ).toBe(0);

        expect(
          res.body.conversations
        ).toEqual([]);

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
              "/api/conversations?page=2&limit=5"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
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
              "/api/conversations"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);