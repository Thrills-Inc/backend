import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

const token = jwt.sign(
  {
    id: 1,
    isAdmin: false,
  },
  process.env.JWT_SECRET
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
  "Get Relationships Controller",
  () => {

    test(
  "should unfollow user successfully",
  async () => {

    db.query.mockImplementation(
      (q, values, callback) => {

        callback(
          null,
          {
            affectedRows: 1,
          }
        );

      }
    );

    const res =
      await request(app)

        .delete(
          "/api/relationships?userId=2"
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
      res.body
    ).toBe("Unfollow");

  }
);
  }
);