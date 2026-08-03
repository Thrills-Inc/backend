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
  "Get Search Users Controller",
  () => {

    test(
      "should return search users",
      async () => {

        db.query.mockImplementation(
          (q, values, callback) => {

    callback(
      null,
      [
        {
          id: 1,
          username: "john",
          name: "John Doe",
        },
      ]
    );

  }
);

const res =
  await request(app)

    .get(
      "/api/users/search?q=john"
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
  res.body[0].username
).toBe("john");

      }
    );
}
);