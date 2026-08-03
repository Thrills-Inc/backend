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
  "Get Suggested Users Controller",
  () => {

    test(
      "should return suggested users",
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
                  id: 2,
                  name: "Jane",
                  profilePic:
                    "jane.jpg",
                },
              ]
            );

          }
        );

        const res =
          await request(app)

            .get(
              "/api/users/suggested/1"
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
        ).toHaveLength(1);

        expect(
          res.body[0].name
        ).toBe("Jane");

      }
    );

  }
);

test(
  "should handle database error",
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
          "/api/users/suggested/1"
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
  "should return empty array when no suggestions exist",
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
          "/api/users/suggested/1"
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
    ).toEqual([]);

  }
);