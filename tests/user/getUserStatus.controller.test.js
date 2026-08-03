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

jest.unstable_mockModule(
  "../../utils/onlineUsers.js",
  () => ({
    onlineUsers:
      new Set(["1"]),
  })
);

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Get Users Status Controller",
  () => {

    test(
      "should return users status",
      async () => {

        db.query.mockImplementation(
          (q, values, callback) => {

    callback(
      null,
      [
        {
          id: 1,
          lastSeen: "2026-06-10",
        },
      ]
    );

  }
);

const res =
  await request(app)
    .get(
      "/api/users/status/1"
    );

    // .set(
    //   "Cookie",
    //   [
    //     `accessToken=${token}`,
    //   ]
    // );

    expect(
  res.statusCode
).toBe(200);

expect(
  res.body
).toHaveProperty(
  "isOnline"
);

expect(
  res.body.lastSeen
).toBe(
  "2026-06-10"
);
      }
    );
}
);

// test(
//   "should handle user not found",
//   async () => {

//     db.query.mockImplementation(
//   (q, values, callback) => {

//     callback(
//       null,
//       []
//     );

//   }
// );
