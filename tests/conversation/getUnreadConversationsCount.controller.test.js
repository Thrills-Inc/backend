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
  "should return unread conversation count",
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
              unreadConversations: 5,
            },
          ]
        );

      }
    );

    const res =
      await request(app)
        .get(
          "/api/conversations/unread/count"
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
    ).toEqual({

      unreadConversations: 5,

    });

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
          "/api/conversations/unread/count"
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