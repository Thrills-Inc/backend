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

jest.unstable_mockModule(
  "../../utils/activityLogger.js",
  () => ({
    logActivity:
      jest.fn(),
  })
);

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

  describe(
  "Register Controller",
  () => {

    test(
  "should return search results",
  async () => {

    const token =
      jwt.sign(
        { id: 1 },
        process.env.JWT_SECRET
      );

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
              type: "user",
              id: 1,
              title: "john",
            },
          ]
        );

      }
    );

    const res =
      await request(app)
        .get(
          "/api/search?q=john"
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
      res.body.query
    ).toBe("john");

    expect(
      res.body.results
    ).toBe(1);

  }
);

test(
  "should return 400 when query missing",
  async () => {

    const token =
      jwt.sign(
        { id: 1 },
        process.env.JWT_SECRET
      );

    const res =
      await request(app)
        .get(
          "/api/search"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        );

    expect(
      res.statusCode
    ).toBe(400);

    expect(
      res.body.message
    ).toBe(
      "Search query is required."
    );

  }
);

test(
  "should return 500 when database fails",
  async () => {

    const token =
      jwt.sign(
        { id: 1 },
        process.env.JWT_SECRET
      );

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
          "/api/search?q=john"
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