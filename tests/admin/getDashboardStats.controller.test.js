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
  "Get Dashboard Stats Controller",
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
      "should return dashboard stats successfully",
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
                  totalUsers: 100,
                  totalPosts: 250,
                  totalComments: 500,
                  totalLikes: 1000,
                  totalMessages: 300,
                  totalConversations: 75,
                  totalReports: 10,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/admin/dashboard"
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
          res.body.totalUsers
        ).toBe(100);

        expect(
          res.body.totalPosts
        ).toBe(250);

        expect(
          res.body.totalReports
        ).toBe(10);

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
              "/api/admin/dashboard"
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