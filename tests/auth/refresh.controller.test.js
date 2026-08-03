import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

process.env.JWT_REFRESH_SECRET =
  "test-refresh-secret";

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
  "Refresh Controller",
  () => {

    test(
      "should reject missing refresh token",
      async () => {

        const res =
          await request(app)
            .post(
              "/api/auth/refresh-token"
            );

        expect(
          res.statusCode
        ).toBe(401);

      }
    );

  }
);


test(
  "should reject revoked token",
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

        .post(
          "/api/auth/refresh-token"
        )

        .set(
          "Cookie",
          [
            "refreshToken=fake-token",
          ]
        );

    expect(
      res.statusCode
    ).toBe(403);

  }
);


test(
  "should reject invalid token",
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
              token:
                "invalid-token",
            },
          ]
        );

      }
    );

    const res =
      await request(app)

        .post(
          "/api/auth/refresh-token"
        )

        .set(
          "Cookie",
          [
            "refreshToken=invalid-token",
          ]
        );

    expect(
      res.statusCode
    ).toBe(403);

  }
);

test(
  "should refresh access token",
  async () => {

    const refreshToken =
      jwt.sign(
        { id: 1 },
        process.env.JWT_REFRESH_SECRET
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
              token:
                refreshToken,
            },
          ]
        );

      }
    );

    const res =
      await request(app)

        .post(
          "/api/auth/refresh-token"
        )

        .set(
          "Cookie",
          [
            `refreshToken=${refreshToken}`,
          ]
        );

    expect(
      res.statusCode
    ).toBe(200);

    expect(
      res.headers["set-cookie"]
    ).toBeDefined();

  }
);

