import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";


const JWT_SECRET =
  process.env.JWT_SECRET ||
  "testsecret";
  
const adminToken = jwt.sign(
  {
    id: 1,
    role: "admin",
  },
  process.env.JWT_SECRET || "testsecret"
);

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
  "Get Platform Stats Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return platform statistics",
      async () => {

        db.query.mockImplementation(
          (q, callback) => {

            callback(
              null,
              [
                {
                  totalUsers: 100,
                  totalPosts: 250,
                  totalComments: 500,
                  totalLikes: 1000,
                  totalMessages: 300,
                  totalConversations: 50,
                },
              ]
            );

          }
        );

        const res = await request(app)
  .get("/api/analytics/stats")
  .set(
    "Authorization",
    `Bearer ${adminToken}`
  );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/analytics/stats"
        //     );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.totalUsers
        ).toBe(100);

        expect(
          res.body.totalPosts
        ).toBe(250);

      }
    );

    test(
      "should return 500 when database fails",
      async () => {

        db.query.mockImplementation(
          (q, callback) => {

            callback(
              new Error(
                "Database failed"
              )
            );

          }
        );

        const res = await request(app)
  .get("/api/analytics/stats")
  .set(
    "Authorization",
    `Bearer ${adminToken}`
  );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/analytics/stats"
        //     );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);