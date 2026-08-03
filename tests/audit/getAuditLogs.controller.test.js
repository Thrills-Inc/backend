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
  "Get Audit Logs Controller",
  () => {

    let token;

    beforeEach(() => {

      jest.clearAllMocks();

      token = jwt.sign(
        {
          id: 99,
          role: "admin",
        },
        process.env.JWT_SECRET
      );

    });

    test(
      "should return audit logs successfully",
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
                  action:
                    "BAN_USER",
                  username:
                    "admin",
                },
                {
                  id: 2,
                  action:
                    "DELETE_POST",
                  username:
                    "admin",
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/audit"
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
        ).toBe(2);

        expect(
          res.body.logs.length
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
              "/api/audit?page=2&limit=10"
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
        ).toBe(10);

      }
    );

    test(
      "should return empty logs",
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
              "/api/audit"
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
          res.body.logs
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
              "/api/audit"
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