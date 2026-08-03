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
  "Get RelationshipsCount Controller",
  () => {

    test(
  "should return relationship counts",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        if (callCount === 1) {

          return callback(
            null,
            [
              {
                followersCount: 10,
              },
            ]
          );

        }

        if (callCount === 2) {

          return callback(
            null,
            [
              {
                followingCount: 5,
              },
            ]
          );

        }

      }
    );

    const res =
      await request(app)
        .get(
          "/api/relationships/count?userId=1"
        );

    expect(
      res.statusCode
    ).toBe(200);

    expect(
      res.body
    ).toEqual({
      followersCount: 10,
      followingCount: 5,
    });

  }
);
  }
);

test(
  "should handle followers query error",
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
          "/api/relationships/count?userId=1"
        );

    expect(
      res.statusCode
    ).toBe(500);

  }
);

test(
  "should handle following query error",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        if (callCount === 1) {

          return callback(
            null,
            [
              {
                followersCount: 10,
              },
            ]
          );

        }

        if (callCount === 2) {

          return callback(
            new Error(
              "Database failed"
            )
          );

        }

      }
    );

    const res =
      await request(app)
        .get(
          "/api/relationships/count?userId=1"
        );

    expect(
      res.statusCode
    ).toBe(500);

  }
);
