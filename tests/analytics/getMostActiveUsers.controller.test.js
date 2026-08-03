import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

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
  "Get Most Active Users Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return most active users",
      async () => {

        db.query.mockImplementation(
          (q, callback) => {

            callback(
              null,
              [
                {
                  id: 1,
                  name: "John Doe",
                  username: "john",
                  postsCount: 50,
                },
                {
                  id: 2,
                  name: "Jane Doe",
                  username: "jane",
                  postsCount: 35,
                },
              ]
            );

          }
        );

        const res = await request(app)
  .get("/api/analytics/active-users")
  .set(
    "Authorization",
    `Bearer ${adminToken}`
  );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/analytics/active-users"
        //     );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(2);

        expect(
          res.body[0].username
        ).toBe("john");

        expect(
          res.body[0].postsCount
        ).toBe(50);

      }
    );

    test(
      "should return empty array when no users exist",
      async () => {

        db.query.mockImplementation(
          (q, callback) => {

            callback(
              null,
              []
            );

          }
        );

        const res = await request(app)
  .get("/api/analytics/active-users")
  .set(
    "Authorization",
    `Bearer ${adminToken}`
  );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/analytics/active-users"
        //     );

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
          (q, callback) => {

            callback(
              new Error(
                "Database failed"
              )
            );

          }
        );

        const res = await request(app)
  .get("/api/analytics/active-users")
  .set(
    "Authorization",
    `Bearer ${adminToken}`
  );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/analytics/active-users"
        //     );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);