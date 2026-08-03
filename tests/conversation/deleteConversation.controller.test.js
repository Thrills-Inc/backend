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
  "should delete conversation successfully",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        if (
          callCount === 1
        ) {

          callback(
            null,
            [
              {
                id: 1,
              },
            ]
          );

        }

        else {

          callback(
            null,
            {
              affectedRows: 1,
            }
          );

        }

      }
    );

    const res =
      await request(app)
        .delete(
          "/api/conversations/1"
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
    ).toBe(
      "Conversation deleted."
    );

  }
);

test(
  "should return 403 when unauthorized",
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
        .delete(
          "/api/conversations/1"
        )
        .set(
          "Cookie",
          [
            `accessToken=${token}`,
          ]
        );

    expect(
      res.statusCode
    ).toBe(403);

    expect(
      res.body.message
    ).toBe(
      "Unauthorized action."
    );

  }
);

test(
  "should return 500 when authorization lookup fails",
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
        .delete(
          "/api/conversations/1"
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

test(
  "should return 500 when delete query fails",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        if (
          callCount === 1
        ) {

          callback(
            null,
            [
              {
                id: 1,
              },
            ]
          );

        }

        else {

          callback(
            new Error(
              "Database failed"
            )
          );

        }

      }
    );

    const res =
      await request(app)
        .delete(
          "/api/conversations/1"
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